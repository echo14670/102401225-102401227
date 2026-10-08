import { computed, reactive } from "vue";
import { APP_CONFIG } from "../config/index.js";
import { DATA_SOURCES } from "../domain/constants.js";
import { createRepository } from "../repositories/index.js";
import { createUniStorageAdapter } from "../services/storage.js";
import { generateId } from "../services/id.js";

const state = reactive({
  ready: false,
  loading: false,
  error: "",
  dataSource: APP_CONFIG.defaultDataSource,
  items: [],
  clientId: "",
  profile: {
    id: "local-user",
    displayName: "李同学",
    defaultContact: "微信 lixx_0921"
  },
  recentSearches: []
});

let storage = null;
let repository = null;
let clientId = "";

function getClientId() {
  if (clientId) return clientId;
  clientId = storage?.get("campus-lost-found:client-id", "") || "";
  if (!clientId) {
    clientId = generateId("client");
    storage?.set("campus-lost-found:client-id", clientId);
  }
  return clientId;
}

function createCallFunction() {
  return (options) => {
    if (!globalThis.uniCloud?.callFunction) {
      return Promise.reject(new Error("当前环境未配置 uniCloud"));
    }
    return globalThis.uniCloud.callFunction(options);
  };
}

function buildRepository(dataSource) {
  if (dataSource === DATA_SOURCES.UNICLOUD) {
    return createRepository({
      dataSource,
      callFunction: createCallFunction(),
      clientId: getClientId()
    });
  }

  return createRepository({
    dataSource,
    storage,
    generateId
  });
}

function adoptSnapshot(snapshot) {
  state.items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  state.profile = snapshot?.profile || state.profile;
  state.recentSearches = Array.isArray(snapshot?.recentSearches)
    ? snapshot.recentSearches
    : [];
}

async function refresh() {
  if (!repository) return;
  state.loading = true;
  state.error = "";
  try {
    const snapshot = await repository.initialize();
    if (snapshot && Array.isArray(snapshot.items)) {
      adoptSnapshot(snapshot);
    }
    state.items = await repository.listItems({});
    state.ready = true;
  } catch (error) {
    state.error = error.message || "加载数据失败";
    throw error;
  } finally {
    state.loading = false;
  }
}

export function useItemStore() {
  async function initialize() {
    if (state.ready && repository) return;
  storage = createUniStorageAdapter();
  state.clientId = getClientId();
  repository = buildRepository(state.dataSource);
    await refresh();
  }

  async function switchDataSource(dataSource) {
    if (![DATA_SOURCES.LOCAL, DATA_SOURCES.UNICLOUD].includes(dataSource)) return;
    state.dataSource = dataSource;
    repository = buildRepository(dataSource);
    state.ready = false;
    await refresh();
  }

  async function createItem(draft) {
    const item = await repository.create(draft);
    state.items.unshift(item);
    return item;
  }

  async function updateItem(id, patch) {
    const item = await repository.update(id, patch);
    const index = state.items.findIndex((entry) => entry.id === id);
    if (index >= 0) state.items.splice(index, 1, item);
    return item;
  }

  async function deleteItem(id) {
    const item = await repository.remove(id);
    state.items = state.items.filter((entry) => entry.id !== id);
    return item;
  }

  async function setItemStatus(id, status) {
    const item = await repository.changeStatus(id, status);
    const index = state.items.findIndex((entry) => entry.id === id);
    if (index >= 0) state.items.splice(index, 1, item);
    return item;
  }

  function getItem(id) {
    return state.items.find((item) => item.id === id) || null;
  }

  function rememberSearch(query) {
    const clean = String(query || "").trim();
    if (!clean) return;
    state.recentSearches = [
      clean,
      ...state.recentSearches.filter((item) => item !== clean)
    ].slice(0, 8);
  }

  async function exportData() {
    return repository.exportSnapshot();
  }

  async function importData(snapshot) {
    const value = await repository.importSnapshot(snapshot);
    adoptSnapshot(value);
    await refresh();
    return value;
  }

  async function resetData() {
    const value = await repository.reset();
    adoptSnapshot(value);
    await refresh();
    return value;
  }

  return {
    state,
    ready: computed(() => state.ready),
    items: computed(() => state.items),
    initialize,
    refresh,
    switchDataSource,
    createItem,
    updateItem,
    deleteItem,
    setItemStatus,
    getItem,
    rememberSearch,
    exportData,
    importData,
    resetData
  };
}
