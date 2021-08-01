import React from "react";
import { FaSpotify } from "react-icons/fa";
import Switch from "react-switch";
import { Link } from "react-router-dom";
import homeLoginStyles from "./HomeLogin.module.css";
import homeStyles from "./Home.module.css";
import Song from "../Song/Song";
import LogOut from "../LogOut/LogOut";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";

interface IHomeState {
  isLoading: boolean;
  isLogged: boolean;
  userProfilePictureUrl: string;
  username: string;
  currentTrack: Track;
  isSpotifyOpened: boolean;
}

interface Track {
  id: string;
  title: string;
  author: string;
  album: string;
  coverURL: string;
  lengthMs: number;
  previewUrl?: string;
}

class Home extends React.Component<any, IHomeState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      isLogged: false,
      userProfilePictureUrl: "",
      username: "",
      currentTrack: {
        id: "",
        title: "",
        author: "",
        album: "",
        coverURL: "",
        lengthMs: 0,
        previewUrl: "",
      },
      isSpotifyOpened: false,
    };
  }

  async componentDidMount() {
    let userDataRequest = await fetch("/api/getUserData");
    let userDataResponse = await userDataRequest.json();

    if (userDataResponse.error) {
      if (userDataResponse.errorMessage == "INVALID_TOKEN") {
        this.setState({ isLogged: false, isLoading: false });
      } else {
        window.location.href = `/error?error=${encodeURIComponent(
          userDataResponse.errorMessage
        )}`;
        this.setState({ isLogged: false, isLoading: false });
      }
    } else {
      let authors = userDataResponse.currentlyPlaying.artists.map(
        (e: any) => e.name
      );

      let currentTrack: Track = {
        id: userDataResponse.currentlyPlaying.id,
        title: userDataResponse.currentlyPlaying.name,
        author: authors.join(", "),
        album: userDataResponse.currentlyPlaying.album.name,
        coverURL: userDataResponse.currentlyPlaying.album.images[0].url,
        lengthMs: userDataResponse.currentlyPlaying.duration_ms,
        previewUrl: userDataResponse.currentlyPlaying.preview_url,
      };

      this.setState({
        isLogged: true,
        isLoading: false,
        username: userDataResponse.display_name,
        userProfilePictureUrl: userDataResponse.images[0].url,
        currentTrack: currentTrack,
        isSpotifyOpened:
          window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
      });
    }
  }

  loginWithSpotify(): void {
    window.location.href =
      "https://statistify.herokuapp.com/api/loginWithSpotify";
  }

  handleSpotifyOpenedSwitch(e: boolean): void {
    window.sessionStorage.setItem("isSpotifyOpened", e.toString());
    this.setState({ isSpotifyOpened: e });
  }

  render() {
    if (this.state.isLoading) {
      return <Loading fullScreen />;
    } else {
      if (this.state.isLogged) {
        return (
          <div className={homeStyles.container}>
            <LogOut />
            <div className={homeStyles.userProfile}>
              <img
                src={
                  this.state.userProfilePictureUrl
                    ? this.state.userProfilePictureUrl
                    : process.env.PUBLIC_URL + "/icon/user.png"
                }
                className={homeStyles.userProfilePicture}
                alt=""
              />
              <span className={homeStyles.helloMessage}>
                Cześć, {this.state.username}
              </span>

              <Song
                trackId={this.state.currentTrack.id}
                trackTitle={this.state.currentTrack.title}
                trackAuthor={this.state.currentTrack.author}
                trackAlbum={this.state.currentTrack.album}
                trackLengthMs={this.state.currentTrack.lengthMs}
                showCover
                coverImageURL={this.state.currentTrack.coverURL}
                showPlayButton={false}
                showYouTubeButton
                showSpotifyButton
                isSpotifyOpened={this.state.isSpotifyOpened}
              />
            </div>
            <div className={homeStyles.buttonsDiv}>
              <Link to="/topList/setup">
                <button className={homeStyles.optionButton}>
                  Top piosenki i artyści
                </button>
              </Link>
              <Link to="/recommendations/setup">
                <button className={homeStyles.optionButton}>
                  Rekomendacje
                </button>
              </Link>
              <Link to="/playlistExport/setup">
                <button className={homeStyles.optionButton}>
                  Export playlisty
                </button>
              </Link>
            </div>
            <div className={homeStyles.isSpotifyOpenedDiv}>
              <span
                className={homeStyles.isSpotifyOpenedLabel}
                onClick={this.handleSpotifyOpenedSwitch.bind(
                  this,
                  !this.state.isSpotifyOpened
                )}
              >
                Spotify jest uruchomiony
              </span>
              <Switch
                checked={this.state.isSpotifyOpened}
                onChange={this.handleSpotifyOpenedSwitch.bind(this)}
                onColor="#0db850"
                onHandleColor="#ffffff"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
              />
            </div>
            <Footer />
          </div>
        );
      } else {
        return (
          <div className={homeLoginStyles.container}>
            <div className={homeLoginStyles.logo}>
              <img
                src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
                className={homeLoginStyles.logoImg}
                alt=""
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
            <Footer hideAppName />
          </div>
        );
      }
    }
  }
}

export default Home;
