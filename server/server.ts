import { resolveSoa } from "dns";
import express from "express";

const PORT: number | string = process.env.PORT || 8497;

/**
 *@name Constants
 *@param {string} spotifyClientId - Your Spotify app client_id
 */

import constants from "./secret";

const app = express();

app.get("/api/loginWithSpotify", (req, res) => {
  let spotifyLoginSettings = {
    client_id: constants.spotifyClientId,
    response_type: "code",
    redirect_uri: "http://localhost:8497/proceedLogin", //DEV
    show_dialog: "true", //DEV
    //TODO: Use the state parameter - state: "MAKE THIS",
    scope: "user-read-recently-played", //TODO: Add the suitable scopes
  };
  res.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams(
      spotifyLoginSettings
    )}`
  );
});

app.get("/api/generateToken", (req, res) => {
  if (!req.query.code)
    return res
      .status(400)
      .send(JSON.stringify({ error: true, errorMessage: "NO_CODE" }));
});

app.all("*", (req, res) => {
  res.send(`Hello, Statistify! (The UI will be there)`);
});

function log(message: string, isError?: boolean): void {
  let nowDate: Date = new Date();

  //Format the date into HH:mm:ss dd.MM.yyyy
  let nowString = `${addZero(nowDate.getHours())}:${addZero(
    nowDate.getMinutes()
  )}:${addZero(nowDate.getSeconds())} ${addZero(nowDate.getDate())}.${addZero(
    nowDate.getMonth() + 1
  )}.${nowDate.getFullYear()}`;

  console.log(`[${isError ? "ERROR" : "LOG"}] [${nowString}] ${message}`);
}

function addZero(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

app.listen(PORT, (): void => {
  log(`App has started on the port ${PORT}`);
});
