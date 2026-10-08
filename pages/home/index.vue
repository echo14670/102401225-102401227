<template>
  <view class="page-shell home-page">
    <view class="hero-card">
      <text class="hero-title">校园失物招领</text>
      <text class="hero-desc">集中浏览校园里的寻物和招领信息</text>
      <text class="hero-count">当前共 {{ filteredItems.length }} 条信息</text>
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
      <text>校园信息</text>
      <text class="count">共 {{ filteredItems.length }} 条</text>
    </view>

    <view v-if="state.loading && !state.ready" class="loading">正在加载校园信息…</view>
    <view v-else-if="filteredItems.length" class="list">
      <ItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        @select="openDetail"
      />
    </view>
    <EmptyState
      v-else
      icon="📭"
      title="暂时没有匹配的信息"
      description="可以切换类型，也可以发布一条寻物信息。"
      action-text="发布寻物信息"
      @action="openPublish"
    />

    <BottomNav current="home" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import BottomNav from "../../components/BottomNav.vue";
import EmptyState from "../../components/EmptyState.vue";
import ItemCard from "../../components/ItemCard.vue";
import { useItemStore } from "../../src/store/item-store.js";

const store = useItemStore();
const state = store.state;
const type = ref("all");
const typeOptions = [
  { value: "all", label: "全部" },
  { value: "lost", label: "寻物" },
  { value: "found", label: "招领" }
];

const filteredItems = computed(() => {
  const items = store.items.value;
  const filtered = type.value === "all"
    ? items
    : items.filter((item) => item.type === type.value);

  return [...filtered].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
});

onShow(async () => {
  await store.initialize();
  await store.refresh();
});

function openDetail(id) {
  uni.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
}

function openPublish() {
  uni.navigateTo({ url: "/pages/publish/index?type=lost" });
}
</script>

<style scoped>
.hero-card {
  display: flex;
  padding: 34rpx 30rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #2f6bff, #1e4fd8);
  color: #fff;
  flex-direction: column;
  gap: 10rpx;
  box-shadow: 0 18rpx 42rpx rgba(47, 107, 255, 0.22);
}

.hero-title {
  font-size: 38rpx;
  font-weight: 800;
}

.hero-desc {
  font-size: 24rpx;
  opacity: 0.86;
}

.hero-count {
  margin-top: 8rpx;
  font-size: 23rpx;
  font-weight: 700;
}

.segmented {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 24rpx;
  padding: 8rpx;
  border-radius: 24rpx;
  background: #e9edf5;
}

.segment {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 64rpx;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 18rpx;
  color: var(--sub);
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1;
}

.segment.active {
  background: #fff;
  color: var(--brand);
  box-shadow: 0 4rpx 12rpx rgba(23, 26, 33, 0.09);
}

.loading {
  padding: 90rpx 0;
  color: var(--muted);
  font-size: 26rpx;
  text-align: center;
}
</style>
