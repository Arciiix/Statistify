import React from "react";
import queryString from "query-string";
import Loading from "../Loading/Loading";
import ErrorPage from "../ErrorPage/ErrorPage";

interface ProceedLoginState {
  error: boolean;
  errorMessage: string | string[];
}
class ProceedLogin extends React.Component<any, ProceedLoginState> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: false,
      errorMessage: "",
    };
  }
  componentDidMount() {
    const parsedQueryParams = queryString.parse(this.props.location.search);

    if (parsedQueryParams?.error === "access_denied") {
      window.location.href = "/";
      return;
    }

    if (parsedQueryParams.code) {
      if (parsedQueryParams.error && parsedQueryParams.error !== "") {
        this.setState(
          { error: true, errorMessage: parsedQueryParams.error || "" },
          this.forceUpdate
        );
      } else {
        this.logIn(parsedQueryParams.code);
      }
    } else {
      this.setState(
        { error: true, errorMessage: parsedQueryParams.error || "" },
        this.forceUpdate
      );
    }
  }

  async logIn(code: string | string[]): Promise<void> {
    let request = await fetch(`/api/generateToken?code=${code}`);
    let response = await request.json();

    if (!response.error && response.token) {
      this.props.history.replace({ pathname: `/` });
    } else {
      this.setState({ error: true, errorMessage: response.errorMessage });
    }
  }

  render() {
    if (!this.state.error) {
      return <Loading fullScreen />;
    } else {
      return <ErrorPage error={this.state.errorMessage} />;
    }
  }
}

export default ProceedLogin;
