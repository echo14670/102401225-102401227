# 王圣杰 Codex 交接包

本目录用于在林子涵负责的基础版本上，通过 fork 和 Pull Request 添加搜索与筛选模块。

## 包内容

```text
handoff/wang-codex/
├─ README.md
├─ WANG_CODEX_HANDOFF.md
├─ apply-wang-part.ps1
├─ source/
│  ├─ pages.json
│  ├─ README.md
│  ├─ pages/
│  ├─ src/
│  ├─ tests/
│  └─ docs/
└─ patch/
   └─ wang-search-filter.patch
```

`source/` 是按仓库根目录结构排列的最终文件。`patch/` 保存从林子涵基础版本到搜索模块完成版本的统一差异。

## 最短流程

1. 在 GitHub 上 fork 林子涵的 `102401225-102401227` 仓库。
2. 克隆自己的 fork，并添加上游仓库。
3. 创建 `feature/search-and-filter` 分支。
4. 优先运行 `git apply --3way handoff/wang-codex/patch/wang-search-filter.patch`。
5. 应用失败时，运行 `handoff/wang-codex/apply-wang-part.ps1` 复制 `source/` 中的文件。
6. 运行 `npm install` 和 `npm test -- --reporter=verbose`。
7. 按源码不同模块拆成至少 5 个 commit。
8. 推送分支并创建 Pull Request。

完整命令、验收条件和 PR 模板见 `WANG_CODEX_HANDOFF.md`。
