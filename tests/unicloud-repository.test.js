import { describe, expect, it, vi } from "vitest";
import { createUniCloudRepository } from "../src/repositories/unicloud.js";

describe("UniCloudItemRepository", () => {
  it("把 Repository 接口转换为统一的云函数 action", async () => {
    const calls = [];
    const repository = createUniCloudRepository({
      clientId: "client-test",
      callFunction: vi.fn(async (options) => {
        calls.push(options);
        if (options.data.action === "item/list") {
          return {
            result: {
              ok: true,
              data: { items: [{ id: "cloud-1", title: "校园卡" }] }
            }
          };
        }
        return {
          result: {
            ok: true,
            data: { item: { id: "cloud-1", title: "校园卡" } }
          }
        };
      })
    });

    const items = await repository.listItems({ query: "校园卡" });
    const item = await repository.create({ title: "校园卡" });

    expect(items).toHaveLength(1);
    expect(item.id).toBe("cloud-1");
    expect(calls[0].name).toBe("campus-lostfound-api");
    expect(calls[0].data).toMatchObject({
      action: "item/list",
      clientId: "client-test"
    });
    expect(calls[1].data.action).toBe("item/create");
  });

  it("把云端错误封装为可读异常", async () => {
    const repository = createUniCloudRepository({
      clientId: "client-test",
      callFunction: async () => ({
        result: {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "无权操作该信息",
            retryable: false
          }
        }
      })
    });

    await expect(repository.remove("x")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "无权操作该信息",
      retryable: false
    });
  });
});
