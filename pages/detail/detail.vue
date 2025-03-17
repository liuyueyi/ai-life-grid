<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <view class="header">
      <view class="back-btn" @click="goBack">返回</view>
      <view class="title">{{ getPageTitle() }}</view>
    </view>
    
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index" 
        :class="['tab', activeTab === tab.id ? 'active' : '']"
        @click="changeTab(tab.id)"
      >
        {{ tab.name }}
      </view>
    </view>
    
    <view class="content">
      <!-- 关键事项 -->
      <view v-if="activeTab === 'events'" class="events-tab">
        <view class="events-list">
          <view v-for="(event, index) in events" :key="index" class="event-item">
            <view class="event-header">
              <checkbox :checked="event.completed" @click="toggleEventComplete(index)" />
              <input type="text" v-model="event.title" placeholder="事项标题..." class="event-title" />
              <view class="event-actions">
                <view class="tag-btn" @click="showTagSelector(index)">标签</view>
                <view class="delete-btn" @click="deleteEvent(index)">删除</view>
              </view>
            </view>
            <textarea v-model="event.description" placeholder="添加详细描述..." class="event-description" />
            <view v-if="event.tags && event.tags.length > 0" class="event-tags">
              <view v-for="(tag, tagIndex) in event.tags" :key="tagIndex" class="event-tag">
                {{ tag }}
                <text class="remove-tag" @click="removeTag(index, tagIndex)">×</text>
              </view>
            </view>
          </view>
        </view>
        <button class="add-btn" @click="addNewEvent">添加新事项</button>
      </view>
      
      <!-- 心情日志 -->
      <view v-if="activeTab === 'mood'" class="mood-tab">
        <view class="mood-list">
          <view v-for="(log, index) in moodLogs" :key="index" class="mood-item">
            <view class="mood-header">
              <view class="mood-date">{{ formatDate(log.date) }}</view>
              <view class="mood-score">
                <text v-for="i in 5" :key="i" 
                  :class="['mood-star', i <= log.score ? 'active' : '']"
                  @click="updateMoodScore(index, i)"
                >★</text>
              </view>
              <view class="delete-btn" @click="deleteMoodLog(index)">删除</view>
            </view>
            <textarea v-model="log.content" placeholder="记录今天的心情..." class="mood-content" />
            <view class="mood-images" v-if="log.images && log.images.length > 0">
              <image v-for="(img, imgIndex) in log.images" :key="imgIndex" :src="img" class="mood-image" mode="aspectFill" />
              <view class="add-image" @click="addImageToLog(index)">+</view>
            </view>
            <view v-else class="add-image-btn" @click="addImageToLog(index)">添加图片</view>
            <view class="mood-voice" v-if="log.voiceUrl">
              <view class="voice-player" @click="playVoice(log.voiceUrl)">
                <view class="voice-icon">🎤</view>
                <view class="voice-duration">{{ log.voiceDuration || '0:00' }}</view>
              </view>
              <view class="delete-voice" @click="deleteVoice(index)">×</view>
            </view>
            <view v-else class="add-voice-btn" @click="recordVoice(index)">录制语音</view>
          </view>
        </view>
        <button class="add-btn" @click="addNewMoodLog">添加心情日志</button>
      </view>
      
      <!-- 收入支出台账 -->
      <view v-if="activeTab === 'finance'" class="finance-tab">
        <view class="finance-summary">
          <view class="summary-item">
            <text class="summary-label">总收入</text>
            <text class="summary-value income">¥{{ getTotalIncome() }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总支出</text>
            <text class="summary-value expense">¥{{ getTotalExpense() }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">结余</text>
            <text class="summary-value">¥{{ getBalance() }}</text>
          </view>
        </view>
        
        <view class="finance-chart">
          <!-- 这里可以使用图表组件，如 uCharts 或 F2 -->
          <view class="chart-placeholder">收支图表将在这里显示</view>
        </view>
        
        <view class="finance-list">
          <view v-for="(record, index) in financeRecords" :key="index" class="finance-item">
            <view class="finance-header">
              <view class="finance-date">{{ formatDate(record.date) }}</view>
              <view :class="['finance-type', record.type === 'income' ? 'income' : 'expense']">
                {{ record.type === 'income' ? '收入' : '支出' }}
              </view>
              <view class="delete-btn" @click="deleteFinanceRecord(index)">删除</view>
            </view>
            <view class="finance-details">
              <view class="finance-category">
                <text class="label">分类:</text>
                <picker :range="record.type === 'income' ? incomeCategories : expenseCategories" 
                        :value="getCategoryIndex(record)" 
                        @change="updateCategory(index, $event)">
                  <view class="picker-value">{{ record.category || '选择分类' }}</view>
                </picker>
              </view>
              <view class="finance-amount">
                <text class="label">金额:</text>
                <input type="digit" v-model="record.amount" placeholder="0.00" class="amount-input" />
              </view>
            </view>
            <textarea v-model="record.description" placeholder="添加备注..." class="finance-description" />
          </view>
        </view>
        <view class="finance-actions">
          <button class="add-income-btn" @click="addNewFinanceRecord('income')">添加收入</button>
          <button class="add-expense-btn" @click="addNewFinanceRecord('expense')">添加支出</button>
        </view>
      </view>
    </view>
    
    <!-- 标签选择器弹窗 -->
    <uni-popup ref="tagSelector" type="bottom">
      <view class="tag-selector">
        <view class="tag-selector-header">
          <text class="tag-selector-title">选择标签</text>
          <text class="tag-selector-close" @click="closeTagSelector">×</text>
        </view>
        <view class="tag-list">
          <view v-for="(tag, index) in availableTags" :key="index" 
                class="tag-item" 
                @click="selectTag(tag)">
            {{ tag }}
          </view>
          <view class="add-tag-item">
            <input type="text" v-model="newTag" placeholder="新建标签..." class="new-tag-input" />
            <button class="add-tag-btn" @click="addNewTag">添加</button>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 录音弹窗 -->
    <uni-popup ref="voiceRecorder" type="center">
      <view class="voice-recorder">
        <view class="recorder-header">
          <text class="recorder-title">录制语音</text>
          <text class="recorder-close" @click="cancelRecording">×</text>
        </view>
        <view class="recorder-content">
          <view class="recorder-timer">{{ recordingTime }}</view>
          <view :class="['recorder-btn', isRecording ? 'recording' : '']" @touchstart="startRecording" @touchend="stopRecording">
            {{ isRecording ? '松开结束' : '按住录音' }}
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      backgroundImage: '/static/images/default-bg.jpg',
      cellType: '',
      cellYear: 0,
      cellMonth: 0,
      cellDay: 1,
      cellWeek: 0,
      
      tabs: [
        { id: 'events', name: '关键事项' },
        { id: 'mood', name: '心情日志' },
        { id: 'finance', name: '收支台账' }
      ],
      activeTab: 'events',
      
      // 关键事项数据
      events: [],
      
      // 心情日志数据
      moodLogs: [],
      
      // 收支台账数据
      financeRecords: [],
      incomeCategories: ['工资', '奖金', '投资收益', '礼金', '其他收入'],
      expenseCategories: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他支出'],
      
      // 标签选择器
      availableTags: ['重要', '紧急', '待办', '已完成', '收藏'],
      newTag: '',
      currentEventIndex: -1,
      
      // 录音相关
      isRecording: false,
      recordingTime: '00:00',
      recordTimer: null,
      recorder: null,
      currentMoodLogIndex: -1
    };
  },
  onLoad(options) {
    // 获取全局主题和特效设置
    const app = getApp();
    this.themeMode = app.globalData.themeMode;
    this.particleEffect = app.globalData.particleEffect;
    
    // 获取页面参数
    this.cellType = options.type || 'day';
    this.cellYear = parseInt(options.year) || new Date().getFullYear();
    this.cellMonth = parseInt(options.month) || new Date().getMonth();
    this.cellDay = parseInt(options.day) || new Date().getDate();
    this.cellWeek = parseInt(options.week) || 0;
    
    // 加载数据
    this.loadData();
    
    // 加载自定义设置
    const settings = uni.getStorageSync('lifeGridSettings');
    if (settings) {
      this.backgroundImage = settings.backgroundImage || this.backgroundImage;
    }
  },
  methods: {
    goBack() {
      // 保存数据
      this.saveData();
      
      // 返回上一页
      uni.navigateBack();
    },
    
    getPageTitle() {
      const now = new Date();
      switch (this.cellType) {
        case 'year':
          return `${this.cellYear}年`;
        case 'month':
          return `${this.cellYear}年${this.cellMonth + 1}月`;
        case 'week':
          return `${this.cellYear}年第${this.getWeekNumber()}周`;
        case 'day':
          return `${this.cellYear}年${this.cellMonth + 1}月${this.cellDay}日`;
        default:
          return '';
      }
    },
    
    getWeekNumber() {
      const firstDay = new Date(this.cellYear, 0, 1);
      const targetDay = new Date(this.cellYear, this.cellMonth, this.cellDay);
      
      // 计算这是一年中的第几周
      const dayOfYear = Math.floor((targetDay - firstDay) / (24 * 60 * 60 * 1000));
      return Math.ceil((dayOfYear + firstDay.getDay() + 1) / 7);
    },
    
    changeTab(tabId) {
      // 切换前保存当前标签页数据
      this.saveData();
      
      this.activeTab = tabId;
    },
    
    // 数据加载和保存
    loadData() {
      // 根据格子类型和日期加载数据
      const storageKey = this.getStorageKey();
      
      // 加载关键事项
      const eventsKey = `${storageKey}_events`;
      this.events = uni.getStorageSync(eventsKey) || [];
      
      // 加载心情日志
      const moodKey = `${storageKey}_mood`;
      this.moodLogs = uni.getStorageSync(moodKey) || [];
      
      // 加载收支台账
      const financeKey = `${storageKey}_finance`;
      this.financeRecords = uni.getStorageSync(financeKey) || [];
    },
    
    saveData() {
      const storageKey = this.getStorageKey();
      
      // 保存关键事项
      const eventsKey = `${storageKey}_events`;
      uni.setStorageSync(eventsKey, this.events);
      
      // 保存心情日志
      const moodKey = `${storageKey}_mood`;
      uni.setStorageSync(moodKey, this.moodLogs);
      
      // 保存收支台账
      const financeKey = `${storageKey}_finance`;
      uni.setStorageSync(financeKey, this.financeRecords);
      
      // 更新主页格子的事件标记
      this.updateCellEventIndicator();
    },
    
    getStorageKey() {
      switch (this.cellType) {
        case 'year':
          return `detail_year_${this.cellYear}`;
        case 'month':
          return `detail_month_${this.cellYear}_${this.cellMonth}`;
        case 'week':
          return `detail_week_${this.cellYear}_${this.cellMonth}_${this.cellWeek}`;
        case 'day':
          return `detail_day_${this.cellYear}_${this.cellMonth}_${this.cellDay}`;
        default:
          return '';
      }
    },
    
    updateCellEventIndicator() {
      // 检查是否有任何数据
      const hasData = this.events.length > 0 || this.moodLogs.length > 0 || this.financeRecords.length > 0;
      
      // 获取对应的格子存储键
      let cellKey = '';
      switch (this.cellType) {
        case 'year':
          cellKey = `events_year_${this.cellYear}`;
          break;
        case 'month':
          cellKey = `events_month_${this.cellYear}_${this.cellMonth}`;
          break;
        case 'week':
          cellKey = `events_week_${this.cellYear}_${this.cellMonth}_${this.cellWeek}`;
          break;
        case 'day':
          cellKey = `events_day_${this.cellYear}_${this.cellMonth}_${this.cellDay}`;
          break;
      }
      
      // 更新格子事件标记
      if (cellKey) {
        const cellEvents = uni.getStorageSync(cellKey) || [];
        
        // 如果有数据但没有事件标记，添加一个空事件以显示标记
        if (hasData && cellEvents.length === 0) {
          uni.setStorageSync(cellKey, [{ content: '有详细记录' }]);
        } 
        // 如果没有数据但有事件标记，清除事件标记
        else if (!hasData && cellEvents.length > 0) {
          uni.setStorageSync(cellKey, []);
        }
      }
    },
    
    // 关键事项相关方法
    addNewEvent() {
      this.events.push({
        id: Date.now(),
        title: '',
        description: '',
        completed: false,
        tags: [],
        createdAt: new Date()
      });
    },
    
    toggleEventComplete(index) {
      if (index >= 0 && index < this.events.length) {
        this.events[index].completed = !this.events[index].completed;
      }
    },
    
    deleteEvent(index) {
      if (index >= 0 && index < this.events.length) {
        this.events.splice(index, 1);
      }
    },
    
    showTagSelector(index) {
      this.currentEventIndex = index;
      this.$refs.tagSelector.open();
    },
    
    closeTagSelector() {
      this.$refs.tagSelector.close();
      this.currentEventIndex = -1;
      this.newTag = '';
    },
    
    selectTag(tag) {
      if (this.currentEventIndex >= 0 && this.currentEventIndex < this.events.length) {
        const event = this.events[this.currentEventIndex];
        
        // 检查标签是否已存在
        if (!event.tags) {
          event.tags = [];
        }
        
        if (!event.tags.includes(tag)) {
          event.tags.push(tag);
        }
      }
    },
    
    removeTag(eventIndex, tagIndex) {
      if (eventIndex >= 0 && eventIndex < this.events.length) {
        const event = this.events[eventIndex];
        if (event.tags && tagIndex >= 0 && tagIndex < event.tags.length) {
          event.tags.splice(tagIndex, 1);
        }
      }
    },
    
    addNewTag() {
      if (this.newTag.trim() === '') return;
      
      // 添加到可用标签列表
      if (!this.availableTags.includes(this.newTag)) {
        this.availableTags.push(this.newTag);
        
        // 保存可用标签
        uni.setStorageSync('availableTags', this.availableTags);
      }
      
      // 添加到当前事项
      this.selectTag(this.newTag);
      
      // 清空输入
      this.newTag = '';
    },
    
    // 心情日志相关方法
    formatDate(date) {
      if (!date) return '';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    
    addNewMoodLog() {
      this.moodLogs.push({
        id: Date.now(),
        date: new Date(),
        score: 3,
        content: '',
        images: [],
        voiceUrl: '',
        voiceDuration: ''
      });
    },
    
    updateMoodScore(index, score) {
      if (index >= 0 && index < this.moodLogs.length) {
        this.moodLogs[index].score = score;
      }
    },
    
    deleteMoodLog(index) {
      if (index >= 0 && index < this.moodLogs.length) {
        this.moodLogs.splice(index, 1);
      }
    },
    
    addImageToLog(index) {
      if (index < 0 || index >= this.moodLogs.length) return;
      
      uni.chooseImage({
        count: 9,
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          
          // 确保images数组存在
          if (!this.moodLogs[index].images) {
            this.moodLogs[index].images = [];
          }
          
          // 添加图片
          this.moodLogs[index].images = [...this.moodLogs[index].images, ...tempFilePaths];
        }
      });
    },
    
    recordVoice(index) {
      this.currentMoodLogIndex = index;
      this.$refs.voiceRecorder.open();
    },
    
    startRecording() {
      // 初始化录音管理器
      this.recorder = uni.getRecorderManager();
      
      // 配置录音参数
      this.recorder.start({
        duration: 60000, // 最长录音时间，单位ms
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      });
      
      // 开始计时
      this.isRecording = true;
      let seconds = 0;
      this.recordTimer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.recordingTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }, 1000);
      
      // 监听录音结束事件
      this.recorder.onStop((res) => {
        if (this.currentMoodLogIndex >= 0 && this.currentMoodLogIndex < this.moodLogs.length) {
          this.moodLogs[this.currentMoodLogIndex].voiceUrl = res.tempFilePath;
          this.moodLogs[this.currentMoodLogIndex].voiceDuration = this.recordingTime;
        }
        
        // 关闭弹窗
        this.$refs.voiceRecorder.close();
        
        // 重置状态
        this.isRecording = false;
        clearInterval(this.recordTimer);
        this.recordingTime = '00:00';
      });
    },
    
    stopRecording() {
      if (this.recorder && this.isRecording) {
        this.recorder.stop();
      }
    },
    
    cancelRecording() {
      if (this.recorder && this.isRecording) {
        this.recorder.stop();
      }
      
      // 关闭弹窗
      this.$refs.voiceRecorder.close();
      
      // 重置状态
      this.isRecording = false;
      clearInterval(this.recordTimer);
      this.recordingTime = '00:00';
    },
    
    playVoice(voiceUrl) {
      if (!voiceUrl) return;
      
      const innerAudioContext = uni.createInnerAudioContext();
      innerAudioContext.src = voiceUrl;
      innerAudioContext.play();
    },
    
    deleteVoice(index) {
      if (index >= 0 && index < this.moodLogs.length) {
        this.moodLogs[index].voiceUrl = '';
        this.moodLogs[index].voiceDuration = '';
      }
    },
    
    // 收支台账相关方法
    getTotalIncome() {
      return this.financeRecords
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0)
        .toFixed(2);
    },
    
    getTotalExpense() {
      return this.financeRecords
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0)
        .toFixed(2);
    },
    
    getBalance() {
      return (parseFloat(this.getTotalIncome()) - parseFloat(this.getTotalExpense())).toFixed(2);
    },
    
    addNewFinanceRecord(type) {
      this.financeRecords.push({
        id: Date.now(),
        date: new Date(),
        type: type,
        category: type === 'income' ? this.incomeCategories[0] : this.expenseCategories[0],
        amount: '',
        description: ''
      });
    },
    
    deleteFinanceRecord(index) {
      if (index >= 0 && index < this.financeRecords.length) {
        this.financeRecords.splice(index, 1);
      }
    },
    
    getCategoryIndex(record) {
      const categories = record.type === 'income' ? this.incomeCategories : this.expenseCategories;
      return categories.indexOf(record.category);
    },
    
    updateCategory(index, event) {
      if (index >= 0 && index < this.financeRecords.length) {
        const record = this.financeRecords[index];
        const categories = record.type === 'income' ? this.incomeCategories : this.expenseCategories;
        record.category = categories[event.detail.value];
      }
    }
  }
};
</script>

<style>
.container {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  position: relative;
}

.back-btn {
  position: absolute;
  left: 15px;
  font-size: 16px;
  color: #8e44ad;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.tabs {
  display: flex;
  background-color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  color: #666;
}

.tab.active {
  color: #8e44ad;
  border-bottom: 2px solid #8e44ad;
}

.content {
  flex: 1;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
}

/* 关键事项样式 */
.events-list {
  margin-bottom: 15px;
}

.event-item {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.event-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.event-title {
  flex: 1;
  height: 40px;
  padding: 0 10px;
  margin: 0 10px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
}

.event-actions {
  display: flex;
  gap: 10px;
}

.tag-btn, .delete-btn {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
}

.tag-btn {
  background-color: #f0f0f0;
  color: #333;
}

.delete-btn {
  background-color: #ffebee;
  color: #e53935;
}

.event-description {
  width: 100%;
  height: 80px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  font-size: 14px;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.event-tag {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  background-color: #e1bee7;
  color: #8e44ad;
  border-radius: 10px;
  font-size: 12px;
}

.remove-tag {
  margin-left: 5px;
  font-size: 14px;
}

.add-btn {
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #8e44ad;
  color: white;
  border-radius: 8px;
  font-size: 16px;
}

/* 心情日志样式 */
.mood-item {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.mood-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.mood-date {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.mood-score {
  margin-right: 10px;
}

.mood-star {
  font-size: 18px;
  color: #ddd;
}

.mood-star.active {
  color: #ffc107;
}

.mood-content {
  width: 100%;
  height: 80px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  font-size: 14px;
}

.mood-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.mood-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
}

.add-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}

.add-image-btn, .add-voice-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 5px;
  margin-bottom: 10px;
}

.mood-voice {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.voice-player {
  flex: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 15px;
  background-color: #f0f0f0;
  border-radius: 20px;
}

.voice-icon {
  margin-right: 10px;
  font-size: 18px;
}

.delete-voice {
  margin-left: 10px;
  font-size: 18px;
  color: #e53935;
}

/* 收支台账样式 */
.finance-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.summary-value.income {
  color: #4caf50;
}

.summary-value.expense {
  color: #f44336;
}

.finance-chart {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chart-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 1px dashed #ddd;
  border-radius: 5px;
}

.finance-item {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.finance-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.finance-date {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.finance-type {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-right: 10px;
}

.finance-type.income {
  background-color: #e8f5e9;
  color: #4caf50;
}

.finance-type.expense {
  background-color: #ffebee;
  color: #f44336;
}

.finance-details {
  display: flex;
  margin-bottom: 10px;
}

.finance-category, .finance-amount {
  flex: 1;
  display: flex;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #666;
  margin-right: 5px;
}

.picker-value {
  flex: 1;
  height: 35px;
  line-height: 35px;
  padding: 0 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 14px;
}

.amount-input {
  flex: 1;
  height: 35px;
  padding: 0 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 14px;
}

.finance-description {
  width: 100%;
  height: 60px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  font-size: 14px;
}

.finance-actions {
  display: flex;
  gap: 10px;
}

.add-income-btn, .add-expense-btn {
  flex: 1;
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
  font-size: 16px;
}

.add-income-btn {
  background-color: #4caf50;
  color: white;
}

.add-expense-btn {
  background-color: #f44336;
  color: white;
}

/* 标签选择器样式 */
.tag-selector {
  background-color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  padding: 15px;
}

.tag-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tag-selector-title {
  font-size: 16px;
  font-weight: bold;
}

.tag-selector-close {
  font-size: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 8px 15px;
  background-color: #e1bee7;
  color: #8e44ad;
  border-radius: 15px;
  font-size: 14px;
}

.add-tag-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

.new-tag-input {
  flex: 1;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
}

.add-tag-btn {
  height: 40px;
  padding: 0 15px;
  background-color: #8e44ad;
  color: white;
  border-radius: 20px;
}

/* 录音弹窗样式 */
.voice-recorder {
  width: 300px;
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
}

.recorder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #8e44ad;
  color: white;
}

.recorder-title {
  font-size: 16px;
  font-weight: bold;
}

.recorder-close {
  font-size: 20px;
}

.recorder-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recorder-timer {
  font-size: 24px;
  margin-bottom: 20px;
}

.recorder-btn {
  width: 150px;
  height: 150px;
  border-radius: 75px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
}

.recorder-btn.recording {
  background-color: #e53935;
  color: white;
}
</style>

