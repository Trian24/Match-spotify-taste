/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
// var querystring = require('querystring');
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { redirect_uri, client_id, client_secret, generateRandomString, stateKey, scope } from './public/js/options.js';
import { authHandler, errorHandler } from './public/js/handler.js';
import { requestHandler } from './public/js/requestHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
var app = express();
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(express.urlencoded({ extended: true }));

app.get('/login', function (req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })
  );
});

app.get('/callback', function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' + new URLSearchParams('error=state_mismatch'));
  } else {
    res.clearCookie(stateKey);

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`
    })
      .then(resp => resp.json())
      .then(resp => {
        console.log(resp);
        var access_token = resp.access_token;
        // use the access token to access the Spotify Web API
        fetch('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': 'Bearer ' + access_token },
        })
          .then(resp => authHandler(resp))
          .then(resp => {
            console.log(resp);
            res.redirect('/#' + new URLSearchParams(`user_id=${resp.id}`)
            )
          })
          .catch(err => {
            // console.log(err);
            res.redirect('/#' + new URLSearchParams(`#error=invalid_token`));
          })
      })
      .catch(err => {
        console.log(err)
      })
  }
})

app.get('/me/:user_id', async (req, res) => requestHandler.getUser(req, res))

app.get('/playlists/:user_id/genres', async (req, res) => requestHandler.getGenres(req, res));

app.get('/match/:user_id/:friend_id', async (req, res) => requestHandler.matchTaste(req, res));

console.log('Listening on 8888');
app.listen(8888);
