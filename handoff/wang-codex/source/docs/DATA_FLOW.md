# 数据流与状态流

## 主数据流

```mermaid
flowchart LR
    U[用户] --> P[uni-app 页面]
    P --> S[全局 Item Store]
    S --> R{Repository}
    R -->|默认| L[uni storage 本地数据]
    R -->|可选| C[uniCloud 阿里云函数]
    C --> D[(lost_found_items)]
```

## 发布流程

```mermaid
flowchart TD
    A[点击发布] --> B[选择寻物或招领]
    B --> C[填写字段]
    C --> D{校验通过?}
    D -->|否| E[显示字段错误]
    E --> C
    D -->|是| F[写入 Repository]
    F --> G[发布成功页]
    G --> H[首页]
    G --> I[我的发布]
```

## 搜索流程

```mermaid
flowchart TD
    A[进入搜索页] --> B[输入关键词]
    B --> C[匹配名称/描述/分类/地点]
    C --> D{有结果?}
    D -->|是| E[展示结果列表]
    E --> F[进入详情]
    D -->|否| G[提示暂无结果]
    G --> H[引导发布寻物信息]
```

## 状态流

```text
寻物：寻找中 -> 已找回 -> 寻找中（撤销）
招领：待认领 -> 已归还 -> 待认领（撤销）
```

状态修改由发布者在详情页或“我的发布”触发，Repository 在写回前检查 `ownerId`。变更完成后，全局 Store 更新列表，首页、搜索、详情和我的发布使用同一份响应式数据。
