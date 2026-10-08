# 王圣杰搜索结果模块交接说明

## 一、任务目标

在林子涵负责的基础版本上完成搜索与筛选模块，并通过 fork 和 Pull Request 合入主仓库。

完成后的能力：

- 按物品名称、描述、分类和地点进行关键词匹配。
- 支持类型、分类、地点、状态和排序条件组合筛选。
- 首页提供搜索入口、分类筛选和地点筛选。
- 搜索页实时展示结果，无结果时引导发布寻物信息。
- 新增搜索模块单元测试。

## 二、仓库准备

将下面的 `<WANG_ACCOUNT>` 和 `<LIN_ACCOUNT>` 替换为真实 GitHub 用户名。

```powershell
git clone https://github.com/<WANG_ACCOUNT>/102401225-102401227.git
Set-Location 102401225-102401227
git remote add upstream https://github.com/<LIN_ACCOUNT>/102401225-102401227.git
git fetch upstream
git switch -c feature/search-and-filter
```

不要把 GitHub 密码、Token、SSH 私钥或签名证书写入仓库。

## 三、应用源码

优先应用交接包中的补丁：

```powershell
git apply --3way .\handoff\wang-codex\patch\wang-search-filter.patch
```

如果补丁因基础版本差异无法应用，使用文件复制脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\handoff\wang-codex\apply-wang-part.ps1
```

脚本会把 `handoff/wang-codex/source/` 下对应文件复制到仓库根目录，并保留原有目录结构。

应用后重点检查：

- `src/domain/search.js` 提供 `matchesQuery`、`sortItems` 和 `filterItems`。
- `pages/search/index.vue` 使用 `filterItems` 实时计算结果。
- `pages/home/index.vue` 使用同一套 `filterItems`，不复制匹配逻辑。
- `pages.json` 已恢复 `pages/search/index` 路由。
- `src/repositories/local.js` 使用统一的搜索模块。

## 四、测试与手工验收

安装依赖并运行全部测试：

```powershell
npm install
npm test -- --reporter=verbose
```

验收要求：

- 测试文件为 5 个。
- 测试用例为 23 个，且全部通过。
- 搜索名称、描述、分类和地点均能命中。
- 关键词前后的空格和大小写不影响结果。
- 组合筛选只返回同时满足条件的条目。
- 无匹配结果时出现“没有找到相关物品”和发布寻物入口。

## 五、建议提交拆分

每次提交前确认 `git diff --check` 无错误，并只暂存本条提交对应的文件。

```powershell
git add src/domain/search.js
git commit -m "feat(search): add keyword matching and sorting helpers"

git add pages/search/index.vue pages.json
git commit -m "feat(search): add live result page and route"

git add pages/home/index.vue src/repositories/local.js
git commit -m "feat(search): add home filters and repository integration"

git add tests/search.test.js
git commit -m "test(search): cover matching filters sorting and empty results"

git add README.md docs/DATA_FLOW.md docs/TEST_REPORT.md docs/BLOG_DRAFT.md docs/PSP.md
git commit -m "docs(search): document filters tests and collaboration flow"
```

不要使用 `--author`、`--amend` 或改写历史；提交作者应为当前王圣杰 GitHub 账号对应的真实本地 Git 身份。

## 六、推送和创建 PR

推送自己的分支：

```powershell
git push -u origin feature/search-and-filter
```

在 GitHub 页面创建 Pull Request：

- Base repository：`<LIN_ACCOUNT>/102401225-102401227`
- Base branch：`main`
- Head repository：`<WANG_ACCOUNT>/102401225-102401227`
- Head branch：`feature/search-and-filter`
- PR 标题：`feat: add campus item search and filters`

PR 描述模板：

```markdown
## 实现内容

- 增加名称、描述、分类和地点关键词匹配。
- 增加组合筛选和稳定排序。
- 增加搜索页、首页搜索入口和空结果引导。
- 增加搜索模块自动化测试。

## 验证结果

- `npm test -- --reporter=verbose`
- Test Files: 5 passed
- Tests: 23 passed

## 关联提交

- `<COMMIT_1>`
- `<COMMIT_2>`
- `<COMMIT_3>`
- `<COMMIT_4>`
- `<COMMIT_5>`
```

创建完成后不要自行合并。把 PR 链接、提交哈希和测试结果发给林子涵，由林子涵审查后合并。

## 七、交付回报

请返回以下信息：

- fork 仓库地址。
- 分支名称和 PR 地址。
- 各功能 commit 的哈希和标题。
- `npm test` 的完整结果。
- 搜索页、首页筛选和无结果状态的截图路径或链接。
