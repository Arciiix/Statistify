import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import FastAverageColor from "fast-average-color";

import { FaSpotify, FaYoutube, FaPlay } from "react-icons/fa";

import styles from "./Song.module.css";

interface ISongProps {
  trackTitle: string;
  trackAuthor: string;
  trackAlbum?: string;
  trackLengthMs: number;
  showCover: boolean;
  coverImageURL?: string;
  showPlayButton?: boolean;
  showYouTubeButton?: boolean;
  showSpotifyButton?: boolean;
  trackInfoWidth?: string | number;
}

interface ISongState {
  trackLengthText: string;
  backgroundColor: string;
}

const FastAverageColorInstance = new FastAverageColor();

class Song extends React.Component<ISongProps, ISongState> {
  constructor(props: ISongProps) {
    super(props);
    this.state = {
      trackLengthText: "",
      backgroundColor: "#505254",
    };
  }

  static defaultProps = {
    trackTitle: "Tytuł piosenki",
    trackAuthor: "Autor",
    trackLengthMs: 0,
    showCover: false,
    showPlayButton: true,
    showYouTubeButton: true,
    showSpotifyButton: true,
  };

  componentDidMount() {
    this.setState({
      trackLengthText: this.convertMsToText(this.props.trackLengthMs),
    });
  }

  convertMsToText(time: number): string {
    let minutes: number = Math.floor((time / (1000 * 60)) % 60);
    let seconds: number = Math.floor((time / 1000) % 60);

    return `${this.addZero(minutes)}:${this.addZero(seconds)}`;
  }

  addZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  async setBackgroundColor(): Promise<void> {
    let color = await FastAverageColorInstance.getColorAsync(
      this.props.coverImageURL as string
    );
    this.setState({ backgroundColor: this.darkenColor(color.hex, 40) });
  }

  darkenColor(color: string, percent: number): string {
    let colorObject: any = {
      red: parseInt(color.slice(1, 3), 16),
      green: parseInt(color.slice(3, 5), 16),
      blue: parseInt(color.slice(5, 7), 16),
    };

    for (let key of Object.keys(colorObject)) {
      colorObject[key] = Math.floor((colorObject[key] * (100 - percent)) / 100);
      colorObject[key] = colorObject[key] < 255 ? colorObject[key] : 255;
      colorObject[key] =
        colorObject[key].toString(16).length == 1
          ? `0${colorObject[key].toString(16)}`
          : colorObject[key].toString(16);
    }

    return `#${colorObject.red}${colorObject.green}${colorObject.blue}`;
  }

  render() {
    return (
      <div
        className={styles.songContainer}
        style={{
          backgroundColor: this.state.backgroundColor,
        }}
      >
        {this.props.showCover && (
          <div className={styles.cover}>
            <LazyLoadImage
              alt={""}
              src={this.props.coverImageURL}
              effect={"blur"}
              afterLoad={this.setBackgroundColor.bind(this)}
            />
          </div>
        )}
        <div
          className={styles.trackInfo}
          style={{ width: this.props.trackInfoWidth || "auto" }}
        >
          <div className={styles.titleAndAuthor}>
            <span className={styles.title}>{this.props.trackTitle}</span>
            <span className={styles.author}>
              {this.props.trackAuthor}
              {this.props.trackAlbum && `; ${this.props.trackAlbum}`}
            </span>
          </div>
          <div className={styles.trackLength}>{this.state.trackLengthText}</div>
        </div>
        <div className={styles.playButtons}>
          {this.props.showPlayButton && (
            <FaPlay
              className={`${styles.iconButton} ${styles.playIcon}`}
              onClick={() => null /*DEV TODO: Make the play button work*/}
            />
          )}
          {this.props.showYouTubeButton && (
            <a
              href={`https://www.youtube.com/results?search_query=${this.props.trackAuthor}%20%2D%20${this.props.trackTitle}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaYoutube
                className={`${styles.iconButton} ${styles.youTubeIcon}`}
              />
            </a>
          )}
          {this.props.showSpotifyButton && (
            <FaSpotify
              className={`${styles.iconButton} ${styles.spotifyIcon}`}
              onClick={
                () => null /*DEV TODO: Make the Spotify play button work*/
              }
            />
          )}
        </div>
      </div>
    );
  }
}
export default Song;
