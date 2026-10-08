<template>
  <view class="item-card card" @click="emit('select', item.id)">
    <view class="thumb" :style="{ background: visual.tint }">
      <image v-if="item.photo" class="thumb-image" :src="item.photo" mode="aspectFill" />
      <text v-else class="thumb-emoji">{{ visual.emoji }}</text>
    </view>
    <view class="info">
      <view class="top-row">
        <text class="title">{{ item.title }}</text>
        <text class="tag" :class="item.type">{{ typeText }}</text>
      </view>
      <text class="meta">📍 {{ item.location }} · {{ eventText }}</text>
      <view class="foot-row">
        <text class="status" :class="statusClass">{{ statusText }}</text>
        <text class="time">{{ relativeText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import {
  formatDateTime,
  formatRelativeTime,
  getItemVisual,
  getStatusText,
  getTypeText
} from "../src/domain/items.js";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["select"]);
const visual = computed(() => getItemVisual(props.item));
const typeText = computed(() => getTypeText(props.item));
const statusText = computed(() => getStatusText(props.item));
const statusClass = computed(() => props.item.status === "open" ? "open" : "done");
const eventText = computed(() => formatDateTime(props.item.eventTime));
const relativeText = computed(() => formatRelativeTime(props.item.createdAt));
</script>

<style scoped>
.item-card {
  display: flex;
  gap: 20rpx;
  padding: 22rpx;
}

.item-card + .item-card {
  margin-top: 18rpx;
}

.thumb {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 116rpx;
  height: 116rpx;
  overflow: hidden;
  border-radius: 24rpx;
}

.thumb-image {
  width: 100%;
  height: 100%;
}

.thumb-emoji {
  font-size: 54rpx;
}

.info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 10rpx;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title {
  min-width: 0;
  overflow: hidden;
  flex: 1;
  font-size: 28rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  overflow: hidden;
  color: var(--muted);
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.foot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  color: #b6bcc9;
  font-size: 21rpx;
}
</style>
