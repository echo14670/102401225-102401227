import { describe, expect, it } from "vitest";
import { filterItems, matchesQuery, sortItems } from "../src/domain/search.js";

function item(overrides = {}) {
  return {
    id: "1",
    type: "lost",
    status: "open",
    title: "校园卡",
    category: "证件卡片",
    location: "紫金楼 A 座",
    description: "蓝色卡面，尾号 0821。",
    createdAt: "2026-10-08T10:00:00+08:00",
    ...overrides
  };
}

describe("search domain", () => {
  it("按名称、描述、分类和地点搜索", () => {
    expect(matchesQuery(item(), "校园卡")).toBe(true);
    expect(matchesQuery(item(), "0821")).toBe(true);
    expect(matchesQuery(item(), "证件")).toBe(true);
    expect(matchesQuery(item(), "紫金楼")).toBe(true);
    expect(matchesQuery(item(), "耳机")).toBe(false);
  });

  it("同时按类型、分类、状态和地点筛选", () => {
    const items = [
      item({ id: "1", type: "lost", category: "证件卡片", location: "紫金楼 A 座" }),
      item({ id: "2", type: "found", category: "电子产品", location: "图书馆", status: "resolved" }),
      item({ id: "3", type: "found", category: "电子产品", location: "一区食堂" })
    ];

    const result = filterItems(items, {
      type: "found",
      category: "电子产品",
      status: "open",
      location: "食堂"
    });

    expect(result.map((entry) => entry.id)).toEqual(["3"]);
  });

  it("忽略关键词大小写和多余空格", () => {
    expect(matchesQuery(item({
      title: "Blue Campus Card",
      description: "Student card with number 0821."
    }), "  blue   campus card  ")).toBe(true);
  });

  it("没有匹配结果时返回空数组", () => {
    const result = filterItems([
      item({ id: "1", title: "校园卡" }),
      item({ id: "2", title: "雨伞" })
    ], {
      query: "不存在的物品"
    });

    expect(result).toEqual([]);
  });

  it("按创建时间升序或降序排序且不修改原数组", () => {
    const items = [
      item({ id: "older", createdAt: "2026-10-01T00:00:00+08:00" }),
      item({ id: "newer", createdAt: "2026-10-08T00:00:00+08:00" })
    ];

    expect(sortItems(items, "desc").map((entry) => entry.id)).toEqual(["newer", "older"]);
    expect(sortItems(items, "asc").map((entry) => entry.id)).toEqual(["older", "newer"]);
    expect(items.map((entry) => entry.id)).toEqual(["older", "newer"]);
  });
});
