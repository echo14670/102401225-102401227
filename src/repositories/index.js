import { DATA_SOURCES } from "../domain/constants.js";
import { createLocalRepository } from "./local.js";
import { createUniCloudRepository } from "./unicloud.js";

export function createRepository(options = {}) {
  const dataSource = options.dataSource || DATA_SOURCES.LOCAL;
  if (dataSource === DATA_SOURCES.UNICLOUD) {
    return createUniCloudRepository(options);
  }
  return createLocalRepository(options);
}
