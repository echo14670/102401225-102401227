<template>
  <view class="page-shell no-tab publish-page">
    <view class="segmented type-switch">
      <button
        class="segment"
        :class="{ active: form.type === 'lost' }"
        @click="form.type = 'lost'"
      >
        <text class="segment-title">我丢了东西</text>
        <text class="segment-subtitle">发布寻物信息</text>
      </button>
      <button
        class="segment"
        :class="{ active: form.type === 'found' }"
        @click="form.type = 'found'"
      >
        <text class="segment-title">我捡到东西</text>
        <text class="segment-subtitle">发布招领信息</text>
      </button>
    </view>

    <button class="upload-card card" @click="choosePhoto">
      <image v-if="form.photo" class="photo-preview" :src="form.photo" mode="aspectFill" />
      <view v-else class="upload-content">
        <text class="upload-icon">＋</text>
        <text class="upload-title">添加实物照片</text>
        <text class="upload-hint">有助于快速辨认，可跳过</text>
      </view>
      <text v-if="form.photo" class="replace-photo">更换照片</text>
    </button>

    <view class="form-list">
      <view class="field card" :class="{ invalid: errors.title }">
        <text class="label">物品名称 <text class="required">*</text></text>
        <input
          :value="form.title"
          class="input"
          maxlength="30"
          placeholder="如：校园卡 / 黑色雨伞"
          @input="onTextInput('title', $event)"
          @blur="onTextInput('title', $event)"
          @confirm="onTextInput('title', $event)"
        />
        <text v-if="errors.title" class="error">{{ errors.title }}</text>
      </view>

      <view class="field card picker-field" :class="{ invalid: errors.category }">
        <text class="label">物品分类 <text class="required">*</text></text>
        <picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
          <view class="picker-value">
            {{ form.category || "请选择分类" }}
            <text class="arrow">›</text>
          </view>
        </picker>
        <text v-if="errors.category" class="error">{{ errors.category }}</text>
      </view>

      <view class="field card picker-field" :class="{ invalid: errors.eventTime }">
        <text class="label">发生时间 <text class="required">*</text></text>
        <view class="time-pickers">
          <picker mode="date" :value="eventDate" @change="onDateChange">
            <view class="picker-value">{{ eventDate }}</view>
          </picker>
          <picker mode="time" :value="eventClock" @change="onTimeChange">
            <view class="picker-value">{{ eventClock }}</view>
          </picker>
        </view>
        <text v-if="errors.eventTime" class="error">{{ errors.eventTime }}</text>
      </view>

      <view class="field card" :class="{ invalid: errors.location }">
        <text class="label">发生地点 <text class="required">*</text></text>
        <input
          :value="form.location"
          class="input"
          maxlength="50"
          placeholder="如：紫金楼 A 座 305"
          @input="onTextInput('location', $event)"
          @blur="onTextInput('location', $event)"
          @confirm="onTextInput('location', $event)"
        />
        <text v-if="errors.location" class="error">{{ errors.location }}</text>
      </view>

      <view class="field card textarea-field" :class="{ invalid: errors.description }">
        <text class="label">详细描述 <text class="required">*</text></text>
        <textarea
          :value="form.description"
          class="textarea"
          maxlength="200"
          placeholder="描述颜色、品牌、是否有挂件等特征"
          @input="onTextInput('description', $event)"
          @blur="onTextInput('description', $event)"
        />
        <text class="counter">{{ form.description.length }}/200</text>
        <text v-if="errors.description" class="error">{{ errors.description }}</text>
      </view>

      <view class="field card" :class="{ invalid: errors.contact }">
        <text class="label">联系方式 <text class="required">*</text></text>
        <input
          :value="form.contact"
          class="input"
          maxlength="50"
          placeholder="微信号 / 手机号 / QQ"
          @input="onTextInput('contact', $event)"
          @blur="onTextInput('contact', $event)"
          @confirm="onTextInput('contact', $event)"
        />
        <text v-if="errors.contact" class="error">{{ errors.contact }}</text>
      </view>
    </view>

    <view v-if="form.type === 'found'" class="safety-tip">
      <text class="tip-title">📌 安全提示</text>
      <text>招领信息建议只公开部分特征，例如校园卡只写尾号；认领时请对方说出完整特征，避免被冒领。</text>
    </view>

    <view class="publish-actions">
      <button class="primary-button" :disabled="submitting" @click="submit">
        {{ submitting ? "正在保存…" : editingId ? "保存修改" : "发布" }}
      </button>
      <button class="danger-button" @click="goBack">取消</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onBackPress, onLoad } from "@dcloudio/uni-app";
import { CATEGORIES } from "../../src/domain/constants.js";
import { useItemStore } from "../../src/store/item-store.js";
import { validateItemDraft } from "../../src/domain/validation.js";

const store = useItemStore();
const categories = [...CATEGORIES];
const editingId = ref("");
const returnUrl = ref("/pages/home/index");
const submitting = ref(false);
const errors = reactive({});
const form = reactive({
  type: "lost",
  title: "",
  category: "证件卡片",
  eventTime: new Date().toISOString(),
  location: "",
  description: "",
  contact: "微信 lixx_0921",
  photo: ""
});

const categoryIndex = computed(() => {
  const index = categories.indexOf(form.category);
  return index < 0 ? 0 : index;
});

const eventDate = computed(() => toLocalParts(form.eventTime).date);
const eventClock = computed(() => toLocalParts(form.eventTime).time);

onLoad(async (options = {}) => {
  await store.initialize();
  if (options.id) {
    const item = await store.getItem(decodeURIComponent(options.id));
    if (!item) {
      uni.showToast({ title: "信息不存在", icon: "none" });
      setTimeout(() => uni.reLaunch({ url: "/pages/mine/index" }), 800);
      return;
    }
    editingId.value = item.id;
    returnUrl.value = options.from === "mine"
      ? "/pages/mine/index"
      : `/pages/detail/index?id=${encodeURIComponent(item.id)}`;
    Object.assign(form, {
      type: item.type,
      title: item.title,
      category: item.category,
      eventTime: item.eventTime,
      location: item.location,
      description: item.description,
      contact: item.contact,
      photo: item.photo || ""
    });
    uni.setNavigationBarTitle({ title: "编辑信息" });
  } else if (options.type === "found") {
    form.type = "found";
  }
});

function toLocalParts(value) {
  const date = new Date(value);
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const pad = (part) => String(part).padStart(2, "0");
  return {
    date: `${safeDate.getFullYear()}-${pad(safeDate.getMonth() + 1)}-${pad(safeDate.getDate())}`,
    time: `${pad(safeDate.getHours())}:${pad(safeDate.getMinutes())}`
  };
}

function updateEventTime(nextDate = eventDate.value, nextTime = eventClock.value) {
  const date = new Date(`${nextDate}T${nextTime}:00`);
  form.eventTime = date.toISOString();
  clearError("eventTime");
}

function clearError(field) {
  delete errors[field];
}

function onTextInput(field, event) {
  const value = event?.detail?.value;
  if (value !== undefined && value !== null) {
    form[field] = String(value);
  }
  clearError(field);
}

function onCategoryChange(event) {
  form.category = categories[Number(event.detail.value)] || categories[0];
  clearError("category");
}

function onDateChange(event) {
  updateEventTime(event.detail.value, eventClock.value);
}

function onTimeChange(event) {
  updateEventTime(eventDate.value, event.detail.value);
}

function choosePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (result) => {
      const tempPath = result.tempFilePaths?.[0];
      if (!tempPath) return;
      form.photo = await persistPhoto(tempPath);
    },
    fail: (error) => {
      if (!/cancel/i.test(String(error?.errMsg || ""))) {
        uni.showToast({ title: "选择照片失败", icon: "none" });
      }
    }
  });
}

function persistPhoto(tempPath) {
  const fileSystem = uni.getFileSystemManager?.();
  if (!fileSystem?.saveFile) return Promise.resolve(tempPath);

  return new Promise((resolve) => {
    fileSystem.saveFile({
      tempFilePath: tempPath,
      success: (result) => resolve(result.savedFilePath || result.filePath || tempPath),
      fail: () => resolve(tempPath)
    });
  });
}

function validateBeforeSubmit() {
  const checked = validateItemDraft(form);
  Object.keys(errors).forEach((key) => delete errors[key]);
  Object.assign(errors, checked.errors);
  return checked.valid ? checked.value : null;
}

async function submit() {
  const draft = validateBeforeSubmit();
  if (!draft) {
    uni.showToast({ title: "请检查标红的必填项", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    if (editingId.value) {
      await store.updateItem(editingId.value, draft);
      uni.showToast({ title: "修改成功", icon: "success" });
      setTimeout(() => uni.reLaunch({ url: returnUrl.value }), 700);
      return;
    }

    const item = await store.createItem(draft);
    uni.redirectTo({
      url: `/pages/success/index?id=${encodeURIComponent(item.id)}`
    });
  } catch (error) {
    if (error.fields) Object.assign(errors, error.fields);
    uni.showToast({ title: error.message || "保存失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  if (editingId.value) {
    uni.reLaunch({ url: returnUrl.value });
    return;
  }

  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.redirectTo({ url: "/pages/home/index" });
}

onBackPress(() => {
  goBack();
  return true;
});
</script>

<style scoped>
.type-switch {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
  padding: 8rpx;
  border-radius: 28rpx;
  background: #e9edf5;
}

.segment {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 108rpx;
  align-items: center;
  justify-content: center;
  flex: 1;
  border-radius: 22rpx;
  flex-direction: column;
  gap: 5rpx;
  color: var(--sub);
  font-size: 27rpx;
  font-weight: 700;
}

.segment.active {
  background: #fff;
  color: var(--brand);
  box-shadow: 0 6rpx 16rpx rgba(23, 26, 33, 0.09);
}

.segment-subtitle {
  font-size: 20rpx;
  font-weight: 600;
  opacity: 0.72;
}

.upload-card {
  position: relative;
  display: flex;
  width: 100%;
  height: 220rpx;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 22rpx;
}

.photo-preview {
  width: 100%;
  height: 100%;
}

.replace-photo {
  position: absolute;
  right: 18rpx;
  bottom: 18rpx;
  padding: 10rpx 18rpx;
  border-radius: 16rpx;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  font-size: 22rpx;
}

.upload-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6rpx;
  color: var(--brand);
}

.upload-icon {
  font-size: 52rpx;
  line-height: 1;
}

.upload-title {
  font-size: 27rpx;
  font-weight: 800;
}

.upload-hint {
  color: var(--muted);
  font-size: 22rpx;
}

.form-list {
  display: flex;
  margin-top: 20rpx;
  flex-direction: column;
  gap: 18rpx;
}

.field {
  padding: 22rpx;
  border: 2rpx solid transparent;
}

.field.invalid {
  border-color: #f5a2ad;
}

.label {
  display: block;
  color: var(--sub);
  font-size: 25rpx;
  font-weight: 700;
}

.required {
  color: #f5455c;
}

.input {
  width: 100%;
  height: 58rpx;
  margin-top: 8rpx;
  font-size: 27rpx;
  font-weight: 600;
}

.picker-field picker {
  display: block;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58rpx;
  margin-top: 8rpx;
  color: var(--text);
  font-size: 27rpx;
  font-weight: 600;
}

.arrow {
  color: var(--brand);
  font-size: 36rpx;
}

.time-pickers {
  display: flex;
  gap: 18rpx;
}

.time-pickers picker {
  flex: 1;
}

.textarea-field {
  position: relative;
}

.textarea {
  width: 100%;
  height: 154rpx;
  margin-top: 10rpx;
  font-size: 27rpx;
  line-height: 1.65;
}

.counter {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  color: #c3c9d6;
  font-size: 21rpx;
}

.error {
  display: block;
  margin-top: 8rpx;
  color: #d84259;
  font-size: 22rpx;
}

.safety-tip {
  display: flex;
  margin-top: 20rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: #fff8e6;
  color: #8a6d1f;
  flex-direction: column;
  gap: 8rpx;
  font-size: 23rpx;
  line-height: 1.7;
}

.tip-title {
  font-weight: 800;
}

.publish-actions {
  margin-top: 28rpx;
}
</style>
