import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./TopList.module.css";

import { topResourceType, topTimePeriod } from "./TopListTypes";
import type { ISettings } from "./TopListTypes";

import Loading from "../Loading/Loading";
import Song from "../Song/Song";
import Artist from "../Artist/Artist";
import Player from "../Player/Player";

interface ITopListState {
  isLoading: boolean;
  resourceType: topResourceType;
  numberOfResults: number;
  data: Array<ITopTrack> | any;
  isSpotifyOpened: boolean;
}

interface ITopTrack {
  id: string;
  title: string;
  author: string;
  album: string;
  coverURL: string;
  lengthMs: number;
  previewUrl: string;
  index: number;
}

interface ITopArtist {
  id: string;
  name: string;
  coverURL: string;
  index: number;
}

class TopList extends React.Component<any, ITopListState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      resourceType: topResourceType.songs,
      numberOfResults: 0,
      data: [],
      isSpotifyOpened: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await checkForLoginValidity();
    const parsedQueryParams = queryString.parse(this.props.location.search);

    let numberOfResults: number | null =
      parseInt(parsedQueryParams.numberOfResults as string) || null;

    let resourceType: string | null =
      topResourceType[parseInt(parsedQueryParams.resourceType as string)] ||
      null;

    let timePeriod: string | null =
      topTimePeriod[parseInt(parsedQueryParams.timePeriod as string)] || null;

    console.log(resourceType);

    if (
      !numberOfResults ||
      !resourceType ||
      !timePeriod ||
      numberOfResults < 1 ||
      numberOfResults > 50
    ) {
      //DEV
      //TODO: Log error
      window.location.href = "/topList/setup";
    } else {
      let settings: ISettings = {
        numberOfResults,
        resourceType: (resourceType as unknown) as topResourceType,
        timePeriod: (timePeriod as unknown) as topTimePeriod,
      };

      let topList = await this.getTheTopList(settings);

      let data: Array<ITopTrack> | Array<ITopArtist> = [];

      if (((settings.resourceType as unknown) as string) === "songs") {
        let tracks: Array<any> = topList.data;

        let serializedTracks: Array<ITopTrack> = [];

        tracks.forEach((elem, index) => {
          let authors = elem.artists.map((e: any) => e.name);

          let track: ITopTrack = {
            id: elem.id,
            title: elem.name,
            author: authors.join(", "),
            album: elem.album.name,
            coverURL: elem.album.images[0].url,
            lengthMs: elem.duration_ms,
            previewUrl: elem.preview_url,
            index: index,
          };

          serializedTracks.push(track);
        });
        data = serializedTracks;
      } else {
        let artists: Array<any> = topList.data;
        let serializedArtists: Array<ITopArtist> = [];

        artists.forEach((elem, index) => {
          let artist: ITopArtist = {
            id: elem.id,
            name: elem.name,
            coverURL: elem.images[0].url,
            index: index,
          };

          serializedArtists.push(artist);
        });

        data = serializedArtists;
      }

      this.setState({
        isLoading: false,
        resourceType: settings.resourceType as topResourceType,
        numberOfResults: settings.numberOfResults,
        data: data,
        isSpotifyOpened:
          window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      });
    }
  }

  async getTheTopList(settings: ISettings): Promise<any> {
    let queryParams: string = queryString.stringify(settings);
    let topListRequest = await fetch(`/api/getTopList?${queryParams}`);
    if (topListRequest.status !== 200) {
      //DEV
      //TODO: Log error
    }
    let topListResponse = await topListRequest.json();
    if (topListResponse.error) {
      //DEV
      //TODO: Log error
      return;
    }

    return topListResponse;
  }

  onceAgain() {
    window.location.href = "/topList/setup";
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
    } else {
      return (
        <div className={styles.container}>
          <LogOut />
          <span className={styles.header}>
            Oto Twoje Top {this.state.numberOfResults}{" "}
            {((this.state.resourceType as unknown) as string) == "artists"
              ? "Artystów"
              : "Piosenek"}
          </span>
          <div className={styles.elements}>
            {((this.state.resourceType as unknown) as string) === "songs" &&
              this.state.data.map((e: ITopTrack) => {
                return (
                  <div className={styles.topListElement}>
                    <span className={styles.index}>{e.index + 1}</span>
                    <Song
                      key={e.index}
                      trackId={e.id}
                      trackTitle={e.title}
                      trackAuthor={e.author}
                      trackAlbum={e.album}
                      trackLengthMs={e.lengthMs}
                      showCover={true}
                      coverImageURL={e.coverURL}
                      previewUrl={e.previewUrl}
                      showPlayButton={true}
                      showYouTubeButton={true}
                      showSpotifyButton={true}
                      additionalContainerClassName={`${styles.songComponent}`}
                      additionalTrackInfoClassName={`${styles.songComponentTrackInfo}`}
                      isSpotifyOpened={this.state.isSpotifyOpened}
                    />
                  </div>
                );
              })}
            {((this.state.resourceType as unknown) as string) === "artists" &&
              this.state.data.map((e: ITopArtist) => {
                return (
                  <div className={styles.topListElement}>
                    <span className={styles.index}>{e.index + 1}</span>
                    <Artist
                      artistId={e.id}
                      artistName={e.name}
                      showCover={true}
                      coverImageURL={e.coverURL}
                      additionalContainerClassName={`${styles.artistComponent}`}
                      additionalArtistNameClassName={`${styles.artistComponentArtistName}`}
                      showSpotifyButton
                      showYouTubeButton
                      isSpotifyOpened={this.state.isSpotifyOpened}
                    />
                  </div>
                );
              })}
          </div>
          <div className={styles.onceAgain}>
            <button className={styles.onceAgainButton} onClick={this.onceAgain}>
              <span className={styles.onceAgainButtonText}>Jeszcze raz</span>
            </button>
          </div>

          <div className={styles.playerDiv}>
            <Player />
          </div>
        </div>
      );
    }
  }
}

export default TopList;
