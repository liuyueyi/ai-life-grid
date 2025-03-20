<template>
  <view class="date-picker">
    <view class="date-picker-header">
      <text class="date-picker-title">选择日期</text>
      <view class="close-btn" @click="cancel">
        <text class="iconfont">×</text>
      </view>
    </view>
    <view class="date-picker-content">
      <view class="date-picker-columns">
        <!-- 月份选择 -->
        <scroll-view class="month-column" scroll-y @scroll="onMonthScroll">
          <view class="month-list">
            <view 
              v-for="(month, index) in 12" 
              :key="index"
              :class="['month-item', selectedMonth === index ? 'selected' : '']"
              @click="selectMonth(index)"
            >
              {{ month }}月
            </view>
          </view>
        </scroll-view>
        
        <!-- 日期选择 -->
        <scroll-view class="day-column" scroll-y @scroll="onDayScroll">
          <view class="day-list">
            <view 
              v-for="day in daysInMonth" 
              :key="day"
              :class="['day-item', selectedDay === day ? 'selected' : '']"
              @click="selectDay(day)"
            >
              {{ day }}日
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="date-picker-footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="confirm-btn" @click="confirm">确定</button>
    </view>
  </view>
</template>

<script>
import { DateUtil } from '../../utils/DateUtil.js';

export default {
  name: 'DatePicker',
  props: {
    year: {
      type: Number,
      required: true
    },
    initialMonth: {
      type: Number,
      default: 0
    },
    initialDay: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      selectedMonth: this.initialMonth,
      selectedDay: this.initialDay,
      daysInMonth: []
    };
  },
  created() {
    this.updateDaysInMonth();
  },
  methods: {
    updateDaysInMonth() {
      this.daysInMonth = Array.from(
        { length: DateUtil.getDays(this.year, this.selectedMonth) }, 
        (_, i) => i + 1
      );
      
      // 如果选中的日期超过了当月的天数，则重置为当月最后一天
      if (this.selectedDay > this.daysInMonth.length) {
        this.selectedDay = this.daysInMonth.length;
      }
    },
    selectMonth(month) {
      this.selectedMonth = month;
      this.updateDaysInMonth();
    },
    selectDay(day) {
      this.selectedDay = day;
    },
    onMonthScroll() {
      // 可以添加滚动效果的处理
    },
    onDayScroll() {
      // 可以添加滚动效果的处理
    },
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm', {
        month: this.selectedMonth,
        day: this.selectedDay
      });
    }
  }
};
</script>

<style>
.date-picker {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.date-picker-title {
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

.date-picker-content {
  padding: 20rpx 0;
}

.date-picker-columns {
  display: flex;
  height: 400rpx;
}

.month-column,
.day-column {
  flex: 1;
  height: 100%;
}

.month-list,
.day-list {
  padding: 0 20rpx;
}

.month-item,
.day-item {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  border-radius: 8rpx;
  margin: 10rpx 0;
}

.month-item.selected,
.day-item.selected {
  background-color: #f0f9ff;
  color: #007aff;
  font-weight: bold;
}

.date-picker-footer {
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