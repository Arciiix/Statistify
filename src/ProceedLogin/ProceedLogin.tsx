import React from "react";
import queryString from "query-string";

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
    //DEV
    //TODO: Remove the proxy from package.json
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
      return (
        <div>
          <h1>TODO: Make the loading page (for example: loading spinner)</h1>
        </div>
      );
    } else {
      return (
        <div>
          <h1>TODO: Make the error page</h1>
          <h1>Error: {this.state.errorMessage}</h1>
        </div>
      );
    }
  }
}

export default ProceedLogin;
