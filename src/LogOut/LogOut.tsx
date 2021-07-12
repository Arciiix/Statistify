import React from "react";

import styles from "./LogOut.module.css";
import { FiLogOut } from "react-icons/fi";

class LogOut extends React.Component<any, any> {
  async removeTokenCookie() {
    let request = await fetch(`/api/logOut`, { method: "DELETE" });
    if (request.status !== 200) {
      window.location.href = `/error?error=${encodeURIComponent(
        await request.text()
      )}`;
    }

    let response = await request.json();
    if (response.error) {
      window.location.href = `/error?error=${encodeURIComponent(
        response.errorMessage
      )}`;
    } else {
      window.location.href = "/";
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
