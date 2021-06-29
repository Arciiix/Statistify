enum topResourceType {
  songs,
  artists,
}

enum topTimePeriod {
  oneMonth,
  sixMonths,
  all,
}

interface ISettings {
  resourceType: topResourceType;
  timePeriod: topTimePeriod;
  numberOfResults: number;
}

export { topResourceType, topTimePeriod };
export type { ISettings };
