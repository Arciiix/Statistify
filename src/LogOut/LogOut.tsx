import React from "react";

import styles from "./LogOut.module.css";
import { FiLogOut } from "react-icons/fi";

class LogOut extends React.Component<any, any> {
  async removeTokenCookie() {
    let request = await fetch(`/api/logOut`, { method: "DELETE" });
    if (request.status !== 200) {
      //DEV
      //TODO: Log error
    }

    let response = await request.json();
    if (response.error) {
      //DEV
      //TODO: Log error
    } else {
      window.location.href = "/";
      window.location.reload();
    }
  }
  render() {
    return (
      <div className={styles.logOutContainer}>
        <FiLogOut
          className={styles.logOutIcon}
          onClick={this.removeTokenCookie}
        />
      </div>
    );
  }
}

export default LogOut;
