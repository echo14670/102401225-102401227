import { describe, expect, it } from "vitest";
import {
  formatRelativeTime,
  getActionText,
  getItemVisual,
  getStatusText,
  getTypeText,
  getUndoActionText
} from "../src/domain/items.js";

describe("item presentation", () => {
  it("严格区分寻物和招领的状态文案", () => {
    expect(getStatusText({ type: "lost", status: "open" })).toBe("寻找中");
    expect(getStatusText({ type: "lost", status: "resolved" })).toBe("已找回");
    expect(getStatusText({ type: "found", status: "open" })).toBe("待认领");
    expect(getStatusText({ type: "found", status: "resolved" })).toBe("已归还");
  });

  it("根据类型返回正确的操作文案", () => {
    expect(getActionText({ type: "lost" })).toBe("标记已找回");
    expect(getUndoActionText({ type: "lost" })).toBe("撤销已找回");
    expect(getActionText({ type: "found" })).toBe("标记已归还");
    expect(getUndoActionText({ type: "found" })).toBe("撤销已归还");
  });

  it("返回类型和分类视觉信息", () => {
    expect(getTypeText({ type: "lost" })).toBe("寻物");
    expect(getTypeText({ type: "found" })).toBe("招领");
    expect(getItemVisual({ category: "电子产品" }).emoji).toBe("🎧");
    expect(getItemVisual({ category: "其他" }).tint).toBeTruthy();
  });

  it("格式化相对时间", () => {
    const now = new Date("2026-10-08T12:00:00+08:00").getTime();
    expect(formatRelativeTime("2026-10-08T11:59:30+08:00", now)).toBe("刚刚");
    expect(formatRelativeTime("2026-10-08T10:00:00+08:00", now)).toBe("2 小时前");
  });
});
