const redirect_uri = `${process.env.HOSTNAME}callback`,
  client_id = process.env.CLIENT_ID,
  client_secret = process.env.CLIENT_SECRET,
  generateRandomString = function (length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  stateKey = 'spotify_auth_state',
  scope = 'user-top-read';

export {redirect_uri, client_id, client_secret, generateRandomString, stateKey, scope};