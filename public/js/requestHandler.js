import { authHandler, errorHandler } from './handler.js';
import { client_id, client_secret } from './options.js';
import fetch from "node-fetch";

const authOptions = {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=client_credentials'
};

class requestHandler {

  static async getGenres(req, res) {
    const user_id = req.params.user_id;
    await this.getTaste(user_id)
      .then(resp => {
        res.send(resp)
      })
      .catch(err => errorHandler(err, res))
  }

  static async getTaste(user_id) {
    let access_token = '',
      artists_array = [],
      playlists_array = [];

    const sortArtists = (resp) => {
      let artists_array = [];
      resp.forEach(r => {
        r.items.forEach(item => {
          item.track.artists.forEach(artist => {
            if (artists_array.findIndex((arr => arr.id === artist.id)) !== -1) {
              artists_array[artists_array.findIndex((arr => arr.id === artist.id))].count++;
            } else {
              artists_array.push({ id: artist.id, name: artist.name, count: 1 });
            }
          })
        })
      })
      return artists_array;
    }

    const sortGenres = (resp, artists) => {
      let genres = [];
      resp.forEach(r => {
        r['artists'].forEach(artist => {
          const curr_artist = artists[artists.findIndex(a => a.id == artist.id)];
          artist.genres.forEach(genre => {
            const found_index = genres.findIndex((g => g.name == genre));
            artists[artists.findIndex(a => a.id == artist.id)].image = artist.images;
            if (found_index !== -1) {
              if (genres[found_index].artists.findIndex(a => a.id == artist.id) == -1) {
                genres[found_index].artists.push({ id: artist.id, name: artist.name });
                genres[found_index].count += curr_artist.count;
              }
            } else {
              genres.push({ name: genre, count: curr_artist.count, artists: [{ id: artist.id, name: artist.name }] });
            }
          })
        })
      })
      return genres;
    }

    return fetch('https://accounts.spotify.com/api/token', authOptions)
      .then(resp => authHandler(resp))
      .then(resp => {
        access_token = resp.access_token;
        console.log(access_token);
        return fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
          headers: {
            'Authorization': 'Bearer ' + access_token
          }
        })
      })
      .then(resp => authHandler(resp))
      .then(resp => {
        let received_playlists = resp.items;
        return Promise.all(received_playlists.map(playlist => {
          playlists_array.push({ id: playlist.id, name: playlist.name });
          return fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            headers: {
              'Authorization': 'Bearer ' + access_token
            }
          }).then(resp => resp.json())
        }))
      })
      .then(resp => sortArtists(resp))
      .then(resp => {
        let _temp = [];
        artists_array = resp;
        const artist_ids = resp.map(artist => {
          return artist.id;
        })
        const _length = Math.ceil(resp.length / 50)
        for (let i = 0; i <= _length - 1; i++) {
          let start = i * 50;
          let end = (i == _length - 1) ? (resp.length) : i * 50 + 50;
          _temp.push(artist_ids.slice(start, end).filter(n => n).join(','));
        }

        return Promise.all(_temp.map(ids => {
          return fetch(`https://api.spotify.com/v1/artists?ids=${ids}`, {
            headers: {
              'Authorization': 'Bearer ' + access_token
            }
          }).then(resp => resp.json())
        }))
      })
      .then(resp => sortGenres(resp, artists_array))
      .then(resp => {
        resp.sort((a, b) => b.count - a.count);
        artists_array.sort((a, b) => b.count - a.count);
        const finished = { playlists_array, artists: artists_array, genres: resp }
        return finished;
      })
  }

  static async getUser(req, res) {
    const user_id = req.params.user_id;
    await this.getUserData(user_id)
      .then(resp => {
        res.send(resp)
      })
      .catch(err => errorHandler(err))
  }

  static async getUserData(user_id) {
    let access_token = '';
    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
      .then(resp => authHandler(resp))
      .then(resp => {
        access_token = resp.access_token;
        return fetch(`https://api.spotify.com/v1/users/${user_id}`, {
          headers: {
            'Authorization': 'Bearer ' + access_token
          }
        })
      })
      .then(resp => authHandler(resp))
      .then(resp => {
        return resp;
      })
  }

  static async matchTaste(req, res) {
    let firstPlyst = await this.getTaste(req.params.user_id);
    let secondPlyst = await this.getTaste(req.params.friend_id);
    let userData = await this.getUserData(req.params.user_id);
    let friendData = await this.getUserData(req.params.friend_id);
    let result = { artists: [], genres: [] };

    firstPlyst.artists.forEach(item_1 => {
      console.log(item_1);
      const found = secondPlyst.artists.filter(item_2 => item_2.id == item_1.id)[0];
      if (found) result.artists.push({
        id: found.id,
        name: found.name,
        count: [item_1.count, found.count],
        image: item_1.image,
        score: (Math.min(...[item_1.count, found.count]) / Math.max(...[item_1.count, found.count]) * (item_1.count + found.count))
      })
    })

    firstPlyst.genres.forEach(item_1 => {
      const found = secondPlyst.genres.filter(item_2 => item_2.name == item_1.name)[0];
      if (found) result.genres.push({
        name: found.name,
        count: [item_1.count, found.count],
        score: (Math.min(...[item_1.count, found.count]) / Math.max(...[item_1.count, found.count]) * (item_1.count + found.count))
      })
    })
    result.user_data = userData;
    result.friend_data = friendData;
    result.artists.sort((a, b) => b.score - a.score);
    result.genres.sort((a, b) => b.score - a.score);
    res.send(result);
  }
}
export { requestHandler };