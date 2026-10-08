import { ITEM_STATUSES, ITEM_TYPES, LOCAL_OWNER_ID } from "./constants.js";

function seedItem(id, type, title, category, location, eventTime, description, contact, ownerId, status = ITEM_STATUSES.OPEN) {
  return {
    id,
    type,
    status,
    title,
    category,
    eventTime,
    location,
    description,
    contact,
    photo: "",
    ownerId,
    createdAt: eventTime,
    updatedAt: eventTime
  };
}

export function createSeedItems() {
  return [
    seedItem(
      "seed-1",
      ITEM_TYPES.LOST,
      "校园卡（张同学）",
      "证件卡片",
      "紫金楼 A 座 305 教室",
      "2026-09-26T14:30:00+08:00",
      "蓝色卡面，卡号尾号 0821，姓名张*明，计算机与大数据学院。可能遗落在课桌抽屉或走廊。",
      "微信 zhangming_fzu",
      "seed-user-1"
    ),
    seedItem(
      "seed-2",
      ITEM_TYPES.FOUND,
      "黑色雨伞",
      "生活用品",
      "图书馆一楼大厅",
      "2026-09-26T12:10:00+08:00",
      "全自动黑色折叠伞，伞柄缠有米白色胶带，伞面内侧有小破洞，已交给服务台保管。",
      "微信 umb_0512",
      "seed-user-2"
    ),
    seedItem(
      "seed-3",
      ITEM_TYPES.LOST,
      "白色 AirPods 耳机（左耳）",
      "电子产品",
      "一区食堂二楼",
      "2026-09-26T11:40:00+08:00",
      "白色 AirPods 3 代，只丢左耳，耳机外侧有一张猫爪贴纸。",
      "手机号 138****6621",
      "seed-user-3"
    ),
    seedItem(
      "seed-4",
      ITEM_TYPES.FOUND,
      "学生证（李同学）",
      "证件卡片",
      "田径场看台",
      "2026-09-25T18:20:00+08:00",
      "紫红色学生证，姓名李*，经济与管理学院，证件完整无破损。",
      "QQ 2234****76",
      "seed-user-4"
    ),
    seedItem(
      "seed-5",
      ITEM_TYPES.LOST,
      "一串钥匙（带小黄鸭挂件）",
      "钥匙",
      "学生宿舍 6 号楼水房",
      "2026-09-25T21:05:00+08:00",
      "三把钥匙串在一起，挂件是小黄鸭，其中一把是宿舍门钥匙。",
      "微信 lixx_0921",
      LOCAL_OWNER_ID
    ),
    seedItem(
      "seed-6",
      ITEM_TYPES.FOUND,
      "蓝色保温杯（杯身有贴纸）",
      "生活用品",
      "三区教学楼 B204",
      "2026-09-25T09:30:00+08:00",
      "500ml 蓝色保温杯，杯身有卡通贴纸，杯盖上有一个小挂环。",
      "微信 cup_0925",
      LOCAL_OWNER_ID,
      ITEM_STATUSES.RESOLVED
    ),
    seedItem(
      "seed-7",
      ITEM_TYPES.LOST,
      "《高等数学》上册教材",
      "书籍资料",
      "图书馆四楼自习区",
      "2026-09-24T16:00:00+08:00",
      "同济版教材，书里夹着几张写满笔记的便签，最后一页写了姓名和学号。",
      "微信 lixx_0921",
      LOCAL_OWNER_ID
    ),
    seedItem(
      "seed-8",
      ITEM_TYPES.FOUND,
      "校园卡（尾号 0821）",
      "证件卡片",
      "紫金楼 A 座一楼门口",
      "2026-09-24T08:15:00+08:00",
      "捡到一张校园卡，为保护隐私仅公开尾号 0821，请失主说明完整信息以便核对。",
      "微信 umb_0512",
      "seed-user-8"
    )
  ];
}
