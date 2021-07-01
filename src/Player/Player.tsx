import React from "react";
import Slider from "rc-slider";

import {
  FaPlayCircle,
  FaStepBackward,
  FaStepForward,
  FaVolumeDown,
} from "react-icons/fa";
import styles from "./Player.module.css";

interface IPlayerProps {}

interface IPlayerState {
  volume: number;
}

class Player extends React.Component<IPlayerProps, IPlayerState> {
  constructor(props: IPlayerProps) {
    super(props);
    this.state = {
      volume: 50,
    };
  }

  static defaultProps = {};

  render() {
    return (
      <div className={styles.player}>
        <span className={styles.currentlyPlaying}>Artist - title</span>
        <div className={styles.playerSlider}>
          <Slider
            min={1}
            max={50}
            value={20}
            onChange={(e) => {
              console.log(e);
            }}
            trackStyle={{ backgroundColor: "#0db850" }}
            handleStyle={{
              backgroundColor: "#0db850",
              border: "solid 4px #ffffff",
            }}
          />
        </div>
        <div className={styles.playerTime}>
          <span>00:00</span>
          <span>00:00</span>
        </div>
        <div className={styles.playerControls}>
          <FaStepBackward className={styles.playerControlsIcon} />
          <FaPlayCircle className={styles.playerControlsPlay} />
          <FaStepForward className={styles.playerControlsIcon} />
        </div>
        <div className={styles.audioControl}>
          <FaVolumeDown />
          <Slider
            className={styles.audioControlSlider}
            min={1}
            max={100}
            value={this.state.volume}
            onChange={(e) => {
              //DEV
              //Change volume
              this.setState({ volume: e });
            }}
            trackStyle={{ backgroundColor: "#0db850" }}
            handleStyle={{
              backgroundColor: "#0db850",
              border: "solid 4px #ffffff",
            }}
          />
        </div>
      </div>
    );
  }
}
export default Player;
