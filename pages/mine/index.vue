<template>
  <view class="page-shell mine-page">
    <view class="profile-card">
      <view class="avatar">李</view>
      <view class="profile-info">
        <text class="profile-name">{{ state.profile.displayName }} · 计算机与大数据学院</text>
        <text class="profile-stats">
          已发布 {{ myItems.length }} 条 · 已完成 {{ completedCount }} 条
        </text>
      </view>
    </view>

    <view class="segmented">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        class="segment"
        :class="{ active: type === option.value }"
        @click="type = option.value"
      >
        {{ option.label }}
      </button>
    </view>

    <view class="section-title">
      <text>我的发布</text>
      <text class="count">共 {{ filteredItems.length }} 条</text>
    </view>

    <view v-if="filteredItems.length" class="list">
      <view v-for="item in filteredItems" :key="item.id" class="mine-entry">
        <ItemCard :item="item" @select="openDetail" />
        <view class="actions">
          <button class="action primary" @click="toggleStatus(item)">
            {{ item.status === "open" ? getActionText(item) : getUndoActionText(item) }}
          </button>
          <button class="action" @click="editItem(item.id)">编辑</button>
          <button class="action danger" @click="confirmDelete(item)">删除</button>
        </view>
      </view>
    </view>
    <EmptyState
      v-else
      icon="🗂"
      title="还没有发布信息"
      description="发布寻物或招领信息后，可以在这里集中管理。"
      action-text="发布信息"
      @action="publish"
    />

    <view class="data-tools card">
      <text class="tools-title">数据管理</text>
      <text class="tools-desc">用于备份和验收演示，数据只在本机处理。</text>
      <view class="tool-actions">
        <button @click="exportData">导出到剪贴板</button>
        <button @click="importData">从剪贴板导入</button>
        <button class="danger" @click="confirmReset">恢复示例数据</button>
      </view>
    </view>

    <BottomNav current="mine" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import BottomNav from "../../components/BottomNav.vue";
import EmptyState from "../../components/EmptyState.vue";
import ItemCard from "../../components/ItemCard.vue";
import { useItemStore } from "../../src/store/item-store.js";
import { filterItems } from "../../src/domain/search.js";
import { getActionText, getUndoActionText } from "../../src/domain/items.js";

const store = useItemStore();
const state = store.state;
const type = ref("all");
const typeOptions = [
  { value: "all", label: "全部" },
  { value: "lost", label: "寻物" },
  { value: "found", label: "招领" }
];

const myItems = computed(() => store.items.value.filter((item) => {
  return item.ownerId === store.state.profile.id || item.ownerId === store.state.clientId;
}));
const filteredItems = computed(() => filterItems(myItems.value, {
  type: type.value,
  sort: "desc"
}));
const completedCount = computed(() => myItems.value.filter((item) => item.status === "resolved").length);

onShow(async () => {
  await store.initialize();
  await store.refresh();
});

function openDetail(id) {
  uni.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
}

function editItem(id) {
  uni.navigateTo({ url: `/pages/publish/index?id=${encodeURIComponent(id)}&from=mine` });
}

function publish() {
  uni.navigateTo({ url: "/pages/publish/index" });
}

function toggleStatus(item) {
  const nextStatus = item.status === "open" ? "resolved" : "open";
  const text = nextStatus === "resolved" ? getActionText(item) : "撤销完成状态";
  uni.showModal({
    title: "确认操作",
    content: `确定要${text}吗？`,
    success: async (result) => {
      if (!result.confirm) return;
      try {
        await store.setItemStatus(item.id, nextStatus);
        uni.showToast({ title: "状态已更新", icon: "success" });
      } catch (error) {
        uni.showToast({ title: error.message || "更新失败", icon: "none" });
      }
    }
  });
}

function confirmDelete(item) {
  uni.showModal({
    title: "删除信息",
    content: `确定删除“${item.title}”吗？删除后无法恢复。`,
    confirmColor: "#c62828",
    success: async (result) => {
      if (!result.confirm) return;
      try {
        await store.deleteItem(item.id);
        uni.showToast({ title: "已删除", icon: "success" });
      } catch (error) {
        uni.showToast({ title: error.message || "删除失败", icon: "none" });
      }
    }
  });
}

async function exportData() {
  try {
    const snapshot = await store.exportData();
    const data = JSON.stringify(snapshot);
    uni.setClipboardData({
      data,
      success: () => uni.showToast({ title: "数据已复制", icon: "success" })
    });
  } catch (error) {
    uni.showToast({ title: error.message || "导出失败", icon: "none" });
  }
}

function importData() {
  uni.getClipboardData({
    success: async (result) => {
      try {
        const snapshot = JSON.parse(result.data);
        await store.importData(snapshot);
        uni.showToast({ title: "导入成功", icon: "success" });
      } catch (error) {
        uni.showToast({ title: "剪贴板中没有有效数据", icon: "none" });
      }
    }
  });
}

function confirmReset() {
  uni.showModal({
    title: "恢复示例数据",
    content: "当前发布和状态修改将被覆盖，是否继续？",
    confirmColor: "#c62828",
    success: async (result) => {
      if (!result.confirm) return;
      await store.resetData();
      uni.showToast({ title: "已恢复示例数据", icon: "success" });
    }
  });
}
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 32rpx 28rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #2f6bff, #1e4fd8);
  color: #fff;
  box-shadow: 0 18rpx 42rpx rgba(47, 107, 255, 0.25);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  font-size: 38rpx;
  font-weight: 800;
}

.profile-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10rpx;
}

.profile-name {
  font-size: 29rpx;
  font-weight: 800;
}

.profile-stats {
  font-size: 22rpx;
  opacity: 0.86;
}

.segmented {
  display: flex;
  gap: 8rpx;
  margin-top: 24rpx;
  padding: 8rpx;
  border-radius: 24rpx;
  background: #e9edf5;
}

.segment {
  height: 64rpx;
  flex: 1;
  border-radius: 18rpx;
  color: var(--sub);
  font-size: 26rpx;
  font-weight: 700;
}

.segment.active {
  background: #fff;
  color: var(--brand);
  box-shadow: 0 4rpx 12rpx rgba(23, 26, 33, 0.09);
}

.mine-entry {
  margin-bottom: 20rpx;
}

.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 66rpx;
  flex: 1;
  border-radius: 18rpx;
  background: #eef1f6;
  color: var(--sub);
  font-size: 23rpx;
  font-weight: 800;
}

.action.primary {
  background: var(--brand-soft);
  color: var(--brand);
}

.action.danger {
  color: #c62828;
}

.data-tools {
  margin-top: 30rpx;
  padding: 26rpx;
}

.tools-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
}

.tools-desc {
  display: block;
  margin-top: 10rpx;
  color: var(--muted);
  font-size: 22rpx;
  line-height: 1.7;
}

.tool-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.tool-actions button {
  padding: 16rpx 22rpx;
  border-radius: 18rpx;
  background: #eef1f6;
  color: var(--sub);
  font-size: 22rpx;
  font-weight: 700;
}

.tool-actions button.danger {
  color: #c62828;
}
</style>
