import {
  LOCAL_OWNER_ID,
  STORAGE_KEY,
  STORAGE_SCHEMA_VERSION
} from "../domain/constants.js";
import { createSeedItems } from "../domain/seed.js";
import { cleanText, validateItemDraft, validateStoredItem } from "../domain/validation.js";
import { cloneItem, getItemVisual } from "../domain/items.js";
import { generateId } from "../services/id.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialSnapshot() {
  return {
    version: STORAGE_SCHEMA_VERSION,
    profile: {
      id: LOCAL_OWNER_ID,
      displayName: "李同学",
      defaultContact: "微信 lixx_0921"
    },
    items: createSeedItems(),
    recentSearches: []
  };
}

function normalizeSnapshot(value) {
  if (!value || typeof value !== "object") {
    return createInitialSnapshot();
  }

  const items = Array.isArray(value.items)
    ? value.items.filter(validateStoredItem).map((item) => ({
        ...item,
        ownerId: cleanText(item.ownerId) || "unknown-user",
        photo: cleanText(item.photo),
        updatedAt: item.updatedAt || item.createdAt
      }))
    : [];

  return {
    version: STORAGE_SCHEMA_VERSION,
    profile: {
      id: cleanText(value.profile?.id) || LOCAL_OWNER_ID,
      displayName: cleanText(value.profile?.displayName) || "李同学",
      defaultContact: cleanText(value.profile?.defaultContact) || "微信 lixx_0921"
    },
    items,
    recentSearches: Array.isArray(value.recentSearches)
      ? value.recentSearches.map(cleanText).filter(Boolean).slice(0, 8)
      : []
  };
}

function filterAndSortItems(items, filters = {}) {
  const type = filters.type || "all";
  const category = filters.category || "all";
  const status = filters.status || "all";
  const location = cleanText(filters.location).toLocaleLowerCase();
  const query = cleanText(filters.query).toLocaleLowerCase();
  const factor = filters.sort === "asc" ? 1 : -1;

  return [...items]
    .filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (category !== "all" && item.category !== category) return false;
      if (status !== "all" && item.status !== status) return false;
      if (
        location &&
        !cleanText(item.location).toLocaleLowerCase().includes(location)
      ) {
        return false;
      }
      if (!query) return true;

      return [item.title, item.description, item.category, item.location]
        .map((value) => cleanText(value).toLocaleLowerCase())
        .some((value) => value.includes(query));
    })
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return (leftTime - rightTime) * factor;
    });
}

export function createLocalRepository(options = {}) {
  const storage = options.storage;
  const now = options.now || (() => Date.now());
  const createId = options.generateId || generateId;

  if (!storage) {
    throw new Error("LocalRepository 需要 storage");
  }

  let snapshot = null;

  function initialize() {
    const stored = storage.get(STORAGE_KEY, null);
    if (!stored) {
      snapshot = createInitialSnapshot();
      persist();
      return deepClone(snapshot);
    }

    try {
      snapshot = normalizeSnapshot(stored);
    } catch (error) {
      console.warn("本地数据结构损坏，已恢复示例数据", error);
      snapshot = createInitialSnapshot();
    }
    persist();
    return deepClone(snapshot);
  }

  function persist() {
    storage.set(STORAGE_KEY, deepClone(snapshot));
  }

  function ensureReady() {
    if (!snapshot) initialize();
  }

  function getOwnerId() {
    ensureReady();
    return snapshot.profile.id || LOCAL_OWNER_ID;
  }

  function findItem(id) {
    ensureReady();
    return snapshot.items.find((item) => item.id === id) || null;
  }

  function createItem(draft) {
    ensureReady();
    const checked = validateItemDraft(draft, now());
    if (!checked.valid) {
      const error = new Error("发布信息校验失败");
      error.code = "VALIDATION_ERROR";
      error.fields = checked.errors;
      throw error;
    }

    const timestamp = new Date(now()).toISOString();
    const visual = getItemVisual(checked.value);
    const item = {
      ...checked.value,
      id: createId("item"),
      status: "open",
      emoji: visual.emoji,
      tint: visual.tint,
      ownerId: getOwnerId(),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    snapshot.items.unshift(item);
    persist();
    return cloneItem(item);
  }

  function updateItem(id, patch) {
    ensureReady();
    const current = findItem(id);
    if (!current) throw new Error("信息不存在或已被删除");
    if (current.ownerId !== getOwnerId()) throw new Error("只能编辑自己发布的信息");

    const checked = validateItemDraft({ ...current, ...patch }, now());
    if (!checked.valid) {
      const error = new Error("修改信息校验失败");
      error.code = "VALIDATION_ERROR";
      error.fields = checked.errors;
      throw error;
    }

    const visual = getItemVisual(checked.value);
    Object.assign(current, checked.value, {
      emoji: visual.emoji,
      tint: visual.tint,
      updatedAt: new Date(now()).toISOString()
    });
    persist();
    return cloneItem(current);
  }

  function deleteItem(id) {
    ensureReady();
    const index = snapshot.items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("信息不存在或已被删除");
    if (snapshot.items[index].ownerId !== getOwnerId()) {
      throw new Error("只能删除自己发布的信息");
    }
    const [removed] = snapshot.items.splice(index, 1);
    persist();
    return cloneItem(removed);
  }

  function setItemStatus(id, status) {
    ensureReady();
    if (!["open", "resolved"].includes(status)) {
      throw new Error("无效的信息状态");
    }
    const item = findItem(id);
    if (!item) throw new Error("信息不存在或已被删除");
    if (item.ownerId !== getOwnerId()) throw new Error("只能修改自己发布的信息");
    item.status = status;
    item.updatedAt = new Date(now()).toISOString();
    persist();
    return cloneItem(item);
  }

  async function listItems(filters = {}) {
    ensureReady();
    return filterAndSortItems(snapshot.items, filters).map(cloneItem);
  }

  async function getItem(id) {
    ensureReady();
    const item = findItem(id);
    return item ? cloneItem(item) : null;
  }

  async function create(draft) {
    return createItem(draft);
  }

  async function update(id, patch) {
    return updateItem(id, patch);
  }

  async function remove(id) {
    return deleteItem(id);
  }

  async function changeStatus(id, status) {
    return setItemStatus(id, status);
  }

  function exportSnapshot() {
    ensureReady();
    return deepClone(snapshot);
  }

  function importSnapshot(value) {
    const normalized = normalizeSnapshot(value);
    if (!normalized.items.length && value?.items?.length) {
      throw new Error("导入文件中没有有效的信息数据");
    }
    snapshot = normalized;
    persist();
    return deepClone(snapshot);
  }

  function reset() {
    snapshot = createInitialSnapshot();
    persist();
    return deepClone(snapshot);
  }

  return {
    initialize,
    listItems,
    getItem,
    create,
    update,
    remove,
    changeStatus,
    exportSnapshot,
    importSnapshot,
    reset
  };
}
