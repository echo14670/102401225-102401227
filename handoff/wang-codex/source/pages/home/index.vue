<template>
  <view class="page-shell home-page">
    <view class="search-bar" @click="openSearch">
      <text class="search-icon">⌕</text>
      <text class="search-placeholder">搜索校园卡、钥匙、耳机…</text>
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

    <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
      <view class="filter-row">
        <button
          v-for="option in categoryOptions"
          :key="option"
          class="filter-chip"
          :class="{ active: category === option }"
          @click="category = option"
        >
          {{ option === "all" ? "全部分类" : option }}
        </button>
      </view>
    </scroll-view>

    <view class="location-filter card">
      <text class="location-label">地点筛选</text>
      <input
        v-model="location"
        class="location-input"
        placeholder="例如：图书馆、紫金楼"
        confirm-type="search"
      />
      <text v-if="location" class="clear" @click="location = ''">清除</text>
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
      description="可以换个分类或地点，也可以发布一条寻物信息。"
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
import { filterItems } from "../../src/domain/search.js";
import { CATEGORIES } from "../../src/domain/constants.js";

const store = useItemStore();
const state = store.state;
const type = ref("all");
const category = ref("all");
const location = ref("");
const typeOptions = [
  { value: "all", label: "全部" },
  { value: "lost", label: "寻物" },
  { value: "found", label: "招领" }
];
const categoryOptions = ["all", ...CATEGORIES];

const filteredItems = computed(() => filterItems(store.items.value, {
  type: type.value,
  category: category.value,
  location: location.value,
  sort: "desc"
}));

onShow(async () => {
  await store.initialize();
  await store.refresh();
});

function openSearch() {
  uni.navigateTo({ url: "/pages/search/index" });
}

function openDetail(id) {
  uni.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
}

function openPublish() {
  uni.navigateTo({ url: "/pages/publish/index?type=lost" });
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  height: 82rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 26, 33, 0.055);
}

.search-icon {
  margin-right: 14rpx;
  color: var(--muted);
  font-size: 34rpx;
}

.search-placeholder {
  color: var(--muted);
  font-size: 26rpx;
}

.segmented {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 22rpx;
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

.filter-scroll {
  width: 100%;
  margin-top: 22rpx;
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 20rpx;
}

.filter-chip {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: var(--sub);
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 14rpx rgba(23, 26, 33, 0.05);
}

.filter-chip.active {
  background: var(--brand-soft);
  color: var(--brand);
}

.location-filter {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 20rpx 22rpx;
}

.location-label {
  color: var(--sub);
  font-size: 24rpx;
  font-weight: 700;
}

.location-input {
  min-width: 0;
  flex: 1;
  font-size: 25rpx;
}

.clear {
  color: var(--brand);
  font-size: 23rpx;
  font-weight: 700;
}

.loading {
  padding: 90rpx 0;
  color: var(--muted);
  font-size: 26rpx;
  text-align: center;
}
</style>
