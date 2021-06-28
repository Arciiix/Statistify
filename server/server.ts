import { resolveSoa } from "dns";
import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import cookieParser from "cookie-parser";

const PORT: number | string = process.env.PORT || 8497;

/**
 *@name Constants
 *@param {string} spotifyClientId - Your Spotify app client_id
 *@param {string} spotifyClientSecret - Your Spotify app client_secret
 *@param {string} jwtSecret - Your jsonwebtoken (JWT) secret key
 */

import constants from "./secret";
import { Console } from "console";

const app = express();

app.use(cookieParser());

app.get("/api/validateToken", async (req, res) => {
  if (!req.query.token)
    return res.status(400).send({ error: true, errorMessage: "NO_TOKEN" });

  let validation = await validateJWTToken(req.query.token as string);

  res.send(validation);
});

app.get("/api/loginWithSpotify", (req, res) => {
  let spotifyLoginSettings = {
    client_id: constants.spotifyClientId,
    response_type: "code",
    redirect_uri: "http://localhost:3000/proceedLogin", //DEV
    show_dialog: "true", //DEV
    //TODO: Use the state parameter - state: "MAKE THIS",
    scope: "user-read-recently-played user-read-playback-state", //TODO: Add the suitable scopes
  };
  res.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams(
      spotifyLoginSettings
    )}`
  );
});

app.get("/api/generateToken", async (req, res) => {
  if (!req.query.code) {
    return res
      .status(400)
      .send(JSON.stringify({ error: true, errorMessage: "NO_CODE" }));
  }

  let spotifyRequestBody = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: "http://localhost:3000/proceedLogin", //DEV
  };

  let spotifyRequestBodySerialised = Object.keys(spotifyRequestBody)
    .map((key) => {
      return (
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(spotifyRequestBody[key])
      );
    })
    .join("&");

  let spotifyRequest = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        constants.spotifyClientId + ":" + constants.spotifyClientSecret
      ).toString("base64")}`,
    },
    body: spotifyRequestBodySerialised,
  });
  let spotifyRequstRes = await spotifyRequest.json();
  console.log(spotifyRequstRes);

  if (spotifyRequstRes.error) {
    return res
      .status(500)
      .send({ error: true, errorMessage: JSON.stringify(spotifyRequstRes) });
  } else {
    let tokenPayload = {
      token: spotifyRequstRes.access_token,
      //TODO: Use the "refresh-token" as well
    };

    let token = jwt.sign(tokenPayload, constants.jwtSecret, {
      expiresIn: "3600s",
    });
    res.cookie("token", token, { httpOnly: true });

    res.send({ token });
  }
});

app.get("/api/getUserData", async (req, res) => {
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.send(tokenValidation);

  //Get the user data from the Spotify API

  let basicUserInfoReq = await fetch(`https://api.spotify.com/v1/me`, {
    headers: {
      Authorization: `Bearer ${tokenValidation.payload.token}`,
    },
  });

  let basicUserInfo = await basicUserInfoReq.json();

  if (basicUserInfo.error) {
    return res.send({
      error: true,
      errorMessage: JSON.stringify(basicUserInfo),
    });
  }

  let currentTrackReq = await fetch(`https://api.spotify.com/v1/me/player`, {
    headers: {
      Authorization: `Bearer ${tokenValidation.payload.token}`,
    },
  });
  let currentTrack: any = await currentTrackReq.text();

  if (currentTrack == "") {
    let currentTrackAnotherRes = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=1`,
      {
        headers: {
          Authorization: `Bearer ${tokenValidation.payload.token}`,
        },
      }
    );
    currentTrack = await (await currentTrackAnotherRes.json()).items[0].track;
  } else {
    currentTrack = JSON.parse(currentTrack).item;
  }

  if (!currentTrack || currentTrack.error) {
    return res.send({
      error: true,
      errorMessage: JSON.stringify(currentTrack),
    });
  }

  basicUserInfo.currentlyPlaying = currentTrack;

  return res.send(basicUserInfo);
});

app.delete("/api/logOut", (req, res) => {
  if (!req.cookies.token)
    return res.status(403).send({ error: true, errorMessage: "NO_TOKEN" });

  res.clearCookie("token");
  res.send({ error: false });
});

app.all("/api/*", (req, res) =>
  res.status(404).send({ error: true, errorMessage: "NOT_FOUND" })
);

app.all("*", (req, res) => {
  res.send(`Hello, Statistify! (The UI will be there)`);
});

async function validateJWTToken(
  token: string
): Promise<{ error: boolean; errorMessage?: string; payload?: any }> {
  let jwtVerify: {
    error: boolean;
    errorMessage?: string;
    payload?: any;
  } = await new Promise((resolve, reject) => {
    jwt.verify(token, constants.jwtSecret, (err, payload) => {
      if (err) {
        resolve({ error: true, errorMessage: "INVALID_TOKEN" });
      } else {
        resolve({ error: false, payload: payload });
      }
    });
  });

  return jwtVerify;
}

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
