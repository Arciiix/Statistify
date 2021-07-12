import React from "react";

import styles from "./Loading.module.css";

interface ILoadingProps {
  fullScreen?: boolean;
}

class Loading extends React.Component<ILoadingProps, any> {
  render() {
    return (
      <div
        className={`${styles.container}${
          this.props.fullScreen ? ` ${styles.fullScreen}` : ""
        }`}
      >
        <div className={styles.dotsWrapper}>
          <div className={`${styles.dot} ${styles.dot1}`}></div>
          <div className={`${styles.dot} ${styles.dot2}`}></div>
          <div className={`${styles.dot} ${styles.dot3}`}></div>
        </div>
        <span className={styles.loadingText}>Ładowanie...</span>
      </div>
    );
  }
}

export default Loading;
