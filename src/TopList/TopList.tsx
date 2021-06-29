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
}

class TopList extends React.Component<any, TopListState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
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
      numberOfResults > 100
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
      await this.getTheTopList(settings);
    }
  }

  async getTheTopList(settings: ISettings): Promise<void> {
    let queryParams: string = queryString.stringify(settings);
    let topListRequest = await fetch(`/api/getTopList?${queryParams}`);
    let topListResponse = await topListRequest.json();
    console.log(topListResponse);
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
    } else {
      return <div className={styles.container}></div>;
    }
  }
}

export default TopList;
