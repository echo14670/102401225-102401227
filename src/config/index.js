import { DATA_SOURCES, STORAGE_KEY } from "../domain/constants.js";

export const APP_CONFIG = Object.freeze({
  appName: "校园失物招领",
  applicationId: "com.lin.campuslostfound",
  versionName: "1.0.0",
  versionCode: 100,
  defaultDataSource: DATA_SOURCES.LOCAL,
  cloudFunctionName: "campus-lostfound-api",
  cloudSpaceId: ""
});

export function loadRuntimePreferences(storage) {
  const stored = storage?.get(`${STORAGE_KEY}:preferences`, {}) || {};
  return {
    dataSource: stored.dataSource === DATA_SOURCES.UNICLOUD
      ? DATA_SOURCES.UNICLOUD
      : DATA_SOURCES.LOCAL
  };
}

export function saveRuntimePreferences(storage, preferences) {
  storage?.set(`${STORAGE_KEY}:preferences`, preferences);
}
