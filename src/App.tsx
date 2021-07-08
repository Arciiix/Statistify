import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";

//Components
import Home from "./Home/Home";
import ProceedLogin from "./ProceedLogin/ProceedLogin";
import TopList from "./TopList/TopList";
import TopListSetup from "./TopList/TopListSetup/TopListSetup";
import RecommendationsSetup from "./Recommendations/RecommendationsSetup/RecommendationsSetup";
import Recommendations from "./Recommendations/Recommendations";
import PlaylistExportSetup from "./PlaylistExport/PlaylistExportSetup/PlaylistExportSetup";
import PlaylistExport from "./PlaylistExport/PlaylistExport";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/topList" exact component={TopList} />{" "}
        {/*I need to pass the component in-line because I will access the query parameters in it */}
        <Route path="/topList/setup" exact>
          <TopListSetup />
        </Route>
        <Route path="/recommendations" exact component={Recommendations} />{" "}
        {/*I need to pass the component in-line because I will access the query parameters in it */}
        <Route path="/recommendations/setup" exact>
          <RecommendationsSetup />
        </Route>
        <Route path="/playlistExport" exact component={PlaylistExport} />{" "}
        {/*I need to pass the component in-line because I will access the query parameters in it */}
        <Route path="/playlistExport/setup" exact>
          <PlaylistExportSetup />
        </Route>
        <Route path="/proceedLogin" exact component={ProceedLogin} />{" "}
        {/*I need to pass the component in-line because I will access the query parameters in it */}
      </Switch>
    </Router>
  );
}

export default App;
