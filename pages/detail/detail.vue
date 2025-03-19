<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <view class="header">
      <view class="back-btn" @click="goBack">首页</view>
      <view class="title">{{ getPageTitle() }}</view>
    </view>

    <view class="tabs">
      <view v-for="(tab, index) in tabs" :key="index" :class="['tab', activeTab === tab.id ? 'active' : '']"
        @click="changeTab(tab.id)">
        {{ tab.name }}
      </view>
    </view>

    <view class="content">
      <!-- 关键事项 -->
      <view v-if="activeTab === 'events'" class="events-tab">
        <event-manager :cell="{ type: cellType, year: cellYear, month: cellMonth, day: cellDay }" source="detail"
          @save="handleEventSave" @cancel="handleEventCancel" />
      </view>

      <!-- 心情日志 -->
      <view v-if="activeTab === 'mood'" class="mood-tab">
        <!-- 下面这个是画板 -->
        <!-- <view class="huabi-content" style="width: 100%;">
          <sp-board :tools="boardTools" saveAction="toAlbum" @completed="paintingCompleted"
            width="80vw" height="80vh"></sp-board>
        </view> -->
        <view class="mood-list">
          <view v-for="(log, index) in moodLogs" :key="index" class="mood-item">
            <view class="mood-header">
              <view class="mood-date">{{ formatDate(log.date) }}</view>
              <view class="mood-score">
                <text v-for="i in 5" :key="i" :class="['mood-star', i <= log.score ? 'active' : '']"
                  @click="updateMoodScore(index, i)">★</text>
              </view>
              <view class="delete-btn" @click="deleteMoodLog(index)">删除</view>
            </view>
            <textarea v-model="log.content" placeholder="记录今天的心情..." class="mood-content" />
            <view class="mood-images" v-if="log.images && log.images.length > 0">
              <image v-for="(img, imgIndex) in log.images" :key="imgIndex" :src="img" class="mood-image"
                mode="aspectFill" />
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
        <finance :storage-key="getStorageKey()" @save="handleFinanceSave" />
      </view>
    </view>

    <!-- 录音弹窗 -->
    <custom-popup ref="voiceRecorder" type="center">
      <view class="voice-recorder">
        <view class="recorder-header">
          <text class="recorder-title">录制语音</text>
          <text class="recorder-close" @click="cancelRecording">×</text>
        </view>
        <view class="recorder-content">
          <view class="recorder-timer">{{ recordingTime }}</view>
          <view :class="['recorder-btn', isRecording ? 'recording' : '']" @touchstart="startRecording"
            @touchend="stopRecording">
            {{ isRecording ? '松开结束' : '按住录音' }}
          </view>
        </view>
      </view>
    </custom-popup>
  </view>
</template>

<script>
import TaskUtils from '../../utils/TaskUtils.js';
import EventManager from '../../components/event-manager/event-manager.vue';
import Finance from '../../components/finance/finance.vue';

export default {
  components: {
    EventManager
  },
  data() {
    return {
      backgroundImage: '/static/images/default-bg.jpg',
      cell: {},
      cellType: '',
      cellYear: 0,
      cellMonth: 0,
      cellDay: 1,

      boardTools: ["pen", "eraser", "color", "text", "back", "clear", "upload", "save"],

      tabs: [
        { id: 'events', name: '我的记录' },
        { id: 'mood', name: '心情日志' },
        { id: 'finance', name: '收支台账' }
      ],
      activeTab: 'events',

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
    if (options.date) {
      // 处理形如 2025、2025-4、2025-4-3 格式的日期参数
      const dateParts = options.date.split('-').map(Number);
      this.cellYear = dateParts[0];

      if (dateParts.length === 1) {
        // 只传入年份
        this.cellType = 'year';
        this.cellMonth = null;
        this.cellDay = null;
      } else if (dateParts.length === 2) {
        // 传入年月
        this.cellType = 'month';
        this.cellMonth = dateParts[1] - 1; // 月份需要减1，因为Date对象中月份是从0开始的
        this.cellDay = null;
      } else {
        // 传入年月日
        this.cellType = 'day';
        this.cellMonth = dateParts[1] - 1; // 月份需要减1，因为Date对象中月份是从0开始的
        this.cellDay = dateParts[2];
      }
    } else {
      // 处理原有的参数格式
      this.cellType = options.type || 'day';
      this.cellYear = parseInt(options.year) || new Date().getFullYear();
      this.cellMonth = parseInt(options.month) || new Date().getMonth();
      this.cellDay = parseInt(options.day) || new Date().getDate();
    }

    // 加载数据
    this.loadData();

    // 加载自定义设置
    const settings = uni.getStorageSync('lifeGridSettings');
    if (settings) {
      this.backgroundImage = settings.backgroundImage || this.backgroundImage;
    }
  },
  methods: {
    paintingCompleted(filePath) {
      console.log("filePath=" + filePath);
    },

    goBack() {
      // 保存数据
      this.saveData();

      // 返回上一页
      // 返回主页
      uni.reLaunch({
        url: '/pages/index/index',
      });
    },

    getPageTitle() {
      // 根据日期类型返回标题
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
      // 加载关键事项
      this.cell = {
        type: this.cellType,
        year: this.cellYear,
        month: this.cellMonth,
        day: this.cellDay
      };

      // 缓存key
      const storageKey = this.getStorageKey();

      // 加载心情日志
      const moodKey = `${storageKey}_mood`;
      this.moodLogs = uni.getStorageSync(moodKey) || [];

      // 加载收支台账
      const financeKey = `${storageKey}_finance`;
      this.financeRecords = uni.getStorageSync(financeKey) || [];
    },

    saveData() {
      const storageKey = this.getStorageKey();

      // 保存心情日志
      const moodKey = `${storageKey}_mood`;
      uni.setStorageSync(moodKey, this.moodLogs);

      // 保存收支台账
      const financeKey = `${storageKey}_finance`;
      uni.setStorageSync(financeKey, this.financeRecords);
    },

    getStorageKey() {
      return TaskUtils.generateStorageKey(this.cell);
    },

    // 事件管理器相关方法
    handleEventSave(events) {
      this.events = events;
      this.saveData();
    },

    handleEventCancel() {
      this.loadData();
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

    handleFinanceSave(records) {
      // 处理Finance组件保存事件
      console.log('Finance records saved:', records);
    }
  }
};
</script>

<style>
@import './detail.css';
</style>
