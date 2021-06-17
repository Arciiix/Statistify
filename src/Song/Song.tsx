import React from "react";

import { FaSpotify, FaYoutube, FaPlay } from "react-icons/fa";

import styles from "./Song.module.css";

class Song extends React.Component<any, any> {
  render() {
    return (
      <div className={styles.songContainer}>
        <div className={styles.cover}>
          <img src={process.env.PUBLIC_URL + "/coverDev.png"} />
        </div>
        <div className={styles.trackInfo}>
          <div className={styles.titleAndAuthor}>
            <span className={styles.title}>
              Title Title Title Title Title Title Title Title
            </span>
            <span className={styles.author}>
              Author Author Author Author Author
            </span>
          </div>
          <div className={styles.trackLength}>00:00</div>
        </div>
        <div className={styles.playButtons}>
          <FaPlay className={`${styles.iconButton} ${styles.playIcon}`} />
          <FaYoutube className={`${styles.iconButton} ${styles.youTubeIcon}`} />
          <FaSpotify className={`${styles.iconButton} ${styles.spotifyIcon}`} />
        </div>
      </div>
    );
  }
}
export default Song;
