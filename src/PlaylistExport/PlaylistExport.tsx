import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./PlaylistExport.module.css";

import Loading from "../Loading/Loading";
import Playlist from "../Playlist/Playlist";

interface IPlaylist {
  id: string;
  name: string;
  numberOfSongs: number;
  coverURL?: string;
  firstSongsCoverURLs: Array<string> | null;
}

interface IPlaylistExportState {
  isLoading: boolean;
  isSpotifyOpened: boolean;
  playlist: IPlaylist;
  downloadProcess: {
    isDownloading: boolean;
    downloadProgress: number;
  };
}

class PlaylistExport extends React.Component<any, IPlaylistExportState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      isSpotifyOpened: false,
      playlist: {
        id: "",
        name: "Playlista",
        numberOfSongs: 0,
        firstSongsCoverURLs: null,
      },
      downloadProcess: {
        isDownloading: true,
        downloadProgress: 0,
      },
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();

    const parsedQueryParams = queryString.parse(this.props.location.search);
    if (!parsedQueryParams.id) {
      window.location.href = "/playlistExport/setup";
      return;
    }

    let playlistId = parsedQueryParams.id;

    let playlistRequest = await fetch(
      `/api/getPlaylist?id=${encodeURIComponent(playlistId as string)}`
    );
    let playlistResponse = await playlistRequest.json();

    if (playlistRequest.status !== 200 || playlistResponse.error) {
      //DEV
      //TODO: Handle an error
      return;
    }

    let playlist: IPlaylist = {
      id: playlistResponse.id,
      name: playlistResponse.name,
      numberOfSongs: playlistResponse.tracks.total,
      coverURL: playlistResponse?.images?.[0]?.url || null,
      firstSongsCoverURLs:
        playlistResponse?.firstFourTracks?.map(
          (elem: any) => elem?.album?.images?.[0]?.url || ""
        ) || null,
    };

    this.setState({
      isLoading: false,
      isSpotifyOpened:
        window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      playlist: playlist,
    });

    setInterval(() => {
      this.setState({
        downloadProcess: {
          isDownloading: false,
          downloadProgress: this.state.downloadProcess.downloadProgress + 1,
        },
      });
    }, 1000);
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
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
            <span className={styles.logoText}>Export playlisty</span>
          </div>
          <div className={styles.playlistWrapper}>
            <Playlist
              key={this.state.playlist.id}
              playlistId={this.state.playlist.id}
              playlistName={this.state.playlist.name}
              numberOfSongs={this.state.playlist.numberOfSongs}
              isSpotifyOpened={this.state.isSpotifyOpened}
              showSpotifyButton
              additionalContainerClassName={styles.playlistContainer}
              additionalPlaylistInfoClassName={styles.playlistInfo}
              coverImageURLs={
                this.state.playlist.coverURL
                  ? [this.state.playlist.coverURL]
                  : this.state.playlist.firstSongsCoverURLs || []
              }
            />
          </div>
          <div className={styles.download}>
            {this.state.downloadProcess.isDownloading && (
              <div className={styles.loadingDiv}>
                <div className={styles.loadingWrapper}>
                  <div className={styles.loadingBackground}></div>
                  <div
                    className={styles.loading}
                    style={{
                      width: `${this.state.downloadProcess.downloadProgress}%`,
                    }}
                  ></div>
                </div>
                <span className={styles.downloadProgressText}>
                  {this.state.downloadProcess.downloadProgress}%
                </span>
              </div>
            )}
            {!this.state.downloadProcess.isDownloading && (
              <div className={styles.downloadButtonsDiv}>
                <button className={styles.downloadButton}>
                  Pobierz szczegółowy plik (DEV: SIZE HERE)
                </button>
                <button className={styles.downloadButton}>
                  Pobierz szczegółowy plik (DEV: SIZE HERE)
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

export default PlaylistExport;
