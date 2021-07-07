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
}

interface IPlaylistExportSetupState {
  isLoading: boolean;
  isSpotifyOpened: boolean;
  userId: string;
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
      userId: "",
    };
  }

  async componentDidMount() {
    let userData = await checkForLoginValidity();

    if (!userData.id) {
      //DEV
      //Handle an error

      console.log(`ERROR: MISSING_ID`);
    }

    this.setState({
      isSpotifyOpened:
        window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      userId: userData.id,
      isLoading: false,
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
            <Playlist
              playlistId={"Id"}
              playlistName={"Name"}
              numberOfSongs={0}
              isSpotifyOpened={this.state.isSpotifyOpened}
              showSpotifyButton
              additionalContainerClassName={styles.playlistContainer}
              userId={this.state.userId || ""}
              coverImageURLs={[]}
              onPlaylistClick={(playlistId: string, playlistName: string) => {
                console.log(
                  `Clicked playlist ${playlistId} with name ${playlistName}`
                );
              }}
            />
          </div>
        </div>
      );
    }
  }
}

export default PlaylistExportSetup;
