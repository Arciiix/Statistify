import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getBackgroundColor } from "../BackgroundColor";

import { FaSpotify } from "react-icons/fa";

import styles from "./Playlist.module.css";

interface IPlaylistProps {
  playlistId: string;
  playlistName: string;
  numberOfSongs: number;
  userId: string;
  coverImageURLs: Array<string>;
  showSpotifyButton?: boolean;
  isSpotifyOpened?: boolean;
  additionalContainerClassName?: string;
  onPlaylistClick?: (playlistId: string, playlistName: string) => void;
}

interface IPlaylistState {
  backgroundColor: string;
}

class Playlist extends React.Component<IPlaylistProps, IPlaylistState> {
  constructor(props: IPlaylistProps) {
    super(props);
    this.state = {
      backgroundColor: "#505254",
    };
  }

  static defaultProps = {
    playlistId: "",
    playlistName: "Playlista",
    showCover: true,
    numberOfSongs: 0,
  };

  async setBackgroundColor(): Promise<void> {
    let color: string = await getBackgroundColor(
      this.props.coverImageURLs?.[0] as string
    );

    this.setState({ backgroundColor: color });
  }

  render() {
    return (
      <div
        className={`${styles.playlistContainer}${
          this.props.additionalContainerClassName
            ? ` ${this.props.additionalContainerClassName}`
            : ""
        }`}
        style={{
          backgroundColor: this.state.backgroundColor,
        }}
      >
        <div className={styles.playlistInfoWrapper}>
          <div className={styles.cover}>
            {this.props.coverImageURLs.length === 1 && (
              <LazyLoadImage
                alt={""}
                src={this.props.coverImageURLs[0]}
                effect={"blur"}
                afterLoad={this.setBackgroundColor.bind(this)}
              />
            )}
            {this.props.coverImageURLs.length === 2 && (
              <div className={styles.coverImageSongsWrapper}>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[0]}
                    effect={"blur"}
                    afterLoad={this.setBackgroundColor.bind(this)}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[1]}
                    effect={"blur"}
                  />
                </div>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[0]}
                    effect={"blur"}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[1]}
                    effect={"blur"}
                  />
                </div>
              </div>
            )}
            {this.props.coverImageURLs.length === 3 && (
              <div className={styles.coverImageSongsWrapper}>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[0]}
                    effect={"blur"}
                    afterLoad={this.setBackgroundColor.bind(this)}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[1]}
                    effect={"blur"}
                  />
                </div>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[2]}
                    effect={"blur"}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[0]}
                    effect={"blur"}
                  />
                </div>
              </div>
            )}

            {this.props.coverImageURLs.length === 4 && (
              <div className={styles.coverImageSongsWrapper}>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[0]}
                    effect={"blur"}
                    afterLoad={this.setBackgroundColor.bind(this)}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[1]}
                    effect={"blur"}
                  />
                </div>
                <div className={styles.coverImageSongs}>
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[2]}
                    effect={"blur"}
                  />
                  <LazyLoadImage
                    alt={""}
                    src={this.props.coverImageURLs[3]}
                    effect={"blur"}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className={`${styles.playlistInfo}${
              this.props.onPlaylistClick ? ` ${styles.link}` : ""
            }`}
            onClick={() => {
              if (this.props.onPlaylistClick) {
                this.props.onPlaylistClick(
                  this.props.playlistId,
                  this.props.playlistName
                );
              }
            }}
          >
            <span className={styles.playlistNameText}>
              {this.props.playlistName}
            </span>
            <span className={styles.playlistNumberOfSongsText}>
              Ilość utworów: {this.props.numberOfSongs}
            </span>
          </div>
        </div>

        <div className={styles.playButtons}>
          {this.props.showSpotifyButton && (
            <a
              href={
                this.props.isSpotifyOpened
                  ? `spotify:user:${this.props.userId}:playlists:${this.props.playlistId}`
                  : `https://open.spotify.com/user/${this.props.userId}/playlists/${this.props.playlistId}`
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
export default Playlist;
