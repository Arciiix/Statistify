import React from "react";
import LogOut from "../../LogOut/LogOut";
import { checkForLoginValidity } from "../../Account";

import styles from "./PlaylistExportSetup.module.css";

import Loading from "../../Loading/Loading";
import Playlist from "../../Playlist/Playlist";

interface IPlaylist {
  id: string;
  name: string;
  numberOfSongs: number;
  coverURL?: string;
  firstSongsCoverURLs: Array<string> | null;
}

interface IPlaylistExportSetupState {
  isLoading: boolean;
  isSpotifyOpened: boolean;
  data: Array<IPlaylist>;
  currentPage: number;
  totalPages: number;
}

class PlaylistExportSetup extends React.Component<
  any,
  IPlaylistExportSetupState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      isSpotifyOpened: false,
      data: [],
      currentPage: 1,
      totalPages: 1,
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();

    let playlistsRequest = await fetch(`/api/getUserPlaylists/1`);
    let playlistResponse = await playlistsRequest.json();

    if (playlistsRequest.status !== 200 || playlistResponse.error) {
      //DEV
      //Handle an error
      return;
    }

    let data = this.handleThePlaylistData(playlistResponse);

    document.addEventListener("keydown", (e) => {
      if (this.state.isLoading) return;
      if (e.key.toLowerCase() === "arrowleft") {
        this.changePage(false);
      } else if (e.key.toLowerCase() === "arrowright") {
        this.changePage(true);
      }
    });

    this.setState({
      isSpotifyOpened:
        window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      isLoading: false,
      data: data.data,
      totalPages: data.totalPages,
    });
  }

  handleThePlaylistData(
    data: any
  ): { data: Array<IPlaylist>; totalPages: number } {
    let playlists: Array<IPlaylist> = data.data.items.map((e: any) => {
      return {
        id: e.id,
        name: e.name,
        numberOfSongs: e.tracks.total,
        coverURL: e?.images?.[0]?.url || null,
        firstSongsCoverURLs:
          e?.firstFourTracks?.map(
            (elem: any) => elem?.album?.images?.[0]?.url || ""
          ) || null,
      };
    });

    return { data: playlists, totalPages: data.data.totalPages };
  }

  async changePage(goForward: boolean): Promise<void> {
    let newPage = goForward
      ? this.state.currentPage + 1
      : this.state.currentPage - 1;
    if (newPage < 1 || newPage > this.state.totalPages) return;

    await new Promise((resolve: any) => {
      this.setState({ isLoading: true }, resolve);
    });

    let newPageRequest = await fetch(`/api/getUserPlaylists/${newPage}`);
    let newPageResponse = await newPageRequest.json();

    if (newPageRequest.status !== 200 || newPageResponse.error) {
      //DEV
      //Handle an error
      return;
    }

    let data = this.handleThePlaylistData(newPageResponse);

    this.setState({
      isLoading: false,
      data: data.data,
      totalPages: data.totalPages,
      currentPage: newPage,
    });
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
          <div className={styles.headerWrapper}>
            <span className={styles.header}>Wybierz playlistę</span>
          </div>
          <div className={styles.playlistWrapper}>
            {this.state.data.map((elem: IPlaylist) => {
              return (
                <Playlist
                  key={elem.id}
                  playlistId={elem.id}
                  playlistName={elem.name}
                  numberOfSongs={elem.numberOfSongs}
                  isSpotifyOpened={this.state.isSpotifyOpened}
                  showSpotifyButton
                  additionalContainerClassName={styles.playlistContainer}
                  additionalPlaylistInfoClassName={styles.playlistInfo}
                  coverImageURLs={
                    elem.coverURL
                      ? [elem.coverURL]
                      : elem.firstSongsCoverURLs || []
                  }
                  onPlaylistClick={(playlistId: string) => {
                    window.location.href = `/playlistExport?id=${playlistId}`;
                  }}
                />
              );
            })}
          </div>
          <div className={styles.pageNumberWrapper}>
            <span className={styles.pageNumber}>
              {this.state.currentPage}/{this.state.totalPages}
            </span>
          </div>
          <div className={styles.pageControl}>
            <button
              className={`${styles.pageControlButton}${
                this.state.currentPage === 1 ? ` ${styles.hidden}` : ""
              }`}
              onClick={this.changePage.bind(this, false)}
            >
              Poprzednia strona
            </button>
            <button
              className={`${styles.pageControlButton}${
                this.state.currentPage === this.state.totalPages
                  ? ` ${styles.hidden}`
                  : ""
              }`}
              onClick={this.changePage.bind(this, true)}
            >
              Następna strona
            </button>
          </div>
        </div>
      );
    }
  }
}

export default PlaylistExportSetup;
