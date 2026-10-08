import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "../src/services/storage.js";
import { createLocalRepository } from "../src/repositories/local.js";

function createRepository() {
  let id = 0;
  return createLocalRepository({
    storage: createMemoryStorage(),
    now: () => new Date("2026-10-08T12:00:00+08:00").getTime(),
    generateId: () => `test-${++id}`
  });
}

function validDraft(overrides = {}) {
  return {
    type: "lost",
    title: "测试校园卡",
    category: "证件卡片",
    eventTime: "2026-10-08T10:00:00+08:00",
    location: "紫金楼 A 座",
    description: "测试描述内容足够长。",
    contact: "微信 test_contact",
    photo: "",
    ...overrides
  };
}

describe("LocalItemRepository", () => {
  it("首次初始化加载与原型一致的示例数据", async () => {
    const repository = createRepository();
    const snapshot = await repository.initialize();

    expect(snapshot.items.length).toBe(8);
    expect(snapshot.profile.id).toBe("local-user");
    expect((await repository.listItems({ type: "found" })).length).toBeGreaterThan(0);
  });

  it("创建信息后可以立即从列表和详情读取", async () => {
    const repository = createRepository();
    await repository.initialize();
    const created = await repository.create(validDraft());

    expect(created.id).toBe("test-1");
    expect(created.ownerId).toBe("local-user");
    expect(await repository.getItem(created.id)).toMatchObject({
      title: "测试校园卡",
      status: "open"
    });
    expect((await repository.listItems({ query: "测试校园卡" }))).toHaveLength(1);
  });

  it("创建招领信息后可以完成归还状态流转", async () => {
    const repository = createRepository();
    await repository.initialize();
    const created = await repository.create(validDraft({
      type: "found",
      title: "测试黑色雨伞",
      category: "生活用品",
      location: "图书馆一楼",
      description: "黑色折叠伞，伞柄有白色标记。"
    }));

    expect(created).toMatchObject({
      type: "found",
      status: "open"
    });

    const resolved = await repository.changeStatus(created.id, "resolved");
    expect(resolved.status).toBe("resolved");
  });

  it("只能编辑、删除和修改自己发布的信息", async () => {
    const repository = createRepository();
    await repository.initialize();

    await expect(repository.update("seed-1", { title: "越权修改" }))
      .rejects.toThrow("只能编辑自己发布的信息");
    await expect(repository.remove("seed-1"))
      .rejects.toThrow("只能删除自己发布的信息");
    await expect(repository.changeStatus("seed-1", "resolved"))
      .rejects.toThrow("只能修改自己发布的信息");
  });

  it("支持编辑、状态切换和删除自己的信息", async () => {
    const repository = createRepository();
    await repository.initialize();
    const created = await repository.create(validDraft());

    const updated = await repository.update(created.id, {
      title: "更新后的校园卡",
      description: "更新后的描述内容。"
    });
    expect(updated.title).toBe("更新后的校园卡");

    const resolved = await repository.changeStatus(created.id, "resolved");
    expect(resolved.status).toBe("resolved");

    await repository.remove(created.id);
    expect(await repository.getItem(created.id)).toBeNull();
  });

  it("导出、导入和恢复示例数据", async () => {
    const repository = createRepository();
    await repository.initialize();
    await repository.create(validDraft());
    const exported = repository.exportSnapshot();

    await repository.reset();
    expect(exported.items).toHaveLength(9);
    expect((await repository.listItems({ query: "测试校园卡" }))).toHaveLength(0);

    await repository.importSnapshot(exported);
    expect((await repository.listItems({ query: "测试校园卡" }))).toHaveLength(1);
  });

  it("遇到损坏数据时恢复示例数据而不是崩溃", async () => {
    const storage = createMemoryStorage({
      "campus-lost-found:v1": "not-an-object"
    });
    const repository = createLocalRepository({ storage });
    const snapshot = await repository.initialize();

    expect(snapshot.items).toHaveLength(8);
  });
});
