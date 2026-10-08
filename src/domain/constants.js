export const ITEM_TYPES = Object.freeze({
  LOST: "lost",
  FOUND: "found"
});

export const ITEM_STATUSES = Object.freeze({
  OPEN: "open",
  RESOLVED: "resolved"
});

export const CATEGORIES = Object.freeze([
  "证件卡片",
  "生活用品",
  "电子产品",
  "钥匙",
  "书籍资料",
  "其他"
]);

export const CATEGORY_EMOJI = Object.freeze({
  "证件卡片": "🎫",
  "生活用品": "☕",
  "电子产品": "🎧",
  "钥匙": "🔑",
  "书籍资料": "📕",
  "其他": "📦"
});

export const CATEGORY_COLOR = Object.freeze({
  "证件卡片": "#eaf1ff",
  "生活用品": "#e7f7f1",
  "电子产品": "#fff2e8",
  "钥匙": "#fff8e6",
  "书籍资料": "#f2eefe",
  "其他": "#eef1f6"
});

export const DATA_SOURCES = Object.freeze({
  LOCAL: "local",
  UNICLOUD: "unicloud"
});

export const STORAGE_SCHEMA_VERSION = 1;
export const STORAGE_KEY = "campus-lost-found:v1";
export const LOCAL_OWNER_ID = "local-user";
export const CLOUD_FUNCTION_NAME = "campus-lostfound-api";
