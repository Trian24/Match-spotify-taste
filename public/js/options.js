const redirect_uri = 'http://localhost:8888/callback',
  client_id = 'acf9cb927d5f4e05b950ec62381f76f1',
  client_secret = 'bed105b30a7b44ba8e63521bee82d545',
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