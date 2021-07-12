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
    scope:
      "user-read-recently-played user-read-playback-state user-top-read playlist-read-private playlist-read-collaborative",
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
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  //Get the user data from the Spotify API

  let basicUserInfoReq = await fetch(`https://api.spotify.com/v1/me`, {
    headers: {
      Authorization: `Bearer ${tokenValidation.payload.token}`,
    },
  });

  if (basicUserInfoReq.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: await basicUserInfoReq.text(),
    });
  }

  let basicUserInfo = await basicUserInfoReq.json();

  if (basicUserInfo.error) {
    return res.status(500).send({
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

  if (currentTrackReq.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: currentTrack,
    });
  }

  if (currentTrack == "") {
    currentTrack = await getCurrentTrackFromLatestPlayed(
      tokenValidation.payload.token
    );
  } else {
    currentTrack = JSON.parse(currentTrack).item || null;
    if (!currentTrack) {
      currentTrack = await getCurrentTrackFromLatestPlayed(
        tokenValidation.payload.token
      );
    }
  }

  if (!currentTrack || currentTrack.error) {
    return res.status(500).send({
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

app.get("/api/getTopList", async (req, res) => {
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  let numberOfResults: number | null = parseInt(
    req.query.numberOfResults as string
  );
  let resourceType: string | null = req.query.resourceType as string;
  let timePeriod: string | null = req.query.timePeriod as string;

  if (!numberOfResults || !resourceType || !timePeriod) {
    return res
      .status(400)
      .send({ error: true, errorMessage: "MISSING_PARAMS" });
  }

  if (numberOfResults < 1 || numberOfResults > 50) {
    return res
      .status(400)
      .send({ error: true, errorMessage: "WRONG_NUMBEROFRESULTS" });
  }

  if (resourceType !== "artists" && resourceType !== "songs") {
    return res
      .status(400)
      .send({ error: true, errorMessage: "WRONG_RESOURCETYPE" });
  }

  if (
    timePeriod !== "oneMonth" &&
    timePeriod !== "sixMonths" &&
    timePeriod !== "all"
  ) {
    return res
      .status(400)
      .send({ error: true, errorMessage: "WRONG_TIMEPERIOD" });
  }

  let timeRange: string = "";

  switch (timePeriod) {
    case "oneMonth":
      timeRange = "short_term";
      break;
    case "sixMonths":
      timeRange = "medium_term";
      break;
    case "all":
      timeRange = "long_term";
      break;
    default:
      timeRange = "short_term";
  }

  let topListSettings: any = {
    time_range: timeRange,
    limit: numberOfResults,
  };

  //Get the user top list
  let userTopListRequest = await fetch(
    `https://api.spotify.com/v1/me/top/${
      resourceType === "artists" ? "artists" : "tracks"
    }?${new URLSearchParams(topListSettings)}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );

  if (userTopListRequest.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: await userTopListRequest.text(),
    });
  }

  let userTopListResponse = await userTopListRequest.json();

  if (!userTopListResponse || userTopListResponse.error) {
    return res.status(500).send({
      error: true,
      errorMessage: JSON.stringify(userTopListResponse) || "UNKNOWN",
    });
  }
  res.send({
    error: false,
    data: userTopListResponse.items,
    resourceType: resourceType,
  });
});

app.get("/api/search", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.query.q)
    return res.status(400).send({ error: true, errorMessage: "MISSING_QUERY" });

  let searchSettings: any = {
    q: req.query.q,
    type: "track",
    limit: 20,
  };

  let searchRequest = await fetch(
    `https://api.spotify.com/v1/search?${new URLSearchParams(searchSettings)}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );

  if (searchRequest.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: `STATUS_CODE: ${
        searchRequest.status
      }; RESPONSE: ${await searchRequest.text()}`,
    });
  } else {
    let data = await searchRequest.json();
    return res.send({ error: false, data: data.tracks.items });
  }
});

app.get("/api/getTrack", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.query.id)
    return res.status(400).send({ error: true, errorMessage: "MISSING_ID" });

  let trackRequest = await fetch(
    `https://api.spotify.com/v1/tracks/${req.query.id}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );

  if (trackRequest.status !== 200) {
    if (trackRequest.status === 400) {
      return res.status(400).send({
        error: true,
        errorMessage: `WRONG_ID`,
      });
    } else {
      return res.status(500).send({
        error: true,
        errorMessage: `STATUS_CODE: ${
          trackRequest.status
        }; RESPONSE: ${await trackRequest.text()}`,
      });
    }
  }

  let trackResponse = await trackRequest.json();
  res.send({ error: false, data: trackResponse });
});

app.get("/api/getRecommendations", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.query.id)
    return res.status(400).send({ error: true, errorMessage: "MISSING_ID" });

  let recommendationsSettings: any = {
    seed_tracks: req.query.id,
    limit: 50,
  };

  let recommendationsRequest = await fetch(
    `https://api.spotify.com/v1/recommendations?${new URLSearchParams(
      recommendationsSettings
    )}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );

  if (recommendationsRequest.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: `STATUS_CODE: ${
        recommendationsRequest.status
      }; RESPONSE: ${await recommendationsRequest.text()}`,
    });
  } else {
    let recommendationsResponse = await recommendationsRequest.json();
    return res.send({ error: false, data: recommendationsResponse.tracks });
  }
});

app.get("/api/getUserPlaylists/:page", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.params.page || isNaN(parseInt(req.params.page)))
    return res
      .status(400)
      .send({ error: true, errorMessage: "WRONG_PAGENUMBER" });

  let limit: number = 5;
  let offset: number = (parseInt(req.params.page) - 1) * limit;

  let userPlaylistsRequest = await getUserPlaylists(
    tokenValidation.payload.token,
    limit,
    offset
  );

  if (userPlaylistsRequest.error) {
    res.status(500).send(userPlaylistsRequest);
  } else {
    res.send({
      error: false,
      data: {
        currentPage: parseInt(req.params.page),
        totalItems: userPlaylistsRequest.data.total,
        totalPages: Math.ceil(userPlaylistsRequest.data.total / limit),
        items: userPlaylistsRequest.data.items,
      },
    });
  }
});

app.get("/api/getPlaylist", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.query.id)
    return res.status(400).send({ error: true, errorMessage: "MISSING_ID" });

  let playlistRequest = await fetch(
    `https://api.spotify.com/v1/playlists/${encodeURIComponent(
      req.query.id as string
    )}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );
  if (playlistRequest.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: `STATUS_CODE: ${
        playlistRequest.status
      }; RESPONSE: ${await playlistRequest.text()}`,
    });
  } else {
    let playlistResponse = await playlistRequest.json();

    if (!playlistResponse?.images[0]?.url) {
      let firstTracks = await getFirstFourTracksFromPlaylist(
        tokenValidation.payload.token,
        playlistResponse.id
      );
      if (firstTracks.error) {
        return firstTracks;
      } else {
        playlistResponse.firstFourTracks = firstTracks.data.map((e) => e.track);
      }
    }

    return res.send({ error: false, data: playlistResponse });
  }
});

app.get("/api/getPlaylistItems/:page", async (req, res) => {
  //Validate the token - so whether user is logged
  let tokenValidation = await validateJWTToken(req.cookies.token);
  if (tokenValidation.error) return res.status(403).send(tokenValidation);

  if (!req.query.id)
    return res.status(400).send({ error: true, errorMessage: "MISSING_ID" });
  if (!req.params.page || isNaN(parseInt(req.params.page)))
    return res
      .status(400)
      .send({ error: true, errorMessage: "WRONG_PAGENUMBER" });

  let limit: number = 100;
  let offset: number = (parseInt(req.params.page) - 1) * limit;

  let playlistItemsRequestSettings: any = {
    limit: limit,
    offset: offset,
    market: "PL",
  };

  let playlistItemsRequest = await fetch(
    `https://api.spotify.com/v1/playlists/${
      req.query.id
    }/tracks?${new URLSearchParams(playlistItemsRequestSettings)}`,
    {
      headers: {
        Authorization: `Bearer ${tokenValidation.payload.token}`,
      },
    }
  );

  if (playlistItemsRequest.status !== 200) {
    return res.status(500).send({
      error: true,
      errorMessage: `STATUS_CODE: ${
        playlistItemsRequest.status
      }; RESPONSE: ${await playlistItemsRequest.text()}`,
    });
  }

  let playlistItemsResponse = await playlistItemsRequest.json();

  return res.send({
    error: false,
    data: {
      total: playlistItemsResponse.total,
      totalPages: Math.ceil(playlistItemsResponse.total / limit),
      currentPage: parseInt(req.params.page),
      items: playlistItemsResponse.items,
    },
  });
});

async function getUserPlaylists(
  token: string,
  limit: number,
  offset?: number
): Promise<{ error: boolean; errorMessage?: string; data?: any }> {
  if (!token || !limit)
    return { error: true, errorMessage: "MISSING_TOKEN_OR_LIMIT" };

  let userPlaylistsRequest = await fetch(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}${
      offset ? `&offset=${offset}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (userPlaylistsRequest.status !== 200) {
    return {
      error: true,
      errorMessage: `STATUS: ${
        userPlaylistsRequest.status
      }; RESPONSE: ${await userPlaylistsRequest.text()}`,
    };
  } else {
    let userPlaylistsResponse = await userPlaylistsRequest.json();
    let items = userPlaylistsResponse.items;
    let serializedItems = [];

    for await (let item of items) {
      if (!item?.images[0]?.url) {
        let firstTracks = await getFirstFourTracksFromPlaylist(token, item.id);
        if (firstTracks.error) {
          return firstTracks;
        } else {
          item.firstFourTracks = firstTracks.data.map((e) => e.track);
          serializedItems.push(item);
        }
      } else {
        serializedItems.push(item);
      }
    }

    return {
      error: false,
      data: {
        total: userPlaylistsResponse.total,
        items: serializedItems,
      },
    };
  }
}

async function getFirstFourTracksFromPlaylist(
  token: string,
  playlistId: string
): Promise<{ error: boolean; errorMessage?: string; data?: any }> {
  if (!token || !playlistId)
    return { error: true, errorMessage: "MISSING_TOKEN_OR_PLAYLISTID" };

  let tracksRequest = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=4&market=PL`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (tracksRequest.status !== 200) {
    return {
      error: true,
      errorMessage: `STATUS: ${
        tracksRequest.status
      }; RESPONSE: ${await tracksRequest.text()}`,
    };
  } else {
    let tracksResponse = await tracksRequest.json();
    return { error: false, data: tracksResponse.items };
  }
}

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

async function getCurrentTrackFromLatestPlayed(token: string): Promise<any> {
  let currentTrackAnotherRes = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return await (await currentTrackAnotherRes.json()).items[0].track;
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
