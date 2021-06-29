import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./TopList.module.css";

import { topResourceType, topTimePeriod } from "./TopListTypes";
import type { ISettings } from "./TopListTypes";

import Loading from "../Loading/Loading";

interface TopListState {
  isLoading: boolean;
  resourceType: topResourceType;
  numberOfResults: number;
  data: any;
}

class TopList extends React.Component<any, TopListState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      resourceType: topResourceType.songs,
      numberOfResults: 0,
      data: {},
    };
  }

  async componentDidMount(): Promise<void> {
    await checkForLoginValidity();
    const parsedQueryParams = queryString.parse(this.props.location.search);

    let numberOfResults: number | null =
      parseInt(parsedQueryParams.numberOfResults as string) || null;

    let resourceType: string | null =
      topResourceType[parseInt(parsedQueryParams.resourceType as string)] ||
      null;

    let timePeriod: string | null =
      topTimePeriod[parseInt(parsedQueryParams.timePeriod as string)] || null;

    console.log(resourceType);

    if (
      !numberOfResults ||
      !resourceType ||
      !timePeriod ||
      numberOfResults < 1 ||
      numberOfResults > 50
    ) {
      //DEV
      //TODO: Log error
      window.location.href = "/topList/setup";
    } else {
      let settings: ISettings = {
        numberOfResults,
        resourceType: (resourceType as unknown) as topResourceType,
        timePeriod: (timePeriod as unknown) as topTimePeriod,
      };
      /*
      DEV - UNCOMMENT THIS!
      await this.getTheTopList(settings);
      */

      //DEV
      this.setState({
        isLoading: false,
        resourceType: settings.resourceType as topResourceType,
        numberOfResults: settings.numberOfResults,
      });
    }
  }

  async getTheTopList(settings: ISettings): Promise<void> {
    let queryParams: string = queryString.stringify(settings);
    let topListRequest = await fetch(`/api/getTopList?${queryParams}`);
    if (topListRequest.status !== 200) {
      //DEV
      //TODO: Log error
    }
    let topListResponse = await topListRequest.json();
    if (topListResponse.error) {
      //DEV
      //TODO: Log error
      return;
    }
    this.setState({
      isLoading: false,
      resourceType: settings.resourceType as topResourceType,
      numberOfResults: settings.numberOfResults,
      data: topListResponse,
    });
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
    } else {
      return (
        <div className={styles.container}>
          <span className={styles.header}>
            Oto Twoje Top {this.state.numberOfResults}{" "}
            {((this.state.resourceType as unknown) as string) == "artists"
              ? "Artystów"
              : "Piosenek"}
          </span>
        </div>
      );
    }
  }
}

export default TopList;
