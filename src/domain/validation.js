import { CATEGORIES, ITEM_STATUSES, ITEM_TYPES } from "./constants.js";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function validateItemDraft(draft, now = Date.now()) {
  const value = {
    type: draft?.type,
    title: cleanText(draft?.title),
    category: cleanText(draft?.category),
    eventTime: draft?.eventTime,
    location: cleanText(draft?.location),
    description: cleanText(draft?.description),
    contact: cleanText(draft?.contact),
    photo: typeof draft?.photo === "string" ? draft.photo : ""
  };
  const errors = {};

  if (![ITEM_TYPES.LOST, ITEM_TYPES.FOUND].includes(value.type)) {
    errors.type = "请选择寻物或招领类型";
  }

  if (value.title.length < 2 || value.title.length > 30) {
    errors.title = "物品名称需要 2-30 个字";
  }

  if (!CATEGORIES.includes(value.category)) {
    errors.category = "请选择有效的物品分类";
  }

  const eventTimestamp = new Date(value.eventTime).getTime();
  if (!Number.isFinite(eventTimestamp)) {
    errors.eventTime = "请选择发生时间";
  } else if (eventTimestamp > now + 5 * 60 * 1000) {
    errors.eventTime = "发生时间不能晚于当前时间";
  }

  if (value.location.length < 2 || value.location.length > 50) {
    errors.location = "发生地点需要 2-50 个字";
  }

  if (value.description.length < 5 || value.description.length > 200) {
    errors.description = "详细描述需要 5-200 个字";
  }

  if (
    value.contact.length < 5 ||
    value.contact.length > 50 ||
    CONTROL_CHARACTER_PATTERN.test(value.contact)
  ) {
    errors.contact = "联系方式需要 5-50 个有效字符";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value
  };
}

export function validateStoredItem(item) {
  if (!item || typeof item !== "object") return false;
  if (![ITEM_TYPES.LOST, ITEM_TYPES.FOUND].includes(item.type)) return false;
  if (![ITEM_STATUSES.OPEN, ITEM_STATUSES.RESOLVED].includes(item.status)) return false;
  if (!cleanText(item.id) || !cleanText(item.title) || !cleanText(item.location)) return false;
  if (!CATEGORIES.includes(item.category)) return false;
  if (!Number.isFinite(new Date(item.createdAt).getTime())) return false;
  return true;
}
