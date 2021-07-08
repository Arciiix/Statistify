import React from "react";
import LogOut from "../LogOut/LogOut";
import { checkForLoginValidity } from "../Account";
import queryString from "query-string";

import styles from "./PlaylistExport.module.css";

import Loading from "../Loading/Loading";
import Playlist from "../Playlist/Playlist";

interface IPlaylist {
  id: string;
  name: string;
  numberOfSongs: number;
  coverURL?: string;
  firstSongsCoverURLs: Array<string> | null;
}

interface ITrack {
  id: string;
  title: string;
  author: string;
  album: string;
  coverURL?: string;
  lengthMs: number;
  previewUrl: string;
}

type combineTypes<T> = { [K in keyof T]: T[K] };
type statistifyExportedDataCombined = IPlaylist & {
  tracks?: Array<ITrack>;
  exportDate?: number;
  credit?: string;
};
type statistifyExportedData = combineTypes<statistifyExportedDataCombined>;

interface IPlaylistExportState {
  isLoading: boolean;
  isSpotifyOpened: boolean;
  playlist: IPlaylist;
  downloadProcess: {
    isDownloading: boolean;
    downloadProgress: number;
    currentPage: number;
    totalPages: number;
  };
  downloadedTracksSimplified: Array<ITrack>;
  exportedData: any;
  dataInJSON: {
    full: string;
    statistifyVersion: string;
  };
}

class PlaylistExport extends React.Component<any, IPlaylistExportState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true,
      isSpotifyOpened: false,
      playlist: {
        id: "",
        name: "Playlista",
        numberOfSongs: 0,
        firstSongsCoverURLs: null,
      },
      downloadProcess: {
        isDownloading: true,
        downloadProgress: 0,
        currentPage: 1,
        totalPages: 1,
      },
      downloadedTracksSimplified: [],
      exportedData: {},
      dataInJSON: {
        full: "",
        statistifyVersion: "",
      },
    };
  }

  async componentDidMount() {
    await checkForLoginValidity();

    const parsedQueryParams = queryString.parse(this.props.location.search);
    if (!parsedQueryParams.id) {
      window.location.href = "/playlistExport/setup";
      return;
    }

    let playlistId = parsedQueryParams.id;

    let playlistRequest = await fetch(
      `/api/getPlaylist?id=${encodeURIComponent(playlistId as string)}`
    );
    let playlistResponse = await playlistRequest.json();

    if (playlistRequest.status !== 200 || playlistResponse.error) {
      //DEV
      //TODO: Handle an error
      return;
    }

    let playlist: IPlaylist = {
      id: playlistResponse.data.id,
      name: playlistResponse.data.name,
      numberOfSongs: playlistResponse.data.tracks.total,
      coverURL: playlistResponse.data?.images?.[0]?.url || null,
      firstSongsCoverURLs:
        playlistResponse.data?.firstFourTracks?.map(
          (elem: any) => elem?.album?.images?.[0]?.url || ""
        ) || null,
    };

    let exportedData = playlistResponse.data;
    exportedData.tracks.items = [];
    exportedData.exportDate = new Date().getTime();
    exportedData.credit = "Exported by Statistify - made by Arciiix";

    this.setState(
      {
        isLoading: false,
        isSpotifyOpened:
          window.sessionStorage.getItem("isSpotifyOpened") === "true" || false,
        playlist: playlist,
        exportedData: exportedData,
      },
      this.downloadNextPage.bind(this)
    );
  }

  async downloadNextPage() {
    if (
      this.state.downloadProcess.currentPage >
      this.state.downloadProcess.totalPages
    )
      return;
    let tracksRequest = await fetch(
      `/api/getPlaylistItems/${
        this.state.downloadProcess.currentPage
      }?id=${encodeURIComponent(this.state.playlist.id)}`
    );
    let tracksResponse = await tracksRequest.json();

    if (tracksRequest.status !== 200 || tracksResponse.error) {
      //DEV
      //Handle an error
      return;
    }

    let tracks = tracksResponse.data.items;

    let simplifiedTracks: Array<ITrack> = tracks.map((e: any) => {
      if (!e.track) return;
      let authors = e.track.artists.map((elem: any) => elem.name);
      return {
        id: e.track.id,
        title: e.track.name,
        author: authors.join(", "),
        album: e.track.album.name,
        coverURL: e.track.album.images[0].url,
        lengthMs: e.track.duration_ms,
        previewUrl: e.track.preview_url,
      };
    });

    let currentExportedDataObject = this.state.exportedData;
    currentExportedDataObject.tracks.items = [
      ...currentExportedDataObject.tracks.items,
      ...tracks,
    ];

    this.setState(
      {
        downloadProcess: {
          isDownloading:
            this.state.downloadProcess.currentPage + 1 >
            tracksResponse.data.totalPages
              ? false
              : true,
          totalPages: tracksResponse.data.totalPages,
          currentPage: this.state.downloadProcess.currentPage + 1,
          downloadProgress: Math.ceil(
            (this.state.downloadProcess.currentPage /
              tracksResponse.data.totalPages) *
              100
          ),
        },
        downloadedTracksSimplified: [
          ...(this.state.downloadedTracksSimplified as Array<ITrack>),
          ...simplifiedTracks,
        ],
        exportedData: currentExportedDataObject,
      },
      () => {
        if (
          this.state.downloadProcess.currentPage <=
          this.state.downloadProcess.totalPages
        ) {
          setTimeout(() => {
            this.downloadNextPage();
          }, 500);
        } else {
          let statistifyVersion: statistifyExportedData = this.state.playlist;
          statistifyVersion.tracks = this.state.downloadedTracksSimplified;
          statistifyVersion.exportDate = new Date().getTime();
          statistifyVersion.credit = "Exported by Statistify - made by Arciiix";

          this.setState({
            dataInJSON: {
              full: JSON.stringify(this.state.exportedData),
              statistifyVersion: JSON.stringify(statistifyVersion),
            },
          });
        }
      }
    );
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
    } else {
      return (
        <div className={styles.container}>
          <LogOut />
          <div
            className={styles.logo}
            onClick={() => (window.location.href = "/")}
          >
            <img
              src={process.env.PUBLIC_URL + "/icon/icon1024.png"}
              className={styles.logoImg}
            />
            <span className={styles.logoText}>Export playlisty</span>
          </div>
          <div className={styles.playlistWrapper}>
            <Playlist
              key={this.state.playlist.id}
              playlistId={this.state.playlist.id}
              playlistName={this.state.playlist.name}
              numberOfSongs={this.state.playlist.numberOfSongs}
              isSpotifyOpened={this.state.isSpotifyOpened}
              showSpotifyButton
              additionalContainerClassName={styles.playlistContainer}
              additionalPlaylistInfoClassName={styles.playlistInfo}
              coverImageURLs={
                this.state.playlist.coverURL
                  ? [this.state.playlist.coverURL]
                  : this.state.playlist.firstSongsCoverURLs || []
              }
            />
          </div>
          <div className={styles.download}>
            {this.state.downloadProcess.isDownloading && (
              <div className={styles.loadingDiv}>
                <div className={styles.loadingWrapper}>
                  <div className={styles.loadingBackground}></div>
                  <div
                    className={styles.loading}
                    style={{
                      width: `${this.state.downloadProcess.downloadProgress}%`,
                    }}
                  ></div>
                </div>
                <span className={styles.downloadProgressText}>
                  {this.state.downloadProcess.downloadProgress}%
                </span>
              </div>
            )}
            {!this.state.downloadProcess.isDownloading && (
              <div className={styles.downloadButtonsDiv}>
                <button className={styles.downloadButton}>
                  Pobierz plik Statistify (zalecane) (DEV: SIZE HERE)
                </button>
                <button className={styles.downloadButton}>
                  Pobierz szczegółowy plik (DEV: SIZE HERE)
                </button>
                {this.state.dataInJSON.statistifyVersion}
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

export default PlaylistExport;
