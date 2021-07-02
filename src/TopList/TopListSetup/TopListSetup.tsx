import React from "react";
import LogOut from "../../LogOut/LogOut";
import Slider from "rc-slider";
import { checkForLoginValidity } from "../../Account";
import queryString from "query-string";

import styles from "./TopListSetup.module.css";
import "rc-slider/assets/index.css";

import { topResourceType, topTimePeriod } from "../TopListTypes";
import type { ISettings } from "../TopListTypes";

interface ITopListSetupState {
  settings: ISettings;
}

class TopListSetup extends React.Component<any, ITopListSetupState> {
  constructor(props: any) {
    super(props);
    this.state = {
      settings: {
        resourceType: topResourceType.songs,
        timePeriod: topTimePeriod.oneMonth,
        numberOfResults: 20,
      },
    };
  }
  async componentDidMount(): Promise<void> {
    await checkForLoginValidity();
  }

  generateTopList() {
    let queryParams: string = queryString.stringify(this.state.settings);
    let url = `/topList?${queryParams}`;
    window.location.href = url;
  }

  render() {
    return (
      <div className={styles.container}>
        <LogOut />
        <div
          className={styles.logo}
          onClick={() => (window.location.href = "/")}
        >
          <img
            src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
            className={styles.logoImg}
          />
          <span className={styles.logoText}>Top Lista</span>
        </div>
        <div className={styles.settings}>
          <div className={styles.singleOption}>
            <span className={styles.optionLabel}>Co chcesz zobaczyć?</span>
            <div className={styles.optionButtons}>
              <button
                className={`${styles.optionBtn} ${
                  this.state.settings.resourceType === topResourceType.songs
                    ? styles.optionBtnSelected
                    : styles.optionBtnUnselected
                }`}
                onClick={() => {
                  let settings: ISettings = this.state.settings;
                  settings.resourceType = topResourceType.songs;
                  this.setState({ settings: settings });
                }}
              >
                Utwory
              </button>
              <button
                className={`${styles.optionBtn} ${
                  this.state.settings.resourceType === topResourceType.artists
                    ? styles.optionBtnSelected
                    : styles.optionBtnUnselected
                }`}
                onClick={() => {
                  let settings: ISettings = this.state.settings;
                  settings.resourceType = topResourceType.artists;
                  this.setState({ settings: settings });
                }}
              >
                Artyści
              </button>
            </div>
          </div>
          <div className={styles.singleOption}>
            <span className={styles.optionLabel}>W jakim okresie czasu?</span>
            <div className={styles.optionButtons}>
              <button
                className={`${styles.optionBtn} ${
                  this.state.settings.timePeriod === topTimePeriod.oneMonth
                    ? styles.optionBtnSelected
                    : styles.optionBtnUnselected
                }`}
                onClick={() => {
                  let settings: ISettings = this.state.settings;
                  settings.timePeriod = topTimePeriod.oneMonth;
                  this.setState({ settings: settings });
                }}
              >
                1 miesiąc
              </button>

              <button
                className={`${styles.optionBtn} ${
                  this.state.settings.timePeriod === topTimePeriod.sixMonths
                    ? styles.optionBtnSelected
                    : styles.optionBtnUnselected
                }`}
                onClick={() => {
                  let settings: ISettings = this.state.settings;
                  settings.timePeriod = topTimePeriod.sixMonths;
                  this.setState({ settings: settings });
                }}
              >
                6 miesięcy
              </button>
              <button
                className={`${styles.optionBtn} ${
                  this.state.settings.timePeriod === topTimePeriod.all
                    ? styles.optionBtnSelected
                    : styles.optionBtnUnselected
                }`}
                onClick={() => {
                  let settings: ISettings = this.state.settings;
                  settings.timePeriod = topTimePeriod.all;
                  this.setState({ settings: settings });
                }}
              >
                Zawsze
              </button>
            </div>
          </div>
          <div className={styles.singleOption}>
            <span className={styles.optionLabel}>Ile chcesz wyników?</span>
            <div className={styles.slider}>
              <Slider
                min={1}
                max={50}
                value={this.state.settings.numberOfResults}
                onChange={(e) => {
                  let settings: ISettings = this.state.settings;
                  settings.numberOfResults = e;
                  this.setState({ settings: settings });
                }}
                trackStyle={{ backgroundColor: "#0db850" }}
                handleStyle={{
                  backgroundColor: "#0db850",
                  border: "solid 4px #ffffff",
                }}
              />
              <span className={styles.optionLabel}>
                {this.state.settings.numberOfResults}
              </span>
            </div>
          </div>
          <button
            className={styles.submit}
            onClick={this.generateTopList.bind(this)}
          >
            Sprawdź <span className={styles.submitFullText}>swój ranking</span>
          </button>
        </div>
      </div>
    );
  }
}

export default TopListSetup;
