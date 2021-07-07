import React from "react";
import LogOut from "../../LogOut/LogOut";
import { checkForLoginValidity } from "../../Account";

import { FaSearch } from "react-icons/fa";
import styles from "./PlaylistExportSetup.module.css";

import Loading from "../../Loading/Loading";
import Playlist from "../../Playlist/Playlist";

interface IPlaylist {
  id: string;
  name: string;
  numberOfSongs: number;
  coverURL?: string;
  firstSongsCoverURLs: Array<string>;
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

    console.log(playlistResponse);

    if (playlistsRequest.status !== 200 || playlistResponse.error) {
      //DEV
      //Handle an error
      return;
    }

    let playlists: Array<IPlaylist> = playlistResponse.data.items.map(
      (e: any) => {
        return {
          id: e.id,
          name: e.name,
          numberOfSongs: e.tracks.total,
          coverURL: e.images[0].url || null,
          firstSongsCoverURLs: e.firstFourTracks.map(
            (elem: any) => elem.album.images[0].url
          ),
        };
      }
    );

    this.setState({
      isSpotifyOpened:
        window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      isLoading: false,
      data: playlists,
      totalPages: playlistResponse.data.totalPages,
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
                    elem.coverURL ? [elem.coverURL] : elem.firstSongsCoverURLs
                  }
                  onPlaylistClick={(
                    playlistId: string,
                    playlistName: string
                  ) => {
                    console.log(
                      `Clicked playlist ${playlistId} with name ${playlistName}`
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      );
    }
  }
}

export default PlaylistExportSetup;
