import React from "react";
import LogOut from "../../LogOut/LogOut";

import styles from "./TopListSetup.module.css";

class TopListSetup extends React.Component<any, any> {
  async componentDidMount(): Promise<void> {
    //TODO: Think about moving this function to another file (DRY)
    let userAuthRequest = await fetch("/api/getUserData");
    let userAuthResponse = await userAuthRequest.json();

    if (userAuthResponse.error) {
      if (userAuthResponse.errorMessage == "INVALID_TOKEN") {
        window.location.href = "/";
      }
    }
  }
  render() {
    return (
      <div className={styles.container}>
        <LogOut />
        <div className={styles.logo}>
          <img
            src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
            className={styles.logoImg}
          />
          <span className={styles.logoText}>Top lista</span>
        </div>
      </div>
    );
  }
}

export default TopListSetup;
