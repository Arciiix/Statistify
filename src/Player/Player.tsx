import React from "react";
import Slider from "rc-slider";

import {
  FaPauseCircle,
  FaPlayCircle,
  FaStepBackward,
  FaStepForward,
  FaVolumeDown,
} from "react-icons/fa";
import styles from "./Player.module.css";

interface IPlayerProps {
  trackName: string;
  url: string;
  disableShortcuts?: boolean;
}

interface IPlayerState {
  volume: number;
  currentPosition: number;
  length: number;
  isPlaying: boolean;
  isChanging: boolean;
  prevURL: string;
}

class Player extends React.Component<IPlayerProps, IPlayerState> {
  audio: HTMLAudioElement;
  constructor(props: IPlayerProps) {
    super(props);
    this.state = {
      volume: 50,
      currentPosition: 0,
      length: 0,
      isPlaying: false,
      isChanging: false,
      prevURL: "",
    };
    this.audio = new Audio();
  }

  static defaultProps = {
    url: "",
    trackName: "Song",
  };

  componentDidMount() {
    this.audio.src = this.props.url;

    this.audio.addEventListener("durationchange", (e) => {
      this.setState({ length: this.audio.duration || 0 });
    });

    setInterval(this.updatePosition.bind(this), 1000);
    setInterval(this.waitForAudio.bind(this), 500);

    if (!this.props.disableShortcuts) {
      document.addEventListener("keydown", (e) => {
        switch (e.code.toLowerCase()) {
          case "arrowleft":
            let pos = this.state.currentPosition - 5;
            if (pos < 0) pos = 0;
            this.audio.currentTime = pos;
            this.audio.play();
            this.setState({ currentPosition: pos });
            break;
          case "arrowright":
            let position = this.state.currentPosition + 5;
            if (position > this.state.length) position = this.state.length;
            this.audio.currentTime = position;
            this.audio.play();
            this.setState({ currentPosition: position });
            break;
          case "space":
            e.preventDefault();
            this.tooglePlay();
            break;
          case "arrowdown":
            if (!e.ctrlKey) return;
            let vol = this.state.volume - 10;
            if (vol < 0) vol = 0;
            this.audio.volume = vol / 100;
            this.setState({ volume: vol });
            break;
          case "arrowup":
            if (!e.ctrlKey) return;
            let volume = this.state.volume + 10;
            if (volume > 100) volume = 100;
            this.audio.volume = volume / 100;
            this.setState({ volume: volume });
        }
      });
    }
  }

  tooglePlay() {
    let isPlaying: boolean = !this.state.isPlaying;
    if (isPlaying) {
      this.audio.play();
    } else {
      this.audio.pause();
    }

    this.setState({ isPlaying });
  }

  updatePosition(): void {
    if (!this.audio || this.audio.paused) return;
    if (this.state.isChanging) return;

    this.setState({
      currentPosition: this.audio.currentTime,
      isPlaying: !this.audio.paused,
    });
  }

  waitForAudio(): void {
    let prevURL = this.state.prevURL;
    if (prevURL !== this.props.url) {
      this.audio.pause();
      this.audio.src = this.props.url;
      this.audio.currentTime = 0;
      this.audio.play();
      prevURL = this.props.url;
      this.setState({ prevURL: prevURL, isPlaying: true });
    }
  }

  formatTime(time: number): string {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    return `${this.addZero(minutes)}:${this.addZero(seconds)}`;
  }

  addZero(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  render() {
    return (
      <div className={styles.player}>
        <span className={styles.currentlyPlaying}>{this.props.trackName}</span>
        <div className={styles.playerSlider}>
          <Slider
            min={0}
            max={this.state.length}
            value={this.state.currentPosition}
            onChange={(e) => this.setState({ currentPosition: e })}
            onBeforeChange={() => this.setState({ isChanging: true })}
            onAfterChange={(e) => {
              this.audio.currentTime = e;
              this.setState({ currentPosition: e, isChanging: false });
            }}
            trackStyle={{ backgroundColor: "#0db850", height: "10px" }}
            railStyle={{ height: "10px" }}
            handleStyle={{
              backgroundColor: "#0db850",
              border: "solid 3px #ffffff",
              width: "20px",
              height: "20px",
            }}
          />
        </div>
        <div className={styles.playerTime}>
          <span>{this.formatTime(this.state.currentPosition)}</span>
          <span>{this.formatTime(this.state.length)}</span>
        </div>
        <div className={styles.playerControlsDiv}>
          <div className={styles.whiteSpace}></div>
          <div className={styles.playerControls}>
            <FaStepBackward
              className={styles.playerControlsIcon}
              onClick={() => {
                let position = this.state.currentPosition - 5;
                if (position < 0) position = 0;
                this.audio.currentTime = position;
                this.audio.play();
                this.setState({ currentPosition: position, isPlaying: true });
              }}
            />
            {this.state.isPlaying ? (
              <FaPauseCircle
                className={styles.playerControlsPlay}
                onClick={this.tooglePlay.bind(this)}
              />
            ) : (
              <FaPlayCircle
                className={styles.playerControlsPlay}
                onClick={this.tooglePlay.bind(this)}
              />
            )}
            <FaStepForward
              className={styles.playerControlsIcon}
              onClick={() => {
                let position = this.state.currentPosition + 5;
                if (position > this.state.length) position = this.state.length;
                this.audio.currentTime = position;
                this.audio.play();
                this.setState({ currentPosition: position, isPlaying: true });
              }}
            />
          </div>
          <div className={styles.audioControl}>
            <FaVolumeDown />
            <Slider
              className={styles.audioControlSlider}
              min={1}
              max={100}
              value={this.state.volume}
              onChange={(e) => {
                this.audio.volume = e / 100;
                this.setState({ volume: e });
              }}
              trackStyle={{ backgroundColor: "#0db850" }}
              handleStyle={{
                backgroundColor: "#0db850",
                border: "solid 2px #ffffff",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Player;
