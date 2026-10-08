<template>
  <view class="tabbar">
    <button class="tab" :class="{ active: current === 'home' }" @click="go('/pages/home/index')">
      <text class="icon">⌂</text>
      <text>首页</text>
    </button>
    <button class="publish" @click="go('/pages/publish/index')">
      <text class="plus">＋</text>
      <text class="publish-label">发布</text>
    </button>
    <button class="tab" :class="{ active: current === 'mine' }" @click="go('/pages/mine/index')">
      <text class="icon">◎</text>
      <text>我的发布</text>
    </button>
  </view>
</template>

<script setup>
defineProps({
  current: {
    type: String,
    default: "home"
  }
});

function go(url) {
  const pages = getCurrentPages();
  const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
  if (currentRoute === url) return;
  uni.redirectTo({ url });
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 138rpx minmax(0, 1fr);
  align-items: flex-start;
  justify-items: center;
  height: calc(138rpx + env(safe-area-inset-bottom));
  padding: 16rpx 40rpx env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -10rpx 34rpx rgba(23, 26, 33, 0.07);
}

.tab {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: center;
  height: 98rpx;
  flex-direction: column;
  gap: 6rpx;
  color: #a6adbc;
  font-size: 21rpx;
  font-weight: 700;
}

.tab.active {
  color: var(--brand);
}

.icon {
  font-size: 42rpx;
  line-height: 1;
}

.publish {
  position: relative;
  display: flex;
  width: 138rpx;
  height: 112rpx;
  align-items: center;
  justify-content: flex-start;
  justify-self: center;
  flex-direction: column;
  color: var(--muted);
  font-size: 21rpx;
  font-weight: 700;
}

.plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 98rpx;
  height: 98rpx;
  border: 8rpx solid #fff;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  font-size: 54rpx;
  font-weight: 300;
  box-shadow: 0 14rpx 32rpx rgba(47, 107, 255, 0.34);
}

.publish-label {
  margin-top: -2rpx;
}
</style>
