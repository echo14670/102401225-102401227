<template>
  <view class="empty-state">
    <text class="icon">{{ icon }}</text>
    <text class="title">{{ title }}</text>
    <text class="description">{{ description }}</text>
    <button v-if="actionText" class="action" @click="emit('action')">{{ actionText }}</button>
  </view>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "🔍"
  },
  title: {
    type: String,
    default: "暂无内容"
  },
  description: {
    type: String,
    default: ""
  },
  actionText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["action"]);
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  padding: 104rpx 36rpx;
  flex-direction: column;
  color: var(--muted);
  text-align: center;
}

.icon {
  margin-bottom: 18rpx;
  font-size: 72rpx;
}

.title {
  color: var(--sub);
  font-size: 30rpx;
  font-weight: 800;
}

.description {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
}

.action {
  margin-top: 26rpx;
  padding: 18rpx 34rpx;
  border-radius: 22rpx;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 26rpx;
  font-weight: 700;
}
</style>
