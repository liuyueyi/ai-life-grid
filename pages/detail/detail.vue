<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <view class="header">
      <view class="back-btn" @click="goBack">返回</view>
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
        <event-manager :cell="cell" source="detail" @save="handleEventSave" @cancel="handleEventCancel" />
      </view>

      <!-- 心情日志 -->
      <view v-if="activeTab === 'mood'" class="mood-tab">
        <mood :storage-key="getStorageKey()" :cell="cell" />
      </view>

      <!-- 收入支出台账 -->
      <view v-if="activeTab === 'finance'" class="finance-tab">
        <finance :storage-key="getStorageKey()" @save="handleFinanceSave" :cell="cell" />
      </view>
    </view>


  </view>
</template>

<script>
import TaskUtils from '../../utils/TaskUtils.js';
import EventManager from '../../components/event-manager/event-manager.vue';
import Finance from '../../components/finance/finance.vue';
import Mood from '../../components/mood/mood.vue';

export default {
  components: {
    EventManager,
    Finance,
    Mood
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
  onShow() {
    console.log('重新显示了！');
  },
  onLoad(options) {
    // 获取全局主题和特效设置
    const app = getApp();
    this.themeMode = app.globalData.themeMode;
    this.particleEffect = app.globalData.particleEffect;

    if (options.tab) {
      if (options.tab == 'events') {
        this.activeTab = 'events';
      } else if (options.tab == 'mood') {
        this.activeTab = 'mood';
      } else if (options.tab == 'finance') {
        this.activeTab = 'finance';
      }
      this.$nextTick(() => {
        this.changeTab(options.tab);
      })
    }

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
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1
        });
      } else {
        // 如果没有上一页，则返回首页
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
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


    // 格式化日期方法 (用于标题显示)
    formatDate(date) {
      if (!date) return '';

      if (typeof date === 'string') {
        date = new Date(date);
      }

      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },

    handleFinanceSave(records) {
      // 处理Finance组件保存事件
      console.log('Finance records saved:', records);
    },
    
    handleMoodSave(logs) {
      // 处理Mood组件保存事件
      this.moodLogs = logs;
      this.saveData();
    }
  }
};
</script>

<style>
@import './detail.css';
</style>
