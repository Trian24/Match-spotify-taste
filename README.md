# Match-spotify-taste
An application to match your spotify public playlist with your friend. 
Available to use in https://match-taste.herokuapp.com/

## What this app does
1. Finding your top genres and artists based on tracks available in your public playlists
2. Getting matching artists and genres with your friend's taste based on their public playlists

## Prerequisite
You need to have a Spotify Developer account and setup your application in the Spotify Dev Dashboard.
Follow the guide from https://developer.spotify.com/documentation/general/guides/authorization/app-settings/ to get your Client ID and Client Secret so you can install this app for yourself

## Installation
### Cloning the repository
Clone the repository to your folder using command:
```
git clone https://github.com/renalditri/Match-spotify-taste.git
```
Install the required packages using 
```
npm install
```
### Setting up environment variable
Make .env file in the root folder, and fill it with your own client ID and client Secret
Example .env file:
```
HOSTNAME=*Your application hostname (Example: "http://localhost:5500/")*
PORT=*Your application port (Example: "5500")*
CLIENT_ID=*Client ID you got from your Spotify Dev Dashboard*
CLIENT_SECRET=*Client Secret you got from your Spotify Dev Dashboard*
```
### Running the application
Run `npm start` in the root of the folder and the application will be running on your desired port
