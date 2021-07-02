import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaSpotify, FaYoutube, FaPlay } from "react-icons/fa";
import { getBackgroundColor } from "../BackgroundColor";

import styles from "./Song.module.css";

interface ISongProps {
  trackId: string;
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
  previewUrl?: string;
  onPlayButtonClick?: (
    previewUrl: string,
    trackAuthor: string,
    trackTitle: string
  ) => void;
  additionalContainerClassName?: string;
  additionalTrackInfoClassName?: string;
  isSpotifyOpened?: boolean;
}

interface ISongState {
  trackLengthText: string;
  backgroundColor: string;
}

class Song extends React.Component<ISongProps, ISongState> {
  constructor(props: ISongProps) {
    super(props);
    this.state = {
      trackLengthText: "",
      backgroundColor: "#505254",
    };
  }

  static defaultProps = {
    trackId: "",
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
    let color = await getBackgroundColor(this.props.coverImageURL as string);
    this.setState({ backgroundColor: color });
  }

  render() {
    return (
      <div
        className={`${styles.songContainer}${
          this.props.additionalContainerClassName
            ? ` ${this.props.additionalContainerClassName}`
            : ""
        }`}
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
          className={`${styles.trackInfo}${
            this.props.additionalTrackInfoClassName
              ? ` ${this.props.additionalTrackInfoClassName}`
              : ""
          }`}
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
          {this.props.showPlayButton && this.props.previewUrl && (
            <FaPlay
              className={`${styles.iconButton} ${styles.playIcon}`}
              onClick={() => {
                if (this.props.onPlayButtonClick) {
                  this.props.onPlayButtonClick(
                    this.props.previewUrl || "",
                    this.props.trackAuthor,
                    this.props.trackTitle
                  );
                }
              }}
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
            <a
              href={
                this.props.isSpotifyOpened
                  ? `spotify:track:${this.props.trackId}`
                  : `https://open.spotify.com/track/${this.props.trackId}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <FaSpotify
                className={`${styles.iconButton} ${styles.spotifyIcon}`}
              />
            </a>
          )}
        </div>
      </div>
    );
  }
}
export default Song;
