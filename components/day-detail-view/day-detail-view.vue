<template>
  <view class="day-detail">
    <!-- 背景图片 -->
    <view class="background-image" :style="{ backgroundImage: `url(${bgImage})` }"></view>
    
    <!-- 头部 -->
    <view class="header">
      <view class="back-button" @tap="onClose">
        <text class="back-icon">←</text>
      </view>
      <view class="date-title">{{ formatDate(date, 'yyyy年MM月dd日') }}</view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <view class="tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value" 
          class="tab" 
          :class="{ active: currentTab === tab.value }"
          @tap="changeTab(tab.value)"
        >
          <text class="tab-icon">{{ tab.icon }}</text>
          <text>{{ tab.label }}</text>
        </view>
      </view>
      
      <!-- 事件标签页 -->
      <view v-if="currentTab === 'events'" class="tab-content">
        <view class="section">
          <view class="section-header">
            <text class="section-title">背景图片</text>
            <view class="image-upload-button" @tap="chooseImage">
              <text class="upload-icon">📷</text>
              <text>选择图片</text>
            </view>
          </view>
          
          <view v-if="bgImage" class="image-preview">
            <image :src="bgImage" mode="aspectFill" class="preview-image"></image>
            <text class="remove-image" @tap="removeImage">×</text>
          </view>
        </view>
        
        <view class="section">
          <text class="section-title">今日事件记录</text>
          <view class="event-inputs">
            <view v-for="(input, index) in eventInputs" :key="index" class="event-input-row">
              <textarea 
                v-model="eventInputs[index]" 
                :placeholder="`事项 ${index + 1}`"
                class="event-textarea"
              ></textarea>
              <text 
                class="remove-event" 
                :class="{ disabled: eventInputs.length === 1 }"
                @tap="removeEventInput(index)"
              >×</text>
            </view>
            
            <button class="add-event-button" @tap="addEventInput">
              <text class="add-icon">+</text> 添加事项
            </button>
          </view>
        </view>
        
        <view v-if="events.length > 0" class="section">
          <text class="section-title">已记录事件</text>
          <view class="event-list">
            <view v-for="(event, index) in events" :key="index" class="event-item">
              {{ event.description }}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 心情标签页 -->
      <view v-if="currentTab === 'mood'" class="tab-content">
        <view class="section">
          <text class="section-title">今日心情</text>
          <textarea 
            v-model="mood" 
            placeholder="记录一下今天的心情..."
            class="mood-textarea"
          ></textarea>
        </view>
      </view>
      
      <!-- 财务标签页 -->
      <view v-if="currentTab === 'finance'" class="tab-content">
        <view class="finance-cards">
          <view class="finance-card income-card">
            <view class="card-header">
              <text class="card-title">收入</text>
            </view>
            <view class="card-body">
              <text class="input-label">今日收入</text>
              <input 
                type="digit" 
                v-model="income" 
                placeholder="0.00"
                class="finance-input"
              />
            </view>
          </view>
          
          <view class="finance-card expense-card">
            <view class="card-header">
              <text class="card-title">支出</text>
            </view>
            <view class="card-body">
              <text class="input-label">今日支出</text>
              <input 
                type="digit" 
                v-model="expenses" 
                placeholder="0.00"
                class="finance-input"
              />
            </view>
          </view>
        </view>
        
        <view class="finance-summary-card">
          <view class="card-header">
            <text class="card-title">收支统计</text>
          </view>
          <view class="card-body">
            <view class="summary-grid">
              <view class="summary-item">
                <text class="summary-label">收入</text>
                <text class="summary-value income-value">¥{{ parseFloat(income || 0).toFixed(2) }}</text>
              </view>
              <view class="summary-item">
                <text class="summary-label">支出</text>
                <text class="summary-value expense-value">¥{{ parseFloat(expenses || 0).toFixed(2) }}</text>
              </view>
              <view class="summary-item">
                <text class="summary-label">结余</text>
                <text :class="['summary-value', parseFloat(income || 0) - parseFloat(expenses || 0) >= 0 ? 'income-value' : 'expense-value']">
                  ¥{{ (parseFloat(income || 0) - parseFloat(expenses || 0)).toFixed(2) }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="footer">
      <button class="cancel-button" @tap="onClose">取消</button>
      <button class="save-button" @tap="handleSave">保存</button>
    </view>
  </view>
</template>

<script>
import { formatDate } from '@/utils/date'

export default {
  props: {
    date: {
      type: Date,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentTab: 'events',
      tabs: [
        { value: 'events', label: '今日事件', icon: '📅' },
        { value: 'mood', label: '心情日记', icon: '✏️' },
        { value: 'finance', label: '收支记录', icon: '💰' }
      ],
      eventInputs: [''],
      bgImage: '',
      mood: '',
      income: '',
      expenses: ''
    }
  },
  created() {
    // 如果有事件图片，则使用第一个事件的图片
    if (this.events.find(e => e.imageUrl)) {
      this.bgImage = this.events.find(e => e.imageUrl)?.imageUrl || ''
    } else {
      // 否则使用随机占位图
      this.bgImage = `/static/placeholder.jpg?text=Day+${formatDate(this.date, 'yyyy-MM-dd')}`
    }
  },
  methods: {
    formatDate,
    
    // 切换标签
    changeTab(tab) {
      this.currentTab = tab
    },
    
    // 添加事件输入框
    addEventInput() {
      this.eventInputs.push('')
    },
    
    // 移除事件输入框
    removeEventInput(index) {
      if (this.eventInputs.length > 1) {
        this.eventInputs.splice(index, 1)
      }
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.bgImage = res.tempFilePaths[0]
        }
      })
    },
    
    // 移除图片
    removeImage() {
      this.bgImage = ''
    },
    
    // 保存
    handleSave() {
      const validDescriptions = this.eventInputs.filter(input => input.trim() !== '')
      if (validDescriptions.length > 0) {
        this.$emit('add-events', validDescriptions, this.bgImage)
      }
      this.$emit('close')
    },
    
    // 关闭
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style>
.day-detail {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(10rpx);
  opacity: 0.3;
  z-index: 0;
}

.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
  padding: 20rpx;
}

.back-button {
  width: 70rpx;
  height: 70rpx;
  border-radius: 100rpx;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 32rpx;
  color: #4b5563;
}

.date-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #8b5cf6;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  padding: 10rpx 30rpx;
  border-radius: 100rpx;
  backdrop-filter: blur(10rpx);
  padding: 10rpx 30rpx;
  border-radius: 100rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.content-area {
  position: relative;
  z-index: 1;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  padding: 30rpx;
  margin: 0 20rpx 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  background-color: rgba(243, 244, 246, 0.5);
  border-radius: 20rpx;
  padding: 5rpx;
  margin-bottom: 30rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  font-size: 28rpx;
  color: #6b7280;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.active {
  background-color: white;
  color: #8b5cf6;
  font-weight: bold;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

.tab-icon {
  margin-right: 10rpx;
}

.tab-content {
  padding: 10rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #4b5563;
  margin-bottom: 15rpx;
}

.image-upload-button {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  padding: 10rpx 30rpx;
  border-radius: 100rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(236, 72, 153, 0.3);
}

.upload-icon {
  margin-right: 10rpx;
}

.image-preview {
  height: 200rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  margin-bottom: 20rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.event-inputs {
  margin-bottom: 20rpx;
}

.event-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.event-textarea {
  flex: 1;
  height: 100rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 20rpx;
  padding: 15rpx;
  font-size: 28rpx;
  background-color: rgba(255, 255, 255, 0.8);
}

.remove-event {
  width: 50rpx;
  height: 50rpx;
  margin-left: 15rpx;
  background-color: #ef4444;
  color: white;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.remove-event.disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
}

.add-event-button {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 20rpx;
  margin-top: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  margin-right: 10rpx;
}

.event-list {
  margin-top: 15rpx;
}

.event-item {
  padding: 20rpx;
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(139, 92, 246, 0.1);
}

.mood-textarea {
  width: 100%;
  height: 400rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: rgba(255, 255, 255, 0.8);
}

.finance-cards {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.finance-card {
  flex: 1;
  border-radius: 20rpx;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.income-card .card-header {
  background: linear-gradient(to right, #10b981, #34d399);
}

.expense-card .card-header {
  background: linear-gradient(to right, #ef4444, #f87171);
}

.card-header {
  padding: 20rpx;
  color: white;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
}

.card-body {
  padding: 20rpx;
}

.input-label {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 10rpx;
  display: block;
}

.finance-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 15rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.finance-summary-card {
  border-radius: 20rpx;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.finance-summary-card .card-header {
  background: linear-gradient(to right, #3b82f6, #60a5fa);
}

.summary-grid {
  display: flex;
  padding: 20rpx 0;
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: 15rpx;
  background-color: rgba(243, 244, 246, 0.5);
  margin: 0 10rpx;
  border-radius: 15rpx;
}

.summary-label {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 10rpx;
  display: block;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
}

.income-value {
  color: #10b981;
}

.expense-value {
  color: #ef4444;
}

.footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 20rpx;
}

.cancel-button {
  padding: 15rpx 40rpx;
  border-radius: 100rpx;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  color: #6b7280;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.save-button {
  padding: 15rpx 40rpx;
  border-radius: 100rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(236, 72, 153, 0.3);
}
</style>

