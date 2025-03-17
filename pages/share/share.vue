<template>
  <view class="container">
    <view class="share-book" :class="{ 'open': isBookOpen }">
      <view class="book-cover" @click="openBook">
        <view class="book-title">{{ userData.name || '我' }}的人生格子</view>
        <view class="book-subtitle">{{ formatDateRange() }}</view>
      </view>
      
      <view class="book-pages">
        <!-- 第一页：介绍 -->
        <view class="book-page page-intro">
          <view class="page-header">
            <text class="page-title">人生简介</text>
          </view>
          <view class="page-content">
            <view class="user-info">
              <view class="user-avatar">
                <text class="avatar-placeholder">{{ getNameInitial() }}</text>
              </view>
              <view class="user-details">
                <text class="user-name">{{ userData.name || '我' }}</text>
                <text class="user-birth">{{ formatDate(userData.birthDate) }}</text>
              </view>
            </view>
            
            <view class="life-stages">
              <view class="stage-item">
                <view class="stage-dot childhood"></view>
                <view class="stage-info">
                  <text class="stage-name">童年</text>
                  <text class="stage-period">{{ formatChildhoodPeriod() }}</text>
                </view>
              </view>
              
              <view class="stage-item">
                <view class="stage-dot education"></view>
                <view class="stage-info">
                  <text class="stage-name">学习</text>
                  <text class="stage-period">{{ formatEducationPeriod() }}</text>
                </view>
              </view>
              
              <view class="stage-item">
                <view class="stage-dot work"></view>
                <view class="stage-info">
                  <text class="stage-name">工作</text>
                  <text class="stage-period">{{ formatWorkPeriod() }}</text>
                </view>
              </view>
              
              <view class="stage-item">
                <view class="stage-dot retirement"></view>
                <view class="stage-info">
                  <text class="stage-name">退休</text>
                  <text class="stage-period">{{ formatRetirementPeriod() }}</text>
                </view>
              </view>
            </view>
            
            <view class="life-summary">
              <text class="summary-title">生命格子统计</text>
              <view class="summary-grid">
                <view class="summary-item">
                  <text class="summary-value">{{ getTotalYears() }}</text>
                  <text class="summary-label">总年数</text>
                </view>
                <view class="summary-item">
                  <text class="summary-value">{{ getPastYears() }}</text>
                  <text class="summary-label">已度过</text>
                </view>
                <view class="summary-item">
                  <text class="summary-value">{{ getFutureYears() }}</text>
                  <text class="summary-label">未来</text>
                </view>
                <view class="summary-item">
                  <text class="summary-value">{{ getCompletionPercentage() }}%</text>
                  <text class="summary-label">完成度</text>
                </view>
              </view>
            </view>
          </view>
          <view class="page-footer">
            <text>向右滑动查看更多</text>
          </view>
        </view>
        
        <!-- 第二页：关键事件 -->
        <view class="book-page page-events">
          <view class="page-header">
            <text class="page-title">人生关键事件</text>
          </view>
          <view class="page-content">
            <view class="timeline">
              <view v-for="(event, index) in keyEvents" :key="index" class="timeline-item">
                <view class="timeline-dot" :class="getStageClass(event.year)"></view>
                <view class="timeline-content">
                  <text class="timeline-date">{{ event.year }}年</text>
                  <text class="timeline-title">{{ event.title }}</text>
                  <text v-if="event.description" class="timeline-description">{{ event.description }}</text>
                </view>
              </view>
              
              <view v-if="keyEvents.length === 0" class="no-events">
                <text>暂无关键事件记录</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 第三页：心情统计 -->
        <view class="book-page page-mood">
          <view class="page-header">
            <text class="page-title">心情统计</text>
          </view>
          <view class="page-content">
            <view class="mood-summary">
              <view class="mood-chart">
                <view class="chart-placeholder">
                  <text>心情分布图</text>
                  <view class="mood-distribution">
                    <view class="mood-bar" style="height: 60%; background-color: #4caf50;">
                      <text class="mood-percentage">60%</text>
                    </view>
                    <view class="mood-bar" style="height: 25%; background-color: #2196f3;">
                      <text class="mood-percentage">25%</text>
                    </view>
                    <view class="mood-bar" style="height: 15%; background-color: #f44336;">
                      <text class="mood-percentage">15%</text>
                    </view>
                  </view>
                  <view class="mood-legend">
                    <view class="legend-item">
                      <view class="legend-color" style="background-color: #4caf50;"></view>
                      <text class="legend-text">开心</text>
                    </view>
                    <view class="legend-item">
                      <view class="legend-color" style="background-color: #2196f3;"></view>
                      <text class="legend-text">平静</text>
                    </view>
                    <view class="legend-item">
                      <view class="legend-color" style="background-color: #f44336;"></view>
                      <text class="legend-text">低落</text>
                    </view>
                  </view>
                </view>
              </view>
              
              <view class="mood-quotes">
                <view class="quote-item">
                  <text class="quote-text">"生活不是等待风暴过去，而是学会在雨中跳舞。"</text>
                </view>
                <view class="quote-item">
                  <text class="quote-text">"每一个不曾起舞的日子，都是对生命的辜负。"</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 第四页：财务统计 -->
        <view class="book-page page-finance">
          <view class="page-header">
            <text class="page-title">财务统计</text>
          </view>
          <view class="page-content">
            <view class="finance-summary">
              <view class="finance-chart">
                <view class="chart-placeholder">
                  <text>收支比例</text>
                  <view class="pie-chart">
                    <view class="pie-segment" style="transform: rotate(0deg); border-color: #4caf50 transparent transparent transparent; transform: rotate(0deg);"></view>
                    <view class="pie-segment" style="transform: rotate(130deg); border-color: #f44336 transparent transparent transparent;"></view>
                  </view>
                  <view class="finance-legend">
                    <view class="legend-item">
                      <view class="legend-color" style="background-color: #4caf50;"></view>
                      <text class="legend-text">收入</text>
                    </view>
                    <view class="legend-item">
                      <view class="legend-color" style="background-color: #f44336;"></view>
                      <text class="legend-text">支出</text>
                    </view>
                  </view>
                </view>
              </view>
              
              <view class="finance-stats">
                <view class="stat-item">
                  <text class="stat-label">总收入</text>
                  <text class="stat-value income">¥{{ getTotalIncome() }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">总支出</text>
                  <text class="stat-value expense">¥{{ getTotalExpense() }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">结余</text>
                  <text class="stat-value">¥{{ getBalance() }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 最后一页：结语 -->
        <view class="book-page page-ending">
          <view class="page-content ending-content">
            <text class="ending-title">人生格子</text>
            <text class="ending-subtitle">记录生命的每一刻</text>
            <text class="ending-quote">"我们每个人都在书写自己的人生故事，每一个格子都是一段珍贵的回忆。"</text>
            <view class="qr-placeholder">
              <text>扫码下载人生格子App</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="share-actions" v-if="isBookOpen">
      <button class="action-btn" @click="saveImage">保存图片</button>
      <button class="action-btn" @click="closeBook">返回</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isBookOpen: false,
      userData: {
        name: '我',
        birthDate: '',
        schoolStartDate: '',
        educationLevel: '',
        workStartDate: '',
        retirementDate: '',
        lifeExpectancy: ''
      },
      keyEvents: []
    };
  },
  onLoad() {
    // 加载用户数据
    const userData = uni.getStorageSync('lifeGridUserData');
    if (userData) {
      this.userData = userData;
    }
    
    // 加载关键事件
    this.loadKeyEvents();
  },
  methods: {
    openBook() {
      this.isBookOpen = true;
    },
    
    closeBook() {
      this.isBookOpen = false;
      
      // 返回主页
      uni.navigateBack();
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    formatDateRange() {
      if (!this.userData.birthDate) return '';
      
      const birthYear = new Date(this.userData.birthDate).getFullYear();
      const lifeExpectancy = this.userData.lifeExpectancy || '80岁';
      const deathYear = birthYear + parseInt(lifeExpectancy);
      
      return `${birthYear} - ${deathYear}`;
    },
    
    getNameInitial() {
      return (this.userData.name || '我').charAt(0);
    },
    
    formatChildhoodPeriod() {
      if (!this.userData.birthDate || !this.userData.schoolStartDate) return '';
      
      const birthYear = new Date(this.userData.birthDate).getFullYear();
      const schoolStartYear = new Date(this.userData.schoolStartDate).getFullYear();
      
      return `${birthYear} - ${schoolStartYear}`;
    },
    
    formatEducationPeriod() {
      if (!this.userData.schoolStartDate || !this.userData.workStartDate) return '';
      
      const schoolStartYear = new Date(this.userData.schoolStartDate).getFullYear();
      const workStartYear = new Date(this.userData.workStartDate).getFullYear();
      
      return `${schoolStartYear} - ${workStartYear}`;
    },
    
    formatWorkPeriod() {
      if (!this.userData.workStartDate || !this.userData.retirementDate) return '';
      
      const workStartYear = new Date(this.userData.workStartDate).getFullYear();
      const retirementYear = new Date(this.userData.retirementDate).getFullYear();
      
      return `${workStartYear} - ${retirementYear}`;
    },
    
    formatRetirementPeriod() {
      if (!this.userData.retirementDate || !this.userData.lifeExpectancy) return '';
      
      const retirementYear = new Date(this.userData.retirementDate).getFullYear();
      const birthYear = new Date(this.userData.birthDate).getFullYear();
      const lifeExpectancy = this.userData.lifeExpectancy || '80岁';
      const deathYear = birthYear + parseInt(lifeExpectancy);
      
      return `${retirementYear} - ${deathYear}`;
    },
    
    getTotalYears() {
      if (!this.userData.birthDate || !this.userData.lifeExpectancy) return 0;
      
      const lifeExpectancy = this.userData.lifeExpectancy || '80岁';
      return parseInt(lifeExpectancy);
    },
    
    getPastYears() {
      if (!this.userData.birthDate) return 0;
      
      const birthYear = new Date(this.userData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      
      return currentYear - birthYear;
    },
    
    getFutureYears() {
      return this.getTotalYears() - this.getPastYears();
    },
    
    getCompletionPercentage() {
      const total = this.getTotalYears();
      if (total === 0) return 0;
      
      return Math.round((this.getPastYears() / total) * 100);
    },
    
    loadKeyEvents() {
      // 从存储中加载所有关键事件
      const keys = [];
      try {
        const res = uni.getStorageInfoSync();
        keys.push(...res.keys);
      } catch (e) {
        console.error(e);
      }
      
      // 过滤出与事件相关的键
      const eventKeys = keys.filter(key => 
        key.startsWith('detail_year_') || 
        key.startsWith('detail_month_') ||
        key.startsWith('detail_day_')
      );
      
      // 收集所有事件
      const allEvents = [];
      
      eventKeys.forEach(key => {
        const events = uni.getStorageSync(`${key}_events`) || [];
        
        if (events.length > 0) {
          // 解析年份
          let year = 0;
          
          if (key.startsWith('detail_year_')) {
            year = parseInt(key.replace('detail_year_', ''));
          } else if (key.startsWith('detail_month_')) {
            const parts = key.replace('detail_month_', '').split('_');
            year = parseInt(parts[0]);
          } else if (key.startsWith('detail_day_')) {
            const parts = key.replace('detail_day_', '').split('_');
            year = parseInt(parts[0]);
          }
          
          // 添加事件
          events.forEach(event => {
            if (event.title) {
              allEvents.push({
                year,
                title: event.title,
                description: event.description,
                completed: event.completed
              });
            }
          });
        }
      });
      
      // 按年份排序
      allEvents.sort((a, b) => a.year - b.year);
      
      // 只保留最重要的事件（最多10个）
      this.keyEvents = allEvents.slice(0, 10);
    },
    
    getStageClass(year) {
      if (!this.userData.birthDate) return '';
      
      const birthYear = new Date(this.userData.birthDate).getFullYear();
      const schoolStartYear = new Date(this.userData.schoolStartDate).getFullYear();
      const workStartYear = new Date(this.userData.workStartDate).getFullYear();
      const retirementYear = new Date(this.userData.retirementDate).getFullYear();
      
      if (year < schoolStartYear) {
        return 'childhood';
      } else if (year < workStartYear) {
        return 'education';
      } else if (year < retirementYear) {
        return 'work';
      } else {
        return 'retirement';
      }
    },
    
    getTotalIncome() {
      // 这里应该从实际数据中计算，这里使用模拟数据
      return '120,000.00';
    },
    
    getTotalExpense() {
      // 这里应该从实际数据中计算，这里使用模拟数据
      return '80,000.00';
    },
    
    getBalance() {
      // 这里应该从实际数据中计算，这里使用模拟数据
      return '40,000.00';
    },
    
    saveImage() {
      // 在真实环境中，这里应该使用canvas绘制分享图片
      uni.showToast({
        title: '图片已保存到相册',
        icon: 'success'
      });
    }
  }
};
</script>

<style>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 书本样式 */
.share-book {
  width: 300px;
  height: 400px;
  position: relative;
  perspective: 1500px;
}

.book-cover {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-origin: 0% 50%;
  background-color: #8e44ad;
  border-radius: 5px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 1.5s ease;
  z-index: 10;
}

.book-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.book-subtitle {
  font-size: 16px;
}

.book-pages {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-origin: 0% 50%;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  transition: transform 0.5s ease;
}

.share-book.open .book-cover {
  transform: rotateY(-180deg);
}

.book-page {
  min-width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 15px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #8e44ad;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}

.page-footer {
  margin-top: 15px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

/* 第一页：介绍 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #8e44ad;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.avatar-placeholder {
  font-size: 24px;
  color: white;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-birth {
  font-size: 14px;
  color: #666;
}

.life-stages {
  margin-bottom: 20px;
}

.stage-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-right: 10px;
}

.stage-dot.childhood {
  background-color: #9c27b0;
}

.stage-dot.education {
  background-color: #2196f3;
}

.stage-dot.work {
  background-color: #4caf50;
}

.stage-dot.retirement {
  background-color: #ff9800;
}

.stage-info {
  display: flex;
  flex-direction: column;
}

.stage-name {
  font-size: 14px;
  font-weight: bold;
}

.stage-period {
  font-size: 12px;
  color: #666;
}

.life-summary {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}

.summary-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.summary-grid {
  display: flex;
  flex-wrap: wrap;
}

.summary-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #8e44ad;
}

.summary-label {
  font-size: 12px;
  color: #666;
}

/* 第二页：关键事件 */
.timeline {
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
  padding-left: 20px;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ddd;
}

.timeline-dot {
  position: absolute;
  left: -26px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 6px;
}

.timeline-content {
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 10px;
}

.timeline-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  display: block;
}

.timeline-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.timeline-description {
  font-size: 12px;
  color: #666;
}

.no-events {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

/* 第三页：心情统计 */
.mood-chart {
  margin-bottom: 20px;
}

.chart-placeholder {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mood-distribution {
  display: flex;
  align-items: flex-end;
  height: 150px;
  width: 100%;
  margin: 20px 0;
  justify-content: center;
  gap: 20px;
}

.mood-bar {
  width: 40px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.mood-percentage {
  position: absolute;
  top: -20px;
  font-size: 12px;
  color: #333;
}

.mood-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

.mood-quotes {
  margin-top: 20px;
}

.quote-item {
  background-color: #f0f0f0;
  border-left: 3px solid #8e44ad;
  padding: 10px;
  margin-bottom: 10px;
}

.quote-text {
  font-style: italic;
  color: #555;
  font-size: 14px;
}

/* 第四页：财务统计 */
.finance-chart {
  margin-bottom: 20px;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  position: relative;
  margin: 20px auto;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 75px solid;
  border-radius: 50%;
}

.finance-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.finance-stats {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
}

.stat-value.income {
  color: #4caf50;
}

.stat-value.expense {
  color: #f44336;
}

/* 最后一页：结语 */
.ending-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.ending-title {
  font-size: 24px;
  font-weight: bold;
  color: #8e44ad;
  margin-bottom: 10px;
}

.ending-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.ending-quote {
  font-style: italic;
  color: #555;
  margin-bottom: 30px;
  padding: 0 20px;
}

.qr-placeholder {
  width: 120px;
  height: 120px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 10px;
}

/* 分享操作按钮 */
.share-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 20px;
  background-color: #8e44ad;
  color: white;
  border-radius: 5px;
  font-size: 14px;
}
</style>

