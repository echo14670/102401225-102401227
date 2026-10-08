"use strict";

const crypto = require("crypto");

const db = uniCloud.database();
const command = db.command;
const COLLECTION = "lost_found_items";
const VALID_TYPES = ["lost", "found"];
const VALID_STATUSES = ["open", "resolved"];
const CATEGORIES = ["证件卡片", "生活用品", "电子产品", "钥匙", "书籍资料", "其他"];

exports.main = async (event) => {
  try {
    const request = normalizeRequest(event);
    const data = await route(request);
    return response({ ok: true, data });
  } catch (error) {
    return response({
      ok: false,
      data: null,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "服务器内部错误",
        retryable: Boolean(error.retryable)
      }
    });
  }
};

async function route(request) {
  const clientId = clean(request.clientId);
  if (!clientId) throw apiError("UNAUTHORIZED", "缺少客户端标识");

  switch (request.action) {
    case "system/ping":
      return { ok: true };
    case "item/list":
      return listItems(request.data.filters || {});
    case "item/get":
      return getItem(request.data.id);
    case "item/create":
      return createItem(clientId, request.data.draft);
    case "item/update":
      return updateItem(clientId, request.data.id, request.data.patch);
    case "item/delete":
      return deleteItem(clientId, request.data.id);
    case "item/status":
      return updateStatus(clientId, request.data.id, request.data.status);
    case "data/export":
      return exportData(clientId);
    case "data/import":
      return importData(clientId, request.data.snapshot);
    case "data/reset":
      return resetData(clientId);
    default:
      throw apiError("NOT_FOUND", `未知接口：${request.action}`);
  }
}

async function listItems(filters) {
  const where = {};
  if (VALID_TYPES.includes(filters.type)) where.type = filters.type;
  if (VALID_STATUSES.includes(filters.status)) where.status = filters.status;
  if (CATEGORIES.includes(filters.category)) where.category = filters.category;

  const result = await db.collection(COLLECTION)
    .where(where)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const query = clean(filters.query).toLocaleLowerCase();
  const location = clean(filters.location).toLocaleLowerCase();
  const items = (result.data || []).filter((item) => {
    if (location && !clean(item.location).toLocaleLowerCase().includes(location)) {
      return false;
    }
    if (!query) return true;
    return [item.title, item.description, item.category, item.location]
      .some((value) => clean(value).toLocaleLowerCase().includes(query));
  });

  return { items: items.map(publicItem) };
}

async function getItem(id) {
  const item = await findById(id);
  return { item: item ? publicItem(item) : null };
}

async function createItem(clientId, draft) {
  const value = validateDraft(draft);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const item = {
    ...value,
    id,
    status: "open",
    ownerId: clientId,
    createdAt: now,
    updatedAt: now
  };
  await db.collection(COLLECTION).doc(id).set(item);
  return { item: publicItem(item) };
}

async function updateItem(clientId, id, patch) {
  const current = await requireOwnedItem(clientId, id);
  const value = validateDraft({
    ...current,
    ...patch,
    type: patch?.type || current.type
  });
  const updated = {
    ...value,
    id: current.id,
    status: current.status,
    ownerId: clientId,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString()
  };
  await db.collection(COLLECTION).doc(id).set(updated);
  return { item: publicItem(updated) };
}

async function deleteItem(clientId, id) {
  const item = await requireOwnedItem(clientId, id);
  await db.collection(COLLECTION).doc(id).remove();
  return { item: publicItem(item) };
}

async function updateStatus(clientId, id, status) {
  if (!VALID_STATUSES.includes(status)) throw apiError("INVALID_STATUS", "无效的信息状态");
  const item = await requireOwnedItem(clientId, id);
  const updated = {
    ...item,
    status,
    updatedAt: new Date().toISOString()
  };
  await db.collection(COLLECTION).doc(id).set(updated);
  return { item: publicItem(updated) };
}

async function exportData(clientId) {
  const result = await db.collection(COLLECTION)
    .where({ ownerId: clientId })
    .limit(500)
    .get();
  return {
    snapshot: {
      version: 1,
      profile: { id: clientId },
      items: (result.data || []).map(publicItem),
      recentSearches: []
    }
  };
}

async function importData(clientId, snapshot) {
  const items = Array.isArray(snapshot?.items) ? snapshot.items.slice(0, 200) : [];
  for (const item of items) {
    const value = validateDraft(item);
    const id = clean(item.id) || crypto.randomUUID();
    await db.collection(COLLECTION).doc(id).set({
      ...value,
      id,
      status: VALID_STATUSES.includes(item.status) ? item.status : "open",
      ownerId: clientId,
      createdAt: validDate(item.createdAt) || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return exportData(clientId);
}

async function resetData(clientId) {
  await db.collection(COLLECTION).where({ ownerId: clientId }).remove();
  return {
    snapshot: {
      version: 1,
      profile: { id: clientId },
      items: [],
      recentSearches: []
    }
  };
}

async function findById(id) {
  const cleanId = clean(id);
  if (!cleanId) throw apiError("INVALID_ID", "缺少信息 ID");
  try {
    const result = await db.collection(COLLECTION).doc(cleanId).get();
    return result.data && result.data[0] ? result.data[0] : null;
  } catch (error) {
    return null;
  }
}

async function requireOwnedItem(clientId, id) {
  const item = await findById(id);
  if (!item) throw apiError("NOT_FOUND_ITEM", "信息不存在或已被删除");
  if (item.ownerId !== clientId) throw apiError("FORBIDDEN", "无权操作该信息");
  return item;
}

function validateDraft(draft) {
  const value = {
    type: clean(draft?.type),
    title: clean(draft?.title),
    category: clean(draft?.category),
    eventTime: validDate(draft?.eventTime),
    location: clean(draft?.location),
    description: clean(draft?.description),
    contact: clean(draft?.contact),
    photo: typeof draft?.photo === "string" ? draft.photo.slice(0, 500) : ""
  };

  if (!VALID_TYPES.includes(value.type)) throw apiError("VALIDATION_ERROR", "无效的信息类型");
  if (value.title.length < 2 || value.title.length > 30) {
    throw apiError("VALIDATION_ERROR", "物品名称需要 2-30 个字");
  }
  if (!CATEGORIES.includes(value.category)) throw apiError("VALIDATION_ERROR", "无效的物品分类");
  if (!value.eventTime) throw apiError("VALIDATION_ERROR", "无效的发生时间");
  if (value.location.length < 2 || value.location.length > 50) {
    throw apiError("VALIDATION_ERROR", "发生地点需要 2-50 个字");
  }
  if (value.description.length < 5 || value.description.length > 200) {
    throw apiError("VALIDATION_ERROR", "详细描述需要 5-200 个字");
  }
  if (value.contact.length < 5 || value.contact.length > 50) {
    throw apiError("VALIDATION_ERROR", "联系方式需要 5-50 个有效字符");
  }
  return value;
}

function publicItem(item) {
  return {
    ...item,
    emoji: item.emoji || "",
    tint: item.tint || ""
  };
}

function normalizeRequest(event) {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
  return {
    action: event.action || body.action,
    clientId: event.clientId || body.clientId,
    data: {
      ...(event.data || {}),
      ...body
    }
  };
}

function response(payload) {
  return {
    ...payload,
    requestId: crypto.randomUUID()
  };
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function validDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function apiError(code, message, retryable = false) {
  const error = new Error(message);
  error.code = code;
  error.retryable = retryable;
  return error;
}
