let _genres = [], _artists = [], _matchArtists = [], _matchGenres = [];

function getUserInfo() {
  let userProfileTemplate = '';
  const userProfilePlaceholder = document.getElementById('user-profile'),
    location = window.location.search,
    params = new URLSearchParams(location),
    error = params.get('error'),
    login = document.getElementById('login'),
    loggedin = document.getElementById('loggedin'),
    friend_id = params.get('friend_id'),
    user_id = params.get('user_id');

  if (params.has('error')) {
    alert('There was an error during the authentication');
  } else {
    login.style.display = "block";
    loggedin.style.display = "none";
    if (params.has('user_id')) {
      fetch('/templates/profile.hbs')
        .then(temp => temp.text())
        .then(temp => {
          userProfileTemplate = Handlebars.compile(temp);
          return fetch(`/me/${user_id}`)
        })
        .then(res => res.json())
        .then(res => {
          login.style.display = "none";
          loggedin.style.display = "block";
          if (params.has('friend_id')) {
            document.getElementById('match_taste_btn').style.display = 'none';
            fetch(`/me/${friend_id}`)
              .then(res_f => res_f.json())
              .then(res_f => {
                userProfilePlaceholder.innerHTML = `
                  <div class="row w-card m-auto">
                      <div class="col-12 col-md-6">
                          <div class="card flex-row box-shadow mx-auto my-2 black-bg">
                              ${userProfileTemplate({...res, onClick: 'logout'})}
                          </div>
                      </div>
                      <div class="col-12 col-md-6">
                          <div class="card flex-row box-shadow mx-auto my-2 black-bg">
                              ${userProfileTemplate({...res_f, onClick: 'removeFriend'})}
                          </div>
                      </div>
                  </div>
                `;
                matchTaste();
              })
          } else {
            userProfilePlaceholder.innerHTML = `
                <div class="card flex-row box-shadow mx-auto my-3 black-bg w-60">
                    ${userProfileTemplate({...res, onClick: 'logout'})}
                </div>`;
          }
        })
    }
  }
}

function getGenre() {
  let genreTemplate = '',
    artistTemplate = '';
  const genrePlaceholder = document.getElementById('genre-data'),
    artistPlaceholder = document.getElementById('artist-data'),
    genres_table = document.getElementById('genres'),
    location = window.location.search,
    params = new URLSearchParams(location);
  const user_id = params.get('user_id'), friend_id = params.get('friend_id');

  genres_table.style.display = 'flex'
  setTimeout(function () {
    genres_table.classList.add('opacity-100');
  }, 20);
  fetch('/templates/top_genres.hbs')
    .then(res => res.text())
    .then(res => {
      genreTemplate = Handlebars.compile(res);
      return fetch(`/templates/top_artist.hbs`)
    })
    .then(res => res.text())
    .then(res => {
      artistTemplate = Handlebars.compile(res);
      return fetch(`/playlists/${user_id}/genres`)
    })
    .then(res => res.json())
    .then(res => {
      const artists = res.artists, genres = res.genres;
      genres.forEach((genre, i) => {
        _genres.push(genreTemplate({
          number: i + 1,
          name: genre.name.toUpperCase(),
          count: genre.count
        }))
      })
      artists.forEach((artist, i) => {
        console.log(artist.image);
        _artists.push(artistTemplate({
          image: (artist.image && artist.image.length > 0) ? artist.image[0].url : null,
          number: i + 1,
          name: artist.name,
          count: artist.count,
          url: artist.href
        }))
      })
    })
    .then(res => {
      genrePlaceholder.innerHTML = _genres.slice(0, 5).join('');
      artistPlaceholder.innerHTML = _artists.slice(0, 5).join('');
      document.getElementById('get_genre_btn').classList.add('fade-up');
    })
}

function getFriendId(e) {
  const location = window.location.search;
  const params = new URLSearchParams(location);
  e.target.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  let url = '';
  try {
    url = new URL(document.getElementById('friendUrl').value);
  } catch (e) {
    url = false;
  }
  if (url) {
    if ((url.host == 'open.spotify.com' && url.pathname.split('/')[1] == 'user') && params.has('user_id')) {
      params.append('friend_id', url.pathname.split('/')[2]);
      window.location.href = '/?' + params;
      return;
    }
  }
  alert('Not a valid URL!')
  e.target.innerHTML = 'Submit'
}

function matchTaste() {
  let mGenreTemplate = '',
    mArtistTemplate = '';
  const mGenreP = document.getElementById('match-genre-data'),
    mArtistP = document.getElementById('match-artist-data'),
    match = document.getElementById('match');
  const location = window.location.search;
  const params = new URLSearchParams(location);
  const user_id = params.get('user_id'), friend_id = params.get('friend_id');
  let htmlA = '', htmlG = '';

  match.style.display = 'flex'
  setTimeout(function () {
    match.classList.add('opacity-100');
  }, 20);
  if (params.has('user_id') && params.has('friend_id')) {
    fetch('/templates/match_artist.hbs')
      .then(res => res.text())
      .then(res => {
        mArtistTemplate = Handlebars.compile(res);
        return fetch('/templates/match_genre.hbs')
      })
      .then(res => res.text())
      .then(res => {
        mGenreTemplate = Handlebars.compile(res);
        return fetch(`/match/${user_id}/${friend_id}`);
      })
      .then(res => res.json())
      .then(res => {
        const userData = res.user_data.display_name,
          friendData = res.friend_data.display_name,
          artists = res.artists,
          genres = res.genres;

        artists.forEach((artist, i) => {
          _matchArtists.push(mArtistTemplate({
            image: (artist.image) ? artist.image[0].url : null,
            number: i + 1,
            artist_name: artist.name,
            user_name: userData,
            user_count: artist.count[0],
            friend_name: friendData,
            friend_count: artist.count[1],
            score: artist.score.toFixed(2),
            url: artist.href
          }))
        })
        genres.forEach((genre, i) => {
          _matchGenres.push(mGenreTemplate({
            number: i + 1,
            genre_name: genre.name.toUpperCase(),
            user_name: userData,
            user_count: genre.count[0],
            friend_name: friendData,
            friend_count: genre.count[1],
            score: genre.score.toFixed(2)
          }))
        })

        mGenreP.innerHTML = _matchGenres.slice(0, 5).join('');
        mArtistP.innerHTML = _matchArtists.slice(0, 5).join('');
        match.style.display = "flex";
      })
  }
}

function getUrl() {
  const url = new URL(document.getElementById('url').value);
  if (url.host == 'open.spotify.com' && url.pathname.split('/')[1] == 'user') {
    window.location.href = '/?' + new URLSearchParams({ user_id: url.pathname.split('/')[2] });
  } else {
    alert('Wrong link!');
  }
}

function logout() {
  window.location.href = '/';
}

function removeFriend() {
  const location = window.location.search,
  params = new URLSearchParams(location),
  user_id = params.get('user_id');
  window.location.href = `/?user_id=${user_id}`;
}

function renderList(source, array, end, func) {
  let html = '';
  for (let i = 0; i < end; i++) {
    html += func(array[i])
  }
}