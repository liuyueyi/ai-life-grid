<template>
  <view class="period-detail">
    <view class="header">
      <view class="back-button" @tap="onClose">
        <text class="back-icon">←</text>
      </view>
      <view class="period-title">
        {{ period ? `${period.name} (${period.range})` : "时期详情" }}
      </view>
    </view>
    
    <view class="days-grid">
      <view 
        v-for="(day, index) in days" 
        :key="index"
        :class="['day-cell', getColorForDate(day)]"
        :style="getCellStyle(day)"
        @tap="selectDate(day)"
      >
        <!-- 日期显示 -->
        <view v-if="showDates" class="date-label">
          {{ formatDate(day, 'MM-dd') }}
        </view>
        
        <!-- 事件数量标记 -->
        <view v-if="getEventsForDate(day).length > 0" class="event-badge">
          {{ getEventsForDate(day).length }}
        </view>
        
        <!-- 未来日期遮罩 -->
        <view v-if="isFutureDate(day)" class="future-overlay">
          <text v-if="!isToday(day)" class="future-text">未来</text>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <button class="back-button-large" @tap="onClose">返回</button>
    </view>
  </view>
</template>

<script>
import { formatDate, addDays, isSameDay } from '@/utils/date'

export default {
  props: {
    startDate: {
      type: Date,
      required: true
    },
    userData: {
      type: Object,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    },
    showDates: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedDate: null
    }
  },
  computed: {
    // 获取当前时期
    period() {
      for (const period of this.userData.periods) {
        if (this.startDate >= period.start && this.startDate < period.end) {
          return period
        }
      }
      return null
    },
    
    // 获取时期内的所有天
    days() {
      if (!this.period) return []
      
      const days = []
      let currentDay = this.period.start
      
      while (currentDay < this.period.end) {
        days.push(new Date(currentDay))
        currentDay = addDays(currentDay, 1)
      }
      
      return days
    }
  },
  methods: {
    formatDate,
    
    // 获取日期的颜色
    getColorForDate(date) {
      return this.period?.color || 'bg-gray'
    },
    
    // 检查日期是否在未来
    isFutureDate(date) {
      return date > new Date()
    },
    
    // 检查日期是否是今天
    isToday(date) {
      const today = new Date()
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    },
    
    // 获取特定日期的事件
    getEventsForDate(date) {
      return this.events.filter(event => 
        isSameDay(event.date, date)
      )
    },
    
    // 获取单元格背景图片
    getCellBackgroundImage(date) {
      const dateEvents = this.getEventsForDate(date)
      return dateEvents.find(event => event.imageUrl)?.imageUrl
    },
    
    // 获取单元格样式
    getCellStyle(date) {
      const style = {}
      const bgImage = this.getCellBackgroundImage(date)
      
      if (bgImage) {
        style.backgroundImage = `url(${bgImage})`
        style.backgroundSize = 'cover'
        style.backgroundPosition = 'center'
      }
      
      if (this.isToday(date)) {
        style.boxShadow = '0 0 0 2px #8b5cf6'
      }
      
      return style
    },
    
    // 选择日期
    selectDate(date) {
      this.selectedDate = date
    },
    
    // 关闭
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style>
.period-detail {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.back-button {
  width: 70rpx;
  height: 70rpx;
  border-radius: 100rpx;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 32rpx;
  color: #4b5563;
}

.period-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #8b5cf6;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.day-cell {
  width: calc(14.285% - 9rpx);
  height: 80rpx;
  border-radius: 15rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s;
}

.day-cell:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.date-label {
  font-size: 20rpx;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2rpx 10rpx;
  border-radius: 100rpx;
  backdrop-filter: blur(5rpx);
}

.event-badge {
  position: absolute;
  bottom: 5rpx;
  right: 5rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  border-radius: 100rpx;
  width: 25rpx;
  height: 25rpx;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
}

.future-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5rpx);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.future-text {
  font-size: 20rpx;
  color: #6b7280;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2rpx 10rpx;
  border-radius: 100rpx;
}

.footer {
  display: flex;
  justify-content: flex-end;
}

.back-button-large {
  padding: 15rpx 40rpx;
  border-radius: 100rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(236, 72, 153, 0.3);
}

.bg-blue {
  background-color: rgba(191, 219, 254, 0.6);
}

.bg-green {
  background-color: rgba(187, 247, 208, 0.6);
}

.bg-yellow {
  background-color: rgba(254, 240, 138, 0.6);
}

.bg-orange {
  background-color: rgba(254, 215, 170, 0.6);
}

.bg-red {
  background-color: rgba(254, 202, 202, 0.6);
}

.bg-purple {
  background-color: rgba(233, 213, 255, 0.6);
}

.bg-pink {
  background-color: rgba(252, 231, 243, 0.6);
}

.bg-fuchsia {
  background-color: rgba(245, 208, 254, 0.6);
}

.bg-indigo {
  background-color: rgba(224, 231, 255, 0.6);
}

.bg-gray {
  background-color: rgba(229, 231, 235, 0.6);
}
</style>

