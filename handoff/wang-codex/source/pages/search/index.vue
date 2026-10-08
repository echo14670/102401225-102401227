<template>
  <view class="page-shell no-tab">
    <view class="search-box">
      <text class="search-icon">⌕</text>
      <input
        v-model="query"
        class="search-input"
        focus
        placeholder="搜索物品名称，如校园卡"
        confirm-type="search"
        @confirm="remember"
      />
      <text v-if="query" class="clear" @click="query = ''">✕</text>
    </view>

    <view class="section-title">
      <text>热门搜索</text>
    </view>
    <view class="hot-list">
      <button
        v-for="keyword in hotKeywords"
        :key="keyword"
        class="hot-item"
        @click="selectKeyword(keyword)"
      >
        {{ keyword }}
      </button>
    </view>

    <view class="section-title">
      <text>搜索结果</text>
      <text class="count">共 {{ results.length }} 条</text>
    </view>

    <view v-if="query && results.length" class="list">
      <ItemCard
        v-for="item in results"
        :key="item.id"
        :item="item"
        @select="openDetail"
      />
    </view>
    <EmptyState
      v-else-if="query"
      icon="🔍"
      title="没有找到相关物品"
      description="换个关键词试试，或发布一条寻物信息让同学帮你留意。"
      action-text="发布寻物信息"
      @action="openPublish"
    />
    <view v-else class="search-hint">
      <text>输入关键词后，将按名称、描述、分类和地点实时匹配。</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import EmptyState from "../../components/EmptyState.vue";
import ItemCard from "../../components/ItemCard.vue";
import { useItemStore } from "../../src/store/item-store.js";
import { filterItems } from "../../src/domain/search.js";

const store = useItemStore();
const query = ref("");
const hotKeywords = ["校园卡", "钥匙", "耳机", "雨伞", "水杯", "书籍"];

const results = computed(() => {
  if (!query.value.trim()) return [];
  return filterItems(store.items.value, {
    query: query.value,
    sort: "desc"
  });
});

function selectKeyword(keyword) {
  query.value = keyword;
  remember();
}

function remember() {
  store.rememberSearch(query.value);
}

function openDetail(id) {
  remember();
  uni.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
}

function openPublish() {
  remember();
  uni.navigateTo({ url: "/pages/publish/index?type=lost" });
}
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  height: 82rpx;
  padding: 0 22rpx;
  border-radius: 24rpx;
  background: #eef1f6;
}

.search-icon {
  margin-right: 12rpx;
  color: var(--muted);
  font-size: 34rpx;
}

.search-input {
  min-width: 0;
  flex: 1;
  font-size: 27rpx;
}

.clear {
  color: var(--muted);
  font-size: 25rpx;
}

.hot-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.hot-item {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: var(--sub);
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 14rpx rgba(23, 26, 33, 0.05);
}

.search-hint {
  padding: 100rpx 34rpx;
  color: var(--muted);
  font-size: 25rpx;
  line-height: 1.8;
  text-align: center;
}
</style>
