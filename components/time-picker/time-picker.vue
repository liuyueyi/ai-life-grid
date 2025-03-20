<template>
  <view class="time-picker">
    <view class="time-picker-header">
      <text class="time-picker-title">选择时间</text>
      <view class="close-btn" @click="cancel">
        <text class="iconfont">×</text>
      </view>
    </view>
    <view class="time-picker-content">
      <view class="time-picker-columns">
        <!-- 小时选择 -->
        <scroll-view class="hour-column" scroll-y @scroll="onHourScroll">
          <view class="hour-list">
            <view 
              v-for="hour in 24" 
              :key="hour-1"
              :class="['hour-item', selectedHour === hour-1 ? 'selected' : '']"
              @click="selectHour(hour-1)"
            >
              {{ (hour-1).toString().padStart(2, '0') }}时
            </view>
          </view>
        </scroll-view>
        
        <!-- 分钟选择 -->
        <scroll-view class="minute-column" scroll-y @scroll="onMinuteScroll">
          <view class="minute-list">
            <view 
              v-for="minute in 60" 
              :key="minute-1"
              :class="['minute-item', selectedMinute === minute-1 ? 'selected' : '']"
              @click="selectMinute(minute-1)"
            >
              {{ (minute-1).toString().padStart(2, '0') }}分
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="time-picker-footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="confirm-btn" @click="confirm">确定</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TimePicker',
  props: {
    initialHour: {
      type: Number,
      default: 0
    },
    initialMinute: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedHour: this.initialHour,
      selectedMinute: this.initialMinute
    };
  },
  methods: {
    selectHour(hour) {
      this.selectedHour = hour;
    },
    selectMinute(minute) {
      this.selectedMinute = minute;
    },
    onHourScroll() {
      // 可以添加滚动效果的处理
    },
    onMinuteScroll() {
      // 可以添加滚动效果的处理
    },
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm', {
        hour: this.selectedHour,
        minute: this.selectedMinute
      });
    }
  }
};
</script>

<style>
.time-picker {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.time-picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  color: #999;
}

.time-picker-content {
  padding: 20rpx 0;
}

.time-picker-columns {
  display: flex;
  height: 400rpx;
}

.hour-column,
.minute-column {
  flex: 1;
  height: 100%;
}

.hour-list,
.minute-list {
  padding: 0 20rpx;
}

.hour-item,
.minute-item {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  border-radius: 8rpx;
  margin: 10rpx 0;
}

.hour-item.selected,
.minute-item.selected {
  background-color: #f0f9ff;
  color: #007aff;
  font-weight: bold;
}

.time-picker-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  border-radius: 8rpx;
  margin: 0 10rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #007aff;
  color: #fff;
}
</style>