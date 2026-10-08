<template>
  <view class="page-shell no-tab detail-page">
    <view v-if="item">
      <view class="cover" :style="{ background: visual.tint }">
        <image v-if="item.photo" class="cover-image" :src="item.photo" mode="aspectFill" />
        <text v-else class="cover-emoji">{{ visual.emoji }}</text>
      </view>

      <view class="detail-card card">
        <view class="title-row">
          <text class="title">{{ item.title }}</text>
          <text class="tag" :class="item.type">{{ typeText }}</text>
        </view>
        <view class="status-row">
          <text class="status" :class="statusClass">{{ statusText }}</text>
          <text class="publish-time">发布于 {{ formatDateTime(item.createdAt) }}</text>
        </view>

        <view class="rows">
          <view class="row">
            <text>物品分类</text>
            <text class="value">{{ item.category }}</text>
          </view>
          <view class="row">
            <text>发生时间</text>
            <text class="value">{{ formatDateTime(item.eventTime) }}</text>
          </view>
          <view class="row">
            <text>发生地点</text>
            <text class="value">{{ item.location }}</text>
          </view>
          <view class="row">
            <text>发布者</text>
            <text class="value">{{ ownerText }}</text>
          </view>
        </view>

        <text class="block-title">详细描述</text>
        <text class="description">{{ item.description }}</text>

        <text class="block-title">联系方式</text>
        <button class="contact" @click="toggleContact">
          <text>{{ contactVisible ? item.contact : "点击查看微信 / 手机号" }}</text>
          <text class="contact-action">{{ contactVisible ? "复制" : "仅用于归还物品" }}</text>
        </button>
      </view>

      <view class="detail-actions">
        <button
          v-if="canManage"
          class="secondary-action"
          @click="toggleStatus"
        >
          {{ item.status === "open" ? actionText : undoActionText }}
        </button>
        <button class="primary-button" @click="copyContact">
          {{ contactVisible ? "复制联系方式" : "联系发布者" }}
        </button>
      </view>

      <button v-if="canManage" class="edit-link" @click="editItem">编辑这条信息</button>
    </view>

    <EmptyState
      v-else
      icon="📄"
      title="信息不存在"
      description="该信息可能已被删除。"
      action-text="返回首页"
      @action="goHome"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import EmptyState from "../../components/EmptyState.vue";
import { useItemStore } from "../../src/store/item-store.js";
import {
  formatDateTime,
  getActionText,
  getItemVisual,
  getStatusText,
  getTypeText,
  getUndoActionText
} from "../../src/domain/items.js";

const store = useItemStore();
const itemId = ref("");
const contactVisible = ref(false);
const item = computed(() => store.getItem(itemId.value));
const visual = computed(() => getItemVisual(item.value || {}));
const typeText = computed(() => getTypeText(item.value || {}));
const statusText = computed(() => getStatusText(item.value || {}));
const statusClass = computed(() => item.value?.status === "open" ? "open" : "done");
const actionText = computed(() => getActionText(item.value || {}));
const undoActionText = computed(() => getUndoActionText(item.value || {}));
const canManage = computed(() => {
  if (!item.value) return false;
  return item.value.ownerId === store.state.profile.id || item.value.ownerId === store.state.clientId;
});
const ownerText = computed(() => canManage.value ? "我发布的信息" : "校园用户");

onLoad(async (options = {}) => {
  await store.initialize();
  itemId.value = decodeURIComponent(options.id || "");
});

function toggleContact() {
  if (!contactVisible.value) {
    contactVisible.value = true;
    return;
  }
  copyContact();
}

function copyContact() {
  if (!item.value) return;
  contactVisible.value = true;
  uni.setClipboardData({
    data: item.value.contact,
    success: () => uni.showToast({ title: "联系方式已复制", icon: "success" })
  });
}

function toggleStatus() {
  if (!item.value) return;
  const nextStatus = item.value.status === "open" ? "resolved" : "open";
  const action = nextStatus === "resolved" ? actionText.value : undoActionText.value;
  uni.showModal({
    title: "确认操作",
    content: `确定要${action}吗？`,
    success: async (result) => {
      if (!result.confirm) return;
      try {
        await store.setItemStatus(item.value.id, nextStatus);
        uni.showToast({ title: "状态已更新", icon: "success" });
      } catch (error) {
        uni.showToast({ title: error.message || "更新失败", icon: "none" });
      }
    }
  });
}

function editItem() {
  uni.navigateTo({ url: `/pages/publish/index?id=${encodeURIComponent(itemId.value)}&from=detail` });
}

function goHome() {
  uni.redirectTo({ url: "/pages/home/index" });
}
</script>

<style scoped>
.cover {
  display: flex;
  height: 360rpx;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 36rpx;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-emoji {
  font-size: 142rpx;
}

.detail-card {
  position: relative;
  margin: -44rpx 18rpx 0;
  padding: 30rpx 28rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.title {
  min-width: 0;
  flex: 1;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.4;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.publish-time {
  color: #b6bcc9;
  font-size: 21rpx;
}

.rows {
  margin-top: 22rpx;
  padding-top: 8rpx;
  border-top: 2rpx solid var(--line);
}

.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 0;
  border-bottom: 2rpx solid var(--line);
  color: var(--muted);
  font-size: 25rpx;
}

.row:last-child {
  border-bottom: 0;
}

.value {
  max-width: 70%;
  color: var(--text);
  font-weight: 700;
  text-align: right;
}

.block-title {
  display: block;
  margin-top: 24rpx;
  font-size: 27rpx;
  font-weight: 800;
}

.description {
  display: block;
  margin-top: 14rpx;
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f7f9fc;
  color: #414961;
  font-size: 25rpx;
  line-height: 1.8;
}

.contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 84rpx;
  margin-top: 14rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 25rpx;
  font-weight: 800;
  text-align: left;
}

.contact-action {
  color: #7c93c8;
  font-size: 20rpx;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.secondary-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  height: 92rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  background: #eef1f6;
  color: var(--sub);
  font-size: 25rpx;
  font-weight: 800;
}

.detail-actions .primary-button {
  flex: 1;
}

.edit-link {
  width: 100%;
  height: 84rpx;
  margin-top: 16rpx;
  color: var(--brand);
  font-size: 26rpx;
  font-weight: 700;
}
</style>
