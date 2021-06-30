import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getBackgroundColor } from "../BackgroundColor";

import { FaSpotify, FaYoutube } from "react-icons/fa";

import styles from "./Artist.module.css";

interface IArtistProps {
  artistId: string;
  artistName: string;
  showCover: boolean;
  coverImageURL?: string;
  additionalContainerClassName?: string;
  additionalArtistNameClassName?: string;
  showYouTubeButton?: boolean;
  showSpotifyButton?: boolean;
}

interface IArtistState {
  backgroundColor: string;
}

class Artist extends React.Component<IArtistProps, IArtistState> {
  constructor(props: IArtistProps) {
    super(props);
    this.state = {
      backgroundColor: "#505254",
    };
  }

  static defaultProps = {
    artistId: "",
    artistName: "Artysta",
    showCover: false,
    showYouTubeButton: true,
    showSpotifyButton: true,
  };

  async setBackgroundColor(): Promise<void> {
    let color = await getBackgroundColor(this.props.coverImageURL as string);
    this.setState({ backgroundColor: color });
  }

  render() {
    return (
      <div
        className={`${styles.artistContainer}${
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
          className={`${styles.artistName}${
            this.props.additionalArtistNameClassName
              ? ` ${this.props.additionalArtistNameClassName}`
              : ""
          }`}
        >
          <span className={styles.artistNameText}>{this.props.artistName}</span>
        </div>

        <div className={styles.playButtons}>
          {this.props.showYouTubeButton && (
            <a
              href={`https://www.youtube.com/results?search_query=${this.props.artistName}`}
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
export default Artist;
