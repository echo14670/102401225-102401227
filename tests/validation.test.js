import { describe, expect, it } from "vitest";
import { validateItemDraft, validateStoredItem } from "../src/domain/validation.js";

const NOW = new Date("2026-10-08T12:00:00+08:00").getTime();

function validDraft(overrides = {}) {
  return {
    type: "lost",
    title: "校园卡",
    category: "证件卡片",
    eventTime: "2026-10-08T10:00:00+08:00",
    location: "紫金楼 A 座 305",
    description: "蓝色校园卡，卡号尾号为 0821。",
    contact: "微信 lixx_0921",
    photo: "",
    ...overrides
  };
}

describe("validateItemDraft", () => {
  it("接受完整的寻物或招领草稿并清理多余空格", () => {
    const result = validateItemDraft(validDraft({
      title: "  校园卡  ",
      location: "  紫金楼 A 座 305  "
    }), NOW);

    expect(result.valid).toBe(true);
    expect(result.value.title).toBe("校园卡");
    expect(result.value.location).toBe("紫金楼 A 座 305");
    expect(result.value.photo).toBe("");
  });

  it("拒绝无效类型和过短标题", () => {
    const result = validateItemDraft(validDraft({ type: "unknown", title: "卡" }), NOW);

    expect(result.valid).toBe(false);
    expect(result.errors.type).toBeTruthy();
    expect(result.errors.title).toBeTruthy();
  });

  it("拒绝晚于当前时间五分钟以上的发生时间", () => {
    const result = validateItemDraft(validDraft({
      eventTime: "2026-10-08T12:20:00+08:00"
    }), NOW);

    expect(result.valid).toBe(false);
    expect(result.errors.eventTime).toContain("不能晚于");
  });

  it("拒绝过短描述和包含控制字符的联系方式", () => {
    const result = validateItemDraft(validDraft({
      description: "短",
      contact: "微信\u0001123456"
    }), NOW);

    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeTruthy();
    expect(result.errors.contact).toBeTruthy();
  });

  it("拒绝无效的持久化对象", () => {
    expect(validateStoredItem(null)).toBe(false);
    expect(validateStoredItem({
      id: "x",
      type: "lost",
      status: "open",
      title: "校园卡",
      category: "证件卡片",
      location: "图书馆",
      createdAt: "not-a-date"
    })).toBe(false);
  });
});
