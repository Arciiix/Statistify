import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";

//Components
import Home from "./Home/Home";
import ProceedLogin from "./ProceedLogin/ProceedLogin";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/proceedLogin" exact component={ProceedLogin} />{" "}
        {/*I need to pass the component in-line because I will access the query parameters in it */}
      </Switch>
    </Router>
  );
}

export default App;
