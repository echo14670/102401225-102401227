<template>
  <view class="page-shell no-tab success-page">
    <view class="success-icon">✓</view>
    <text class="success-title">发布成功！</text>
    <text class="success-desc">信息已进入校园失物招领池，有同学匹配到会通过你留下的方式联系你。</text>

    <view v-if="item" class="summary card">
      <text class="summary-label">刚刚发布的信息</text>
      <view class="summary-body">
        <view class="thumb" :style="{ background: visual.tint }">
          <text>{{ visual.emoji }}</text>
        </view>
        <view class="summary-info">
          <text class="summary-title">{{ item.title }}</text>
          <text class="summary-meta">{{ typeText }} · {{ item.location }}</text>
        </view>
      </view>
    </view>

    <view class="actions">
      <button class="primary-button" @click="goMine">查看我的发布</button>
      <button class="secondary-button" @click="goHome">返回首页</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useItemStore } from "../../src/store/item-store.js";
import { getItemVisual, getTypeText } from "../../src/domain/items.js";

const store = useItemStore();
const itemId = ref("");
const item = computed(() => store.getItem(itemId.value));
const visual = computed(() => getItemVisual(item.value || {}));
const typeText = computed(() => getTypeText(item.value || {}));

onLoad(async (options = {}) => {
  await store.initialize();
  itemId.value = decodeURIComponent(options.id || "");
});

function goMine() {
  uni.redirectTo({ url: "/pages/mine/index" });
}

function goHome() {
  uni.redirectTo({ url: "/pages/home/index" });
}
</script>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  padding-top: 100rpx;
  flex-direction: column;
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 152rpx;
  height: 152rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #34d399, #0ea47a);
  color: #fff;
  font-size: 78rpx;
  box-shadow: 0 26rpx 54rpx rgba(14, 164, 122, 0.28);
}

.success-title {
  margin-top: 32rpx;
  font-size: 42rpx;
  font-weight: 800;
}

.success-desc {
  max-width: 590rpx;
  margin-top: 16rpx;
  color: var(--sub);
  font-size: 25rpx;
  line-height: 1.8;
}

.summary {
  width: 100%;
  margin-top: 46rpx;
  padding: 24rpx;
  text-align: left;
}

.summary-label {
  color: var(--muted);
  font-size: 22rpx;
}

.summary-body {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 18rpx;
}

.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border-radius: 22rpx;
  font-size: 42rpx;
}

.summary-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8rpx;
}

.summary-title {
  overflow: hidden;
  font-size: 29rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-meta {
  color: var(--muted);
  font-size: 23rpx;
}

.actions {
  display: flex;
  width: 100%;
  margin-top: 42rpx;
  flex-direction: column;
  gap: 18rpx;
}
</style>
