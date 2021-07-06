import React from "react";
import LogOut from "../../LogOut/LogOut";
import { checkForLoginValidity } from "../../Account";

import { FaSearch } from "react-icons/fa";
import styles from "./RecommendationsSetup.module.css";

import Song from "../../Song/Song";
import Loading from "../../Loading/Loading";

interface IRecommendationsTrack {
  id: string;
  title: string;
  author: string;
  album: string;
  coverURL: string;
  lengthMs: number;
}

interface IRecommendationsSetupState {
  searchResults: Array<IRecommendationsTrack> | null;
  searchQuery: string;
  lastSearch: string;
  isLoading: boolean;
}

class RecommendationsSetup extends React.Component<
  any,
  IRecommendationsSetupState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchResults: null,
      searchQuery: "",
      lastSearch: "",
      isLoading: false,
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();
  }

  async search() {
    if (this.state.searchQuery === this.state.lastSearch) return;
    if (this.state.searchQuery.replace(/\s/g, "") == "") return;

    let request = await fetch(
      `/api/search/songs?q=${encodeURIComponent(this.state.searchQuery)}`
    );
    let response = await request.json();

    if (request.status !== 200 || response.error) {
      //DEV
      //TODO: Handle an error
      console.log(`ERROR: ${response.errorMessage}`);
    }

    console.log(response);

    let serializedData: Array<IRecommendationsTrack> | null = [];
    serializedData = response.data.map((e: any) => {
      let authors = e.artists.map((e: any) => e.name);
      let track: IRecommendationsTrack = {
        id: e.id,
        title: e.name,
        author: authors.join(", "),
        album: e.album.name,
        coverURL: e.album.images[0].url,
        lengthMs: e.duration_ms,
      };
      return track;
    });

    this.setState({
      lastSearch: this.state.searchQuery,
      searchResults: serializedData,
    });
  }

  selectTrack(trackId: string): void {
    window.location.href = `/recommendations?id=${encodeURIComponent(trackId)}`;
  }

  render() {
    return (
      <div className={styles.container}>
        <div>
          <LogOut />
          <div
            className={styles.logo}
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
              className={styles.logoImg}
            />
            <span className={styles.logoText}>Rekomendacje</span>
          </div>
          <div className={styles.searchDiv}>
            <input
              className={styles.search}
              placeholder={"Tytuł piosenki"}
              value={this.state.searchQuery}
              onChange={(e) =>
                this.setState({ searchQuery: e.currentTarget.value })
              }
              onKeyDown={(e) => {
                if (e.key.toLowerCase() === "enter") this.search();
              }}
            />
          </div>
          <div className={styles.submitWrapper}>
            <button className={styles.submit} onClick={this.search.bind(this)}>
              <FaSearch className={styles.submitIcon} /> <span>Szukaj</span>
            </button>
          </div>
        </div>
        <div className={styles.searchResults}>
          {!this.state.searchResults && (
            <div className={styles.searchTip}>
              <span>Nic tu nie ma!</span>
              <span>Wyszukaj coś...</span>
            </div>
          )}
          {this.state.isLoading && <Loading />}
          {(this.state.searchResults?.length || 0) > 0 && (
            <div>
              {this.state.searchResults?.map((e: IRecommendationsTrack) => {
                return (
                  <Song
                    trackId={e.id}
                    trackTitle={e.title}
                    trackAuthor={e.author}
                    trackAlbum={e.album}
                    trackLengthMs={e.lengthMs}
                    showCover
                    coverImageURL={e.coverURL}
                    showPlayButton={false}
                    showYouTubeButton
                    showSpotifyButton
                    additionalContainerClassName={styles.songContainer}
                    additionalTrackInfoClassName={styles.songTrack}
                    onTrackInfoClick={this.selectTrack.bind(this)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default RecommendationsSetup;
