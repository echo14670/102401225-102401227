<script>
import { useItemStore } from "./src/store/item-store.js";

export default {
  async onLaunch() {
    try {
      await useItemStore().initialize();
    } catch (error) {
      console.error("应用初始化失败", error);
    }
  }
};
</script>

<style>
page {
  --brand: #2f6bff;
  --brand-dark: #1e4fd8;
  --brand-soft: #eaf1ff;
  --lost: #f97316;
  --lost-soft: #fff2e8;
  --found: #0ea47a;
  --found-soft: #e7f7f1;
  --bg: #f4f6fa;
  --card: #ffffff;
  --text: #171a21;
  --sub: #5b6273;
  --muted: #9aa1b1;
  --line: #eef1f6;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
button,
input,
textarea,
picker {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  line-height: 1.2;
  background: none;
  border: 0;
}

button::after {
  border: 0;
}

.page-shell {
  min-height: 100vh;
  padding: 24rpx 28rpx calc(172rpx + env(safe-area-inset-bottom));
}

.page-shell.no-tab {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 4rpx 18rpx;
  font-size: 28rpx;
  font-weight: 800;
}

.section-title .count {
  color: var(--muted);
  font-size: 23rpx;
  font-weight: 600;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 92rpx;
  border-radius: 26rpx;
  background: var(--brand);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 14rpx 34rpx rgba(47, 107, 255, 0.24);
}

.primary-button[disabled] {
  opacity: 0.55;
}

.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 86rpx;
  border-radius: 24rpx;
  background: #eef1f6;
  color: var(--sub);
  font-size: 28rpx;
  font-weight: 700;
}

.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 78rpx;
  color: #c62828;
  font-size: 27rpx;
  font-weight: 700;
}

.card {
  background: var(--card);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 26rpx rgba(23, 26, 33, 0.055);
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: 800;
}

.tag.lost {
  background: var(--lost-soft);
  color: var(--lost);
}

.tag.found {
  background: var(--found-soft);
  color: var(--found);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.status::before {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: currentColor;
  content: "";
}

.status.open {
  color: #d58a12;
}

.status.done {
  color: var(--found);
  opacity: 0.9;
}
</style>
