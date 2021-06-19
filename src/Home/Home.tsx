import React from "react";

import { FaSpotify } from "react-icons/fa";
import homeLoginStyles from "./HomeLogin.module.css";
import homeStyles from "./Home.module.css";
import Song from "../Song/Song";

interface HomeState {
  isLoading: boolean;
  isLogged: boolean;
  userProfilePictureUrl: string;
  username: string;
}

class Home extends React.Component<any, HomeState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      isLogged: false,
      userProfilePictureUrl: "",
      username: "usernameid2198390213821390",
    };
  }

  async componentDidMount() {
    let userDataRequest = await fetch("/api/getUserData");
    let userDataResponse = await userDataRequest.json();

    if (userDataResponse.error) {
      if (userDataResponse.errorMessage == "INVALID_TOKEN") {
        this.setState({ isLogged: false, isLoading: false });
      } else {
        //DEV
        //TODO: Handle the error
        this.setState({ isLogged: false, isLoading: false });
      }
    } else {
      this.setState({
        isLogged: true,
        isLoading: false,
        username: userDataResponse.display_name,
        userProfilePictureUrl: userDataResponse.images[0].url,
      });
    }
  }

  loginWithSpotify(): void {
    //DEV
    //TODO: Change this path
    window.location.href = "http://localhost:8497/api/loginWithSpotify";
  }

  render() {
    if (this.state.isLoading) {
      //TODO: Create the loading page
      return <h1 style={{ color: "white" }}>Loading...</h1>;
    } else {
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
              {/*DEV*/}
              <Song />
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
                <span
                  className={homeLoginStyles.loginWithSpotifyText}
                  onClick={this.loginWithSpotify}
                >
                  Zaloguj się ze Spotify
                </span>
              </button>
            </div>
          </div>
        );
      }
    }
  }
}

export default Home;
