import React from "react";

import styles from "./Footer.module.css";

interface IFooterProps {
  hideAppName?: boolean;
}

class Footer extends React.Component<IFooterProps, any> {
  render() {
    return (
      <div className={styles.container}>
        {!this.props.hideAppName && (
          <div className={styles.wrapper}>
            <span className={styles.creditText}>Statistify</span>
          </div>
        )}
        <div className={styles.wrapper}>
          <span className={styles.creditText}>
            Made with ❤️ by{" "}
            <a
              className={styles.creditLink}
              href="https://github.com/Arciiix"
              target="_blank"
              rel="noreferrer"
            >
              Arciiix
            </a>
          </span>
        </div>
      </div>
    );
  }
}

export default Footer;
