import React from "react";

import { FaSpotify } from "react-icons/fa";
import homeLoginStyles from "./HomeLogin.module.css";
import homeStyles from "./Home.module.css";

interface HomeState {
  isLogged: boolean;
  userProfilePictureUrl: string;
  username: string;
}

class Home extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLogged: false,
      userProfilePictureUrl: "",
      username: "usernameid2198390213821390",
    };
  }
  render() {
    if (this.state.isLogged) {
      return (
        <div className={homeStyles.container}>
          <div className={homeStyles.userProfile}>
            <img
              src={
                this.state.userProfilePictureUrl
                  ? this.state.userProfilePictureUrl
                  : process.env.PUBLIC_URL + "/icon/user.png"
              }
              className={homeStyles.userProfilePicture}
            />
            <span className={homeStyles.helloMessage}>
              Cześć, {this.state.username}
            </span>
          </div>
          <div className={homeStyles.buttonsDiv}>
            <button className={homeStyles.optionButton}>
              Top piosenki i artyści
            </button>
            <button className={homeStyles.optionButton}>Rekomendacje</button>
            <button className={homeStyles.optionButton}>
              Export playlisty
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={homeLoginStyles.container}>
          <div className={homeLoginStyles.logo}>
            <img
              src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
              className={homeLoginStyles.logoImg}
            />
            <span className={homeLoginStyles.logoText}>Statistify</span>
          </div>
          <div>
            <button className={homeLoginStyles.loginWithSpotifyButton}>
              <FaSpotify className={homeLoginStyles.loginWithSpotifyIcon} />{" "}
              <span className={homeLoginStyles.loginWithSpotifyShortText}>
                Zaloguj
              </span>{" "}
              <span className={homeLoginStyles.loginWithSpotifyText}>
                Zaloguj się ze Spotify
              </span>
            </button>
          </div>
        </div>
      );
    }
  }
}

export default Home;
