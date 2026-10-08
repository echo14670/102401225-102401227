export function createUniStorageAdapter(uniApi = globalThis.uni) {
  if (!uniApi?.getStorageSync) {
    throw new Error("当前运行环境不支持 uni storage");
  }

  return {
    get(key, fallback = null) {
      try {
        const value = uniApi.getStorageSync(key);
        return value === "" || value === undefined ? fallback : value;
      } catch (error) {
        console.warn("读取本地存储失败", error);
        return fallback;
      }
    },
    set(key, value) {
      try {
        uniApi.setStorageSync(key, value);
      } catch (error) {
        console.warn("写入本地存储失败", error);
        throw new Error("本地存储空间不足，请清理部分照片后重试");
      }
    },
    remove(key) {
      try {
        uniApi.removeStorageSync(key);
      } catch (error) {
        console.warn("删除本地存储失败", error);
      }
    }
  };
}

export function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get(key, fallback = null) {
      return values.has(key) ? values.get(key) : fallback;
    },
    set(key, value) {
      values.set(key, value);
    },
    remove(key) {
      values.delete(key);
    },
    dump() {
      return Object.fromEntries(values.entries());
    }
  };
}
