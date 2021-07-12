import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./Recommendations.module.css";

import Song from "../Song/Song";
import Loading from "../Loading/Loading";
import Player from "../Player/Player";
import { encode } from "punycode";

interface ITrack {
  id: string;
  title: string;
  author: string;
  album: string;
  coverURL: string;
  lengthMs: number;
  previewURL: string;
}

interface IRecommendationsState {
  isLoading: boolean;
  initSong: ITrack;
  recommendations: Array<ITrack>;
  currentPreviewTrack: {
    url: string;
    name: string;
  };
  isSpotifyOpened: boolean;
}

class Recommendations extends React.Component<any, IRecommendationsState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      initSong: {
        id: "",
        title: "",
        author: "",
        album: "",
        coverURL: "",
        lengthMs: 0,
        previewURL: "",
      },
      recommendations: [],
      currentPreviewTrack: {
        url: "",
        name: "Wybierz piosenkę...",
      },
      isSpotifyOpened: false,
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();

    const initSongId = queryString.parse(this.props.location.search).id || null;
    if (!initSongId) {
      window.location.href = "/recommendations/setup";
      return;
    } else {
      let recommendationsRequest = await fetch(
        `/api/getRecommendations?id=${encodeURIComponent(initSongId as string)}`
      );
      let recommendationsResponse = await recommendationsRequest.json();
      if (
        recommendationsRequest.status !== 200 ||
        recommendationsResponse.error
      ) {
        window.location.href = `/error?error=${encodeURIComponent(
          recommendationsResponse.errorMessage
        )}`;
      } else {
        let serializedData: Array<ITrack> = [];
        recommendationsResponse.data.forEach((elem: any) => {
          if (!elem) return null;

          let authors = elem.artists.map((e: any) => e.name);

          let track: ITrack = {
            id: elem.id,
            title: elem.name,
            author: authors.join(", "),
            album: elem.album.name,
            coverURL: elem.album.images[0].url,
            lengthMs: elem.duration_ms,
            previewURL: elem.preview_url,
          };

          serializedData.push(track);
        });

        this.setState({
          recommendations: serializedData,
          isSpotifyOpened:
            window.sessionStorage.getItem("isSpotifyOpened") === "true" ||
            false,
        });
      }

      //Get the initial song
      let initSongRequest = await fetch(
        `/api/getTrack?id=${encodeURIComponent(initSongId as string)}`
      );
      let initSongResponse = await initSongRequest.json();
      if (initSongRequest.status !== 200 || initSongResponse.error) {
        window.location.href = `/error?error=${encodeURIComponent(
          initSongResponse.errorMessage
        )}`;
      } else {
        let song = initSongResponse.data;
        let authors = song.artists.map((e: any) => e.name);
        this.setState({
          initSong: {
            id: song.id,
            title: song.name,
            author: authors.join(", "),
            album: song.album.name,
            coverURL: song.album.images[0].url,
            lengthMs: song.duration_ms,
            previewURL: song.preview_url,
          },
        });
      }
    }

    this.setState({ isLoading: false });
  }

  render() {
    if (this.state.isLoading) {
      return <Loading fullScreen />;
    } else {
      return (
        <div className={styles.container}>
          <LogOut />

          <div
            className={styles.logo}
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
              className={styles.logoImg}
            />
            <span className={styles.logoText}>Rekomendacje</span>
          </div>

          <div className={styles.initSongDiv}>
            <span className={styles.header}>Na podstawie</span>
            <Song
              trackId={this.state.initSong.id}
              trackTitle={this.state.initSong.title}
              trackAuthor={this.state.initSong.author}
              trackAlbum={this.state.initSong.album}
              trackLengthMs={this.state.initSong.lengthMs}
              showCover
              coverImageURL={this.state.initSong.coverURL}
              showPlayButton
              showYouTubeButton
              showSpotifyButton
              previewUrl={this.state.initSong.previewURL}
              onPlayButtonClick={(
                previewUrl: string,
                trackAuthor: string,
                trackTitle: string
              ) => {
                this.setState({
                  currentPreviewTrack: {
                    url: previewUrl,
                    name: `${trackAuthor} - ${trackTitle}`,
                  },
                });
              }}
              additionalContainerClassName={styles.songContainer}
              additionalTrackInfoClassName={styles.songTrack}
            />
          </div>
          <div className={styles.recommendationsDiv}>
            <span className={styles.header}>Może spodobać Ci się</span>

            {this.state.recommendations.map((e) => {
              return (
                <Song
                  key={e.id}
                  trackId={e.id}
                  trackTitle={e.title}
                  trackAuthor={e.author}
                  trackAlbum={e.album}
                  trackLengthMs={e.lengthMs}
                  showCover={true}
                  coverImageURL={e.coverURL}
                  previewUrl={e.previewURL}
                  onPlayButtonClick={(
                    previewUrl: string,
                    trackAuthor: string,
                    trackTitle: string
                  ) => {
                    this.setState({
                      currentPreviewTrack: {
                        url: previewUrl,
                        name: `${trackAuthor} - ${trackTitle}`,
                      },
                    });
                  }}
                  showPlayButton={true}
                  showYouTubeButton={true}
                  showSpotifyButton={true}
                  additionalContainerClassName={`${styles.songContainer}`}
                  additionalTrackInfoClassName={`${styles.songTrack}`}
                  isSpotifyOpened={this.state.isSpotifyOpened}
                />
              );
            })}
          </div>

          <div className={styles.playerDiv}>
            <Player
              trackName={this.state.currentPreviewTrack.name}
              url={this.state.currentPreviewTrack.url}
            />
          </div>
          <div className={styles.whiteSpace}></div>
        </div>
      );
    }
  }
}

export default Recommendations;
