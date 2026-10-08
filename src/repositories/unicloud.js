import { CLOUD_FUNCTION_NAME } from "../domain/constants.js";
import { cloneItem } from "../domain/items.js";

function normalizeError(payload, fallback = "云端请求失败") {
  const error = new Error(payload?.error?.message || fallback);
  error.code = payload?.error?.code || "CLOUD_ERROR";
  error.retryable = Boolean(payload?.error?.retryable);
  return error;
}

export function createUniCloudRepository(options = {}) {
  const callFunction = options.callFunction;
  const clientId = options.clientId;

  if (typeof callFunction !== "function") {
    throw new Error("UniCloudRepository 需要 callFunction");
  }
  if (!clientId) {
    throw new Error("UniCloudRepository 需要 clientId");
  }

  async function request(action, data = {}) {
    const response = await callFunction({
      name: CLOUD_FUNCTION_NAME,
      data: {
        action,
        clientId,
        ...data
      }
    });
    const payload = response?.result ?? response;
    if (!payload?.ok) throw normalizeError(payload);
    return payload.data;
  }

  return {
    async initialize() {
      return request("system/ping");
    },
    async listItems(filters = {}) {
      const data = await request("item/list", { filters });
      return (data?.items || []).map(cloneItem);
    },
    async getItem(id) {
      const data = await request("item/get", { id });
      return data?.item ? cloneItem(data.item) : null;
    },
    async create(draft) {
      const data = await request("item/create", { draft });
      return cloneItem(data.item);
    },
    async update(id, patch) {
      const data = await request("item/update", { id, patch });
      return cloneItem(data.item);
    },
    async remove(id) {
      const data = await request("item/delete", { id });
      return cloneItem(data.item);
    },
    async changeStatus(id, status) {
      const data = await request("item/status", { id, status });
      return cloneItem(data.item);
    },
    async exportSnapshot() {
      const data = await request("data/export");
      return data?.snapshot || { version: 1, items: [] };
    },
    async importSnapshot(snapshot) {
      const data = await request("data/import", { snapshot });
      return data?.snapshot || snapshot;
    },
    async reset() {
      const data = await request("data/reset");
      return data?.snapshot || { version: 1, items: [] };
    }
  };
}
