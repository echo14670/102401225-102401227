# 校园失物招领 APP

本项目是 2026 秋软件工程第二次结对作业的程序实现，严格基于第三次作业（第一次结对作业）中的原型设计。产品范围保持为 F1-F7，不实现登录、实名认证、即时聊天、地图定位和后台审核。

## 原型落地对应关系

| 原型功能 | uni-app 实现 |
| --- | --- |
| F1 浏览失物/招领 | `pages/home/index.vue` |
| F2/F3 发布寻物/招领 | `pages/publish/index.vue`、`pages/success/index.vue` |
| F4 搜索物品 | `pages/search/index.vue` |
| F5 查看详情与联系方式 | `pages/detail/index.vue` |
| F6 修改“已找回/已归还”状态 | `pages/detail/index.vue`、`pages/mine/index.vue` |
| F7 我的发布 | `pages/mine/index.vue` |

原型中的 6 个页面、三段基本流程、隐藏式联系方式和信息状态规则均已实现。附加了分类/地点筛选、一键复制联系方式、编辑、删除、示例数据恢复和 JSON 导入导出。

## 目录结构

```text
campus-lost-found-app/
├─ pages/                    uni-app 页面
├─ components/               卡片、空状态、底部导航
├─ src/
│  ├─ domain/                数据模型、校验、搜索、状态文案
│  ├─ repositories/          本地和 uniCloud Repository
│  ├─ services/              存储适配、ID 生成
│  ├─ store/                 全局响应式状态
│  └─ config/                运行配置
├─ tests/                    Vitest 单元测试
├─ uniCloud-aliyun/          阿里云云函数和数据库 schema
├─ android-local/            DCloud Android 本地打包工程
├─ scripts/                  HBuilderX 资源同步和 APK 构建脚本
├─ docs/                     PSP、测试报告、博客草稿
└─ release/                  Release APK 与 SHA-256
```

## HBuilderX 运行

1. 使用 HBuilderX 打开本目录。
2. 运行到 Android App 基座，或运行到浏览器预览 H5。
3. 首次启动会写入 8 条与原型一致的示例信息。

## 单元测试

```powershell
npm install
npm test
```

当前包含 23 个自动化测试，覆盖校验、搜索、筛选、状态文案、寻物/招领发布、增删改、权限、持久化、损坏数据恢复和云适配器请求转换。

## Release APK 下载

APK 已发布在 GitHub Release 板块，可直接下载安装：

- [Release v1.0.0](https://github.com/echo14670/102401225-102401227/releases/tag/v1.0.0)
- [直接下载 APK](https://github.com/echo14670/102401225-102401227/releases/download/v1.0.0/campus-lost-found-1.0.0-release.apk)

当前 Release APK 的 SHA-256 为：

`38b40259accd06a326cb1afc31ea478d520d4f49cf95cbf6f345fe80740e9585`

## 数据层

默认数据保存在本机 `uni storage`，关闭 APP 后仍然保留。`src/repositories` 中同时实现了：

- `LocalItemRepository`
- `UniCloudItemRepository`

部署 `uniCloud-aliyun/cloudfunctions/campus-lostfound-api` 并初始化数据库后，可以切换为阿里云数据源。详细步骤见 `uniCloud-aliyun/README.md`。

## 本地数据工具

“我的发布”页面底部提供：

- 将当前数据导出到剪贴板
- 从剪贴板导入 JSON
- 恢复初始示例数据

## 测试数据思路

测试同时覆盖正常数据、边界长度、未来时间、控制字符、无效分类、错误云响应、损坏本地数据和不同发布者权限，避免只验证一条成功路径。

## 分工记录

林子涵负责 uni-app 工程初始化、领域模型、Repository、Store、核心页面、Android 本地打包、基础测试和文档。王圣杰负责搜索领域模块、搜索页面、首页筛选、搜索测试和文档，并通过 fork 和 PR 合并。完整提交记录见 `docs/BLOG_DRAFT.md`。
