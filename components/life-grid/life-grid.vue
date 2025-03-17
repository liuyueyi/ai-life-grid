<template>
  <view class="life-grid">
    <!-- 未生成格子时显示输入表单 -->
    <view v-if="!userData" class="input-card">
      <view class="card-content">
        <text class="card-title">开始你的人生旅程</text>
        <form @submit="handleSubmit">
          <view class="form-grid">
            <view class="form-item">
              <view class="label">
                <text class="label-icon">📅</text>
                <text>出生日期</text>
              </view>
              <view class="date-input-group">
                <picker mode="date" :value="birthDate" @change="onBirthDateChange" class="date-picker">
                  <view class="picker-text">{{ birthDate || '请选择日期' }}</view>
                </picker>
                <input 
                  type="text" 
                  v-model="birthDateInput" 
                  @blur="handleBirthDateInput"
                  placeholder="YYYY-MM-DD"
                  class="date-input"
                />
                <picker 
                  mode="selector" 
                  :range="yearRange" 
                  @change="onBirthYearChange" 
                  class="year-picker"
                >
                  <view class="year-text">年份</view>
                </picker>
              </view>
            </view>
            
            <view class="form-item">
              <view class="label">
                <text class="label-icon">📅</text>
                <text>上学时间</text>
              </view>
              <view class="date-input-group">
                <picker mode="date" :value="schoolStartDate" @change="onSchoolStartDateChange" class="date-picker">
                  <view class="picker-text">{{ schoolStartDate || '请选择日期' }}</view>
                </picker>
                <input 
                  type="text" 
                  v-model="schoolStartDateInput" 
                  @blur="handleSchoolStartDateInput"
                  placeholder="YYYY-MM-DD"
                  class="date-input"
                />
                <picker 
                  mode="selector" 
                  :range="yearRange" 
                  @change="onSchoolStartYearChange" 
                  class="year-picker"
                >
                  <view class="year-text">年份</view>
                </picker>
              </view>
            </view>
            
            <view class="form-item">
              <view class="label">
                <text class="label-icon">🎓</text>
                <text>学历</text>
              </view>
              <picker :range="educationOptions" range-key="label" :value="educationIndex" @change="onEducationChange" class="picker">
                <view class="picker-text">{{ educationOptions[educationIndex].label }} ({{ educationOptions[educationIndex].years }}年)</view>
              </picker>
            </view>
            
            <view class="form-item">
              <view class="label">
                <text class="label-icon">⏱️</text>
                <text>退休岁数: {{ retirementAge }}</text>
              </view>
              <slider :min="20" :max="100" :step="1" :value="retirementAge" @change="onRetirementAgeChange" show-value class="slider" />
            </view>
            
            <view class="form-item full-width">
              <view class="label">
                <text class="label-icon">❤️</text>
                <text>临终岁数: {{ lifeExpectancyAge }}</text>
              </view>
              <slider :min="retirementAge + 1" :max="120" :step="1" :value="lifeExpectancyAge" @change="onLifeExpectancyAgeChange" show-value class="slider" />
            </view>
          </view>
          
          <button form-type="submit" class="submit-button">生成人生格子</button>
        </form>
      </view>
    </view>
    
    <!-- 已生成格子后显示格子视图 -->
    <view v-else class="grid-view">
      <!-- 详情视图 -->
      <day-detail-view 
        v-if="selectedDetail && selectedDetail.type === 'day'"
        :date="selectedDetail.date"
        :events="getEventsForDate(selectedDetail.date)"
        @add-events="addMultipleEvents"
        @close="closeDetailView"
      ></day-detail-view>
      
      <period-detail-view
        v-else-if="selectedDetail && selectedDetail.type === 'period'"
        :start-date="selectedDetail.date"
        :user-data="userData"
        :events="events"
        @add-event="addEvent"
        @close="closeDetailView"
        :show-dates="showDates"
      ></period-detail-view>
      
      <view v-else class="grid-card">
        <view class="grid-header">
          <text class="grid-title">你的人生格子</text>
          <button class="reset-button" @tap="resetGrid">重新设置</button>
        </view>
        
        <view class="date-toggle">
          <label class="toggle-label">
            <switch :checked="showDates" @change="onShowDatesChange" color="#8b5cf6" />
            <text>显示日期</text>
          </label>
        </view>
        
        <!-- 时间单位切换 -->
        <view class="tabs">
          <view 
            v-for="tab in tabs" 
            :key="tab.value" 
            class="tab" 
            :class="{ active: currentTab === tab.value }"
            @tap="changeTab(tab.value)"
          >
            {{ tab.label }}
          </view>
        </view>
        
        <!-- 格子显示区域 -->
        <life-grid-display
          :user-data="userData"
          :unit="currentTab"
          :events="events"
          @add-event="addMultipleEvents"
          :show-dates="showDates"
          @view-detail="onViewDetail"
        ></life-grid-display>
        
        <view class="share-button-container">
          <button class="share-button" @tap="shareLifeJourney">分享我的人生旅程</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import LifeGridDisplay from '@/components/life-grid-display/life-grid-display.vue'
import DayDetailView from '@/components/day-detail-view/day-detail-view.vue'
import PeriodDetailView from '@/components/period-detail-view/period-detail-view.vue'
import { formatDate, addYears, differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays } from '@/utils/date'

// 定义教育水平和对应年限
const educationLevels = [
  { value: 'primary', label: '小学', years: 6 },
  { value: 'middle', label: '初中', years: 3 },
  { value: 'high', label: '高中', years: 3 },
  { value: 'college', label: '大学', years: 4 },
  { value: 'master', label: '硕士', years: 3 },
  { value: 'phd', label: '博士', years: 4 }
]

export default {
  components: {
    LifeGridDisplay,
    DayDetailView,
    PeriodDetailView
  },
  data() {
    // 从本地存储加载数据
    const savedDates = uni.getStorageSync('lifeGridDates') || {}
    return {
      userData: null,
      birthDate: savedDates.birthDate || '',
      schoolStartDate: savedDates.schoolStartDate || '',
      birthDateInput: '',
      schoolStartDateInput: '',
      yearRange: Array.from({length: 100}, (_, i) => (new Date().getFullYear() - 99 + i).toString()),
      educationIndex: 3, // 默认选择大学
      retirementAge: 60,
      lifeExpectancyAge: 85,
      events: [],
      showDates: true,
      selectedDetail: null,
      currentTab: 'years',
      tabs: [
        { value: 'years', label: '年' },
        { value: 'months', label: '月' },
        { value: 'weeks', label: '周' },
        { value: 'days', label: '日' }
      ],
      educationOptions: educationLevels
    }
  },
  onload() {
    // 如果存在已保存的日期数据，自动生成生命格子
    if (this.birthDate && this.schoolStartDate) {
      this.handleSubmit();
    }
  },
  computed: {
    // 计算总教育年限
    totalEducationYears() {
      let total = 0
      const currentLevel = this.educationOptions[this.educationIndex].value
      
      for (const level of this.educationOptions) {
        total += level.years
        if (level.value === currentLevel) {
          break
        }
      }
      
      return total
    }
  },
  methods: {
    // 日期选择器变更
    onBirthDateChange(e) {
      this.birthDate = e.detail.value
      this.birthDateInput = e.detail.value
      this.saveToStorage()
    },
    onSchoolStartDateChange(e) {
      this.schoolStartDate = e.detail.value
      this.schoolStartDateInput = e.detail.value
      this.saveToStorage()
    },
    
    // 年份选择器变更
    onBirthYearChange(e) {
      const year = this.yearRange[e.detail.value]
      const date = new Date(this.birthDate || new Date())
      date.setFullYear(parseInt(year))
      this.birthDate = formatDate(date, 'yyyy-MM-dd')
      this.birthDateInput = this.birthDate
      this.saveToStorage()
    },
    onSchoolStartYearChange(e) {
      const year = this.yearRange[e.detail.value]
      const date = new Date(this.schoolStartDate || new Date())
      date.setFullYear(parseInt(year))
      this.schoolStartDate = formatDate(date, 'yyyy-MM-dd')
      this.schoolStartDateInput = this.schoolStartDate
      this.saveToStorage()
    },
    
    // 手动输入日期处理
    handleBirthDateInput() {
      const date = new Date(this.birthDateInput)
      if (!isNaN(date.getTime())) {
        this.birthDate = formatDate(date, 'yyyy-MM-dd')
        this.saveToStorage()
      } else {
        this.birthDateInput = this.birthDate
      }
    },
    handleSchoolStartDateInput() {
      const date = new Date(this.schoolStartDateInput)
      if (!isNaN(date.getTime())) {
        this.schoolStartDate = formatDate(date, 'yyyy-MM-dd')
        this.saveToStorage()
      } else {
        this.schoolStartDateInput = this.schoolStartDate
      }
    },
    
    // 保存到本地存储
    saveToStorage() {
      uni.setStorageSync('lifeGridDates', {
        birthDate: this.birthDate,
        schoolStartDate: this.schoolStartDate
      })
    },
    
    // 学历选择器变更
    onEducationChange(e) {
      this.educationIndex = e.detail.value
    },
    
    // 滑块变更
    onRetirementAgeChange(e) {
      this.retirementAge = e.detail.value
    },
    onLifeExpectancyAgeChange(e) {
      this.lifeExpectancyAge = e.detail.value
    },
    
    // 显示日期开关变更
    onShowDatesChange(e) {
      this.showDates = e.detail.value
    },
    
    // 切换时间单位标签
    changeTab(tab) {
      this.currentTab = tab
    },
    
    // 表单提交处理
    handleSubmit() {
      if (!this.birthDate || !this.schoolStartDate) {
        uni.showToast({
          title: '请选择出生日期和上学时间',
          icon: 'none'
        })
        return
      }
      
      const birth = new Date(this.birthDate)
      const schoolStart = new Date(this.schoolStartDate)
      
      // 计算学校结束日期
      const schoolEnd = new Date(schoolStart)
      schoolEnd.setFullYear(schoolStart.getFullYear() + this.totalEducationYears)
      
      // 计算退休和死亡日期
      const retirement = new Date(birth)
      retirement.setFullYear(birth.getFullYear() + this.retirementAge)
      
      const death = new Date(birth)
      death.setFullYear(birth.getFullYear() + this.lifeExpectancyAge)
      
      // 计算生命周期
      const periods = [
        { 
          name: '婴儿期', 
          start: birth, 
          end: addYears(birth, 3),
          color: 'bg-blue',
          range: '0-3岁'
        },
        { 
          name: '幼儿期', 
          start: addYears(birth, 3), 
          end: schoolStart,
          color: 'bg-green',
          range: `3-${differenceInYears(schoolStart, birth)}岁`
        },
        { 
          name: '小学', 
          start: schoolStart, 
          end: new Date(new Date(schoolStart).setFullYear(new Date(schoolStart).getFullYear() + 6)),
          color: 'bg-yellow',
          range: `${differenceInYears(schoolStart, birth)}-${differenceInYears(schoolStart, birth) + 6}岁`
        }
      ]
      
      // 添加初中
      if (['middle', 'high', 'college', 'master', 'phd'].includes(this.educationOptions[this.educationIndex].value)) {
        const middleSchoolStart = periods[2].end
        const middleSchoolEnd = new Date(middleSchoolStart)
        middleSchoolEnd.setFullYear(middleSchoolStart.getFullYear() + 3)
        periods.push({
          name: '初中',
          start: middleSchoolStart,
          end: middleSchoolEnd,
          color: 'bg-orange',
          range: `${differenceInYears(middleSchoolStart, birth)}-${differenceInYears(middleSchoolStart, birth) + 3}岁`
        })
      }
      
      // 添加高中
      if (['high', 'college', 'master', 'phd'].includes(this.educationOptions[this.educationIndex].value)) {
        const highSchoolStart = periods[periods.length - 1].end
        const highSchoolEnd = new Date(highSchoolStart)
        highSchoolEnd.setFullYear(highSchoolStart.getFullYear() + 3)
        periods.push({
          name: '高中',
          start: highSchoolStart,
          end: highSchoolEnd,
          color: 'bg-red',
          range: `${differenceInYears(highSchoolStart, birth)}-${differenceInYears(highSchoolStart, birth) + 3}岁`
        })
      }
      
      // 添加大学
      if (['college', 'master', 'phd'].includes(this.educationOptions[this.educationIndex].value)) {
        const collegeStart = periods[periods.length - 1].end
        const collegeEnd = new Date(collegeStart)
        collegeEnd.setFullYear(collegeStart.getFullYear() + 4)
        periods.push({
          name: '大学',
          start: collegeStart,
          end: collegeEnd,
          color: 'bg-purple',
          range: `${differenceInYears(collegeStart, birth)}-${differenceInYears(collegeStart, birth) + 4}岁`
        })
      }
      
      // 添加硕士
      if (['master', 'phd'].includes(this.educationOptions[this.educationIndex].value)) {
        const masterStart = periods[periods.length - 1].end
        const masterEnd = new Date(masterStart)
        masterEnd.setFullYear(masterStart.getFullYear() + 3)
        periods.push({
          name: '硕士',
          start: masterStart,
          end: masterEnd,
          color: 'bg-pink',
          range: `${differenceInYears(masterStart, birth)}-${differenceInYears(masterStart, birth) + 3}岁`
        })
      }
      
      // 添加博士
      if (['phd'].includes(this.educationOptions[this.educationIndex].value)) {
        const phdStart = periods[periods.length - 1].end
        const phdEnd = new Date(phdStart)
        phdEnd.setFullYear(phdStart.getFullYear() + 4)
        periods.push({
          name: '博士',
          start: phdStart,
          end: phdEnd,
          color: 'bg-fuchsia',
          range: `${differenceInYears(phdStart, birth)}-${differenceInYears(phdStart, birth) + 4}岁`
        })
      }
      
      // 添加工作期
      const workStart = periods[periods.length - 1].end
      periods.push({
        name: '工作期',
        start: workStart,
        end: retirement,
        color: 'bg-indigo',
        range: `${differenceInYears(workStart, birth)}-${this.retirementAge}岁`
      })
      
      // 添加退休期
      periods.push({
        name: '退休期',
        start: retirement,
        end: death,
        color: 'bg-gray',
        range: `${this.retirementAge}-${this.lifeExpectancyAge}岁`
      })
      
      // 设置用户数据
      this.userData = {
        birthDate: birth,
        schoolStartDate: schoolStart,
        schoolEndDate: schoolEnd,
        retirementDate: retirement,
        deathDate: death,
        totalDays: differenceInDays(death, birth),
        totalWeeks: differenceInWeeks(death, birth),
        totalMonths: differenceInMonths(death, birth),
        totalYears: differenceInYears(death, birth),
        periods
      }
    },
    
    // 重置格子
    resetGrid() {
      this.userData = null
    },
    
    // 添加事件
    addEvent(date, description, imageUrl) {
      this.events.push({ date, description, imageUrl })
    },
    
    // 添加多个事件
    addMultipleEvents(date, descriptions, imageUrl) {
      const newEvents = descriptions.map(description => ({ 
        date, 
        description,
        imageUrl 
      }))
      this.events = [...this.events, ...newEvents]
    },
    
    // 获取特定日期的事件
    getEventsForDate(date) {
      return this.events.filter(e => 
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
      )
    },
    
    // 查看详情
    onViewDetail(data) {
      this.selectedDetail = data
    },
    
    // 关闭详情视图
    closeDetailView() {
      this.selectedDetail = null
    },
    
    // 分享人生旅程
    shareLifeJourney() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.life-grid {
  width: 100%;
  margin: 0 auto;
}

.input-card {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10rpx);
}

.card-content {
  padding: 40rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #8b5cf6;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.full-width {
  width: 100%;
}

.label {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #4b5563;
}

.label-icon {
  margin-right: 10rpx;
}

.date-input-group {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.date-picker, .picker, .year-picker {
  flex: 2;
  height: 80rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 20rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.date-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 20rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  background-color: rgba(255, 255, 255, 0.8);
}

.year-picker {
  width: 120rpx;
}

.year-text {
  font-size: 28rpx;
  color: #6b7280;
  text-align: center;
}

.picker-text {
  font-size: 28rpx;
  color: #1f2937;
}

.slider {
  margin: 15rpx 0;
}

.submit-button {
  width: 100%;
  height: 90rpx;
  border-radius: 20rpx;
  margin-top: 40rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(236, 72, 153, 0.3);
}

.grid-view {
  width: 100%;
}

.grid-card {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  backdrop-filter: blur(10rpx);
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.grid-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #8b5cf6;
}

.reset-button {
  padding: 10rpx 30rpx;
  border-radius: 100rpx;
  border: 1rpx solid rgba(139, 92, 246, 0.3);
  background-color: transparent;
  color: #6b7280;
  font-size: 24rpx;
}

.date-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.toggle-label {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #4b5563;
}

.toggle-label text {
  margin-left: 10rpx;
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
}

.tab.active {
  background-color: white;
  color: #8b5cf6;
  font-weight: bold;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

.share-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 30rpx;
}

.share-button {
  padding: 15rpx 40rpx;
  border-radius: 100rpx;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 28rpx;
  box-shadow: 0 4rpx 10rpx rgba(236, 72, 153, 0.3);
}
</style>

