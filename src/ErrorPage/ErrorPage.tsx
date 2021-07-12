import React from "react";
import queryString from "query-string";

import styles from "./ErrorPage.module.css";

interface IErrorPageState {
  error: string;
}

class ErrorPage extends React.Component<any, IErrorPageState> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: "",
    };
  }

  componentDidMount() {
    if (this.props.error) {
      this.setState({ error: this.props.error });
    } else {
      const parsedQueryParams = queryString.parse(this.props.location.search);
      if (!parsedQueryParams.error) {
        this.setState({ error: "UNKNOWN; MISSING_ERROR_PARAM" });
      } else {
        this.setState({ error: parsedQueryParams.error as string });
      }
    }
  }

  goToTheHomePage() {
    window.location.href = "/";
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div
            className={styles.logo}
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
              className={styles.logoImg}
            />
            <span className={styles.logoText}>Error</span>
          </div>
          <span className={`${styles.errorHeader}`}>
            Oh no... <span className={styles.dontBreak}>:(</span>
          </span>
        </div>
        <div className={styles.wrapper}>
          <span className={`${styles.errorText} ${styles.bold}`}>
            Kod błędu:{" "}
          </span>
          <span className={styles.errorText}>{this.state.error}</span>
        </div>
        <div className={styles.wrapper}>
          <button className={styles.btn} onClick={this.goToTheHomePage}>
            Strona główna
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorPage;
