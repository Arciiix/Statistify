import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./Recommendations.module.css";

import Song from "../Song/Song";
import Loading from "../Loading/Loading";
import Player from "../Player/Player";

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
  currentPreviewTrack: {
    url: string;
    name: string;
  };
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
      currentPreviewTrack: {
        url: "",
        name: "Wybierz piosenkę...",
      },
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();

    const initSongId = queryString.parse(this.props.location.search).id || null;
    if (!initSongId) {
      window.location.href = "/recommendations/setup";
      return;
    } else {
      //Get the initial song
      let initSongRequest = await fetch(
        `/api/getTrack?id=${encodeURIComponent(initSongId as string)}`
      );
      let initSongResponse = await initSongRequest.json();
      if (initSongRequest.status !== 200 || initSongResponse.error) {
        //DEV
        //TODO: Handle an error
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
      return <Loading />;
    } else {
      return (
        <div className={styles.container}>
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
