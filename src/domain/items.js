import {
  CATEGORY_COLOR,
  CATEGORY_EMOJI,
  ITEM_STATUSES,
  ITEM_TYPES
} from "./constants.js";

export function getTypeText(itemOrType) {
  const type = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
  return type === ITEM_TYPES.LOST ? "寻物" : "招领";
}

export function getStatusText(item) {
  const resolved = item?.status === ITEM_STATUSES.RESOLVED;
  if (item?.type === ITEM_TYPES.LOST) {
    return resolved ? "已找回" : "寻找中";
  }
  return resolved ? "已归还" : "待认领";
}

export function getActionText(item) {
  return item?.type === ITEM_TYPES.LOST ? "标记已找回" : "标记已归还";
}

export function getUndoActionText(item) {
  return item?.type === ITEM_TYPES.LOST ? "撤销已找回" : "撤销已归还";
}

export function getItemVisual(item) {
  return {
    emoji: item?.emoji || CATEGORY_EMOJI[item?.category] || "📦",
    tint: item?.tint || CATEGORY_COLOR[item?.category] || CATEGORY_COLOR["其他"]
  };
}

export function cloneItem(item) {
  return {
    ...item
  };
}

export function formatRelativeTime(value, now = Date.now()) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "刚刚";

  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 3 * day) return `${Math.floor(diff / day)} 天前`;

  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${month}-${dayOfMonth}`;
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
