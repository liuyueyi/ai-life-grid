<template>
  <view class="life-grid-display">
    <!-- 格子网格 -->
    <view :class="['grid', getGridCols()]">
      <view 
        v-for="(cell, index) in cells" 
        :key="index"
        :class="['cell', getColorForDate(getDateForCell(index))]"
        :style="getCellStyle(getDateForCell(index))"
        @tap="handleCellClick(getDateForCell(index))"
      >
        <!-- 时期信息 -->
        <view v-if="getPeriodInfo(getDateForCell(index))" class="period-label">
          {{ getPeriodInfo(getDateForCell(index)).name }} ({{ getPeriodInfo(getDateForCell(index)).range }})
        </view>
        
        <!-- 日期显示 -->
        <view v-if="showDates" class="date-label">
          {{ formatCellDate(getDateForCell(index)) }}
        </view>
        
        <!-- 详情按钮 -->
        <view class="detail-button" @tap.stop="viewDetail(getDateForCell(index))">
          <text class="detail-icon">🔍</text>
        </view>
        
        <!-- 事件数量标记 -->
        <view v-if="getEventsForDate(getDateForCell(index)).length > 0" class="event-badge">
          {{ getEventsForDate(getDateForCell(index)).length }}
        </view>
        
        <!-- 未来日期遮罩 -->
        <view v-if="isFutureDate(getDateForCell(index))" class="future-overlay">
          <text v-if="!isToday(getDateForCell(index))" class="future-text">未来</text>
        </view>
      </view>
    </view>
    
    <!-- 添加事件弹窗 -->
    <custom-popup ref="eventPopup" type="center">
      <view class="popup-content">
        <view class="popup-title">{{ selectedDate ? formatCellDate(selectedDate) : '' }}</view>
        
        <view class="popup-form">
          <view class="form-item">
            <text class="form-label">背景图片</text>
            <view class="image-upload">
              <view class="upload-buttons">
                <button class="upload-button" @tap="chooseImage">选择图片</button>
                <text class="or-text">或</text>
                <input 
                  type="text" 
                  v-model="imageUrl" 
                  placeholder="图片URL" 
                  class="image-url-input"
                />
              </view>
              
              <view v-if="imageUrl" class="image-preview">
                <image :src="imageUrl" mode="aspectFill" class="preview-image"></image>
                <text class="remove-image" @tap="removeImage">×</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">关键事项记录</text>
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
        </view>
        
        <view class="popup-buttons">
          <button class="cancel-button" @tap="closePopup">取消</button>
          <button class="save-button" @tap="handleAddEvents">保存</button>
        </view>
      </view>
    </custom-popup>
  </view>
</template>

<script>
import { formatDate, addDays, addWeeks, addMonths, addYears, isSameDay } from '@/utils/date'
import CustomPopup from '@/components/custom-popup/custom-popup.vue'

export default {
  components: {
    CustomPopup
  },
  props: {
    userData: {
      type: Object,
      required: true
    },
    unit: {
      type: String,
      default: 'years'
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
      selectedDate: null,
      eventInputs: [''],
      imageUrl: '',
      cells: []
    }
  },
  watch: {
    unit() {
      this.updateCells()
    },
    userData() {
      this.updateCells()
    }
  },
  created() {
    this.updateCells()
  },
  methods: {
    updateCells() {
      const cellCount = this.getCellCount()
      this.cells = Array.from({ length: cellCount }, (_, i) => i)
    },
    
    // 获取单元格数量
    getCellCount() {
      switch (this.unit) {
        case 'days':
          return Math.min(this.userData.totalDays, 1000) // 限制为1000天以保证性能
        case 'weeks':
          return this.userData.totalWeeks
        case 'months':
          return this.userData.totalMonths
        case 'years':
          return this.userData.totalYears
        default:
          return 0
      }
    },
    
    // 获取特定索引的日期
    getDateForCell(index) {
      const { birthDate } = this.userData
      switch (this.unit) {
        case 'days':
          return addDays(birthDate, index)
        case 'weeks':
          return addWeeks(birthDate, index)
        case 'months':
          return addMonths(birthDate, index)
        case 'years':
          return addYears(birthDate, index)
        default:
          return birthDate
      }
    },
    
    // 获取日期的颜色
    getColorForDate(date) {
      for (const period of this.userData.periods) {
        if (date >= period.start && date < period.end) {
          return period.color
        }
      }
      return 'bg-gray'
    },
    
    // 获取时期信息
    getPeriodInfo(date) {
      for (const period of this.userData.periods) {
        if (isSameDay(date, period.start)) {
          return { name: period.name, range: period.range || '' }
        }
      }
      return null
    },
    
    // 获取特定日期的事件
    getEventsForDate(date) {
      return this.events.filter(event => {
        if (this.unit === 'days') {
          return isSameDay(event.date, date)
        } else if (this.unit === 'weeks') {
          const endDate = addWeeks(date, 1)
          return event.date >= date && event.date < endDate
        } else if (this.unit === 'months') {
          const endDate = addMonths(date, 1)
          return event.date >= date && event.date < endDate
        } else if (this.unit === 'years') {
          const endDate = addYears(date, 1)
          return event.date >= date && event.date < endDate
        }
        return false
      })
    },
    
    // 获取单元格背景图片
    getCellBackgroundImage(date) {
      const dateEvents = this.getEventsForDate(date)
      return dateEvents.find(event => event.imageUrl)?.imageUrl
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
    
    // 格式化单元格日期
    formatCellDate(date) {
      switch (this.unit) {
        case 'days':
          return formatDate(date, 'yyyy-MM-dd')
        case 'weeks':
          return `${formatDate(date, 'yyyy-MM-dd')} 周`
        case 'months':
          return formatDate(date, 'yyyy-MM')
        case 'years':
          return formatDate(date, 'yyyy')
        default:
          return ''
      }
    },
    
    // 获取网格列数
    getGridCols() {
      switch (this.unit) {
        case 'days':
          return 'grid-cols-7'
        case 'weeks':
          return 'grid-cols-7'
        case 'months':
          return 'grid-cols-6'
        case 'years':
          return 'grid-cols-5'
        default:
          return 'grid-cols-5'
      }
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
    
    // 单元格点击处理
    handleCellClick(date) {
      this.selectedDate = date
      this.eventInputs = ['']
      this.imageUrl = ''
      this.$refs.eventPopup.open()
    },
    
    // 查看详情
    viewDetail(date) {
      this.$emit('view-detail', {
        type: this.unit === 'days' ? 'day' : 'period',
        date
      })
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
          this.imageUrl = res.tempFilePaths[0]
        }
      })
    },
    
    // 移除图片
    removeImage() {
      this.imageUrl = ''
    },
    
    // 关闭弹窗
    closePopup() {
      this.$refs.eventPopup.close()
    },
    
    // 添加事件
    handleAddEvents() {
      if (this.selectedDate) {
        const validDescriptions = this.eventInputs.filter(input => input.trim() !== '')
        if (validDescriptions.length > 0) {
          this.$emit('add-event', this.selectedDate, validDescriptions, this.imageUrl || undefined)
          this.eventInputs = ['']
          this.imageUrl = ''
          this.closePopup()
        }
      }
    }
  }
}
</script>

<style>
.life-grid-display {
  width: 100%;
}

.grid {
  display: grid;
  gap: 10rpx;
  padding: 10rpx;
  width: 100%;
  box-sizing: border-box;
}

.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.grid-cols-7 {
  grid-template-columns: repeat(7, 1fr);
}

.cell {
  aspect-ratio: 1;
  border-radius: 20rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s;
}

.cell:active {
  transform: scale(0.95);
  opacity: 0.9;
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

.period-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 20rpx;
  padding: 4rpx;
  text-align: center;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-label {
  font-size: 20rpx;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2rpx 10rpx;
  border-radius: 100rpx;
  margin-top: 20rpx;
  backdrop-filter: blur(5rpx);
}

.detail-button {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 100rpx;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5rpx);
}

.detail-icon {
  font-size: 20rpx;
}

.event-badge {
  position: absolute;
  bottom: 5rpx;
  right: 5rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  border-radius: 100rpx;
  width: 30rpx;
  height: 30rpx;
  font-size: 20rpx;
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
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.future-text {
  font-size: 24rpx;
  color: #6b7280;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 4rpx 16rpx;
  border-radius: 100rpx;
}

/* 弹窗样式 */
.popup-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: popup-fade-in 0.3s ease-out;
}

@keyframes popup-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #8b5cf6;
}

.popup-form {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 28rpx;
  color: #4b5563;
  margin-bottom: 10rpx;
  display: block;
}

.image-upload {
  margin-bottom: 20rpx;
}

.upload-buttons {
  display: flex;
  align-items: center;
}

.upload-button {
  flex: 1;
  height: 70rpx;
  font-size: 24rpx;
  background-color: #f3f4f6;
  border-radius: 10rpx;
}

.or-text {
  margin: 0 20rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.image-url-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.image-preview {
  margin-top: 20rpx;
  height: 160rpx;
  border-radius: 10rpx;
  overflow: hidden;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.event-inputs {
  margin-bottom: 20rpx;
}

.event-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.event-textarea {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 24rpx;
}

.remove-event {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
  background-color: #ef4444;
  color: white;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.remove-event.disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
}

.add-event-button {
  width: 100%;
  height: 70rpx;
  font-size: 24rpx;
  background-color: #f3f4f6;
  border-radius: 10rpx;
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  margin-right: 10rpx;
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  height: 70rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.save-button {
  height: 70rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  border-radius: 10rpx;
}
</style>

