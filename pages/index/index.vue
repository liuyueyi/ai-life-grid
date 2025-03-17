<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }" :data-theme="themeMode">
    <!-- 粒子特效容器 -->
    <!-- <view v-if="particleEffect !== '无'" class="particle-container">
      <view v-for="i in 30" :key="i" 
            :class="['particle', `particle-${particleEffect.toLowerCase()}`]"
            :style="getRandomParticleStyle()">
      </view>
    </view> -->
    <view v-if="!initialized" class="setup-container">
      <view class="setup-title">人生格子</view>
      <view class="setup-form">
        <view class="form-item">
          <text class="label">出生日期</text>
          <picker mode="date" :value="birthDate" @change="onBirthDateChange">
            <view class="picker-value">{{ birthDate || '请选择出生日期' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">上学开始时间</text>
          <picker mode="date" fields="month" :value="schoolStartDate" @change="onSchoolStartChange">
            <view class="picker-value">{{ schoolStartDate || '请选择上学开始时间' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">学历范围</text>
          <picker :range="educationLevels" :value="educationLevelIndex" @change="onEducationLevelChange">
            <view class="picker-value">{{ educationLevels[educationLevelIndex] || '请选择学历范围' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">工作开始时间</text>
          <picker mode="date" fields="month" :value="workStartDate" @change="onWorkStartChange">
            <view class="picker-value">{{ workStartDate || '请选择工作开始时间' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">预计退休时间</text>
          <picker mode="date" fields="month" :value="retirementDate" @change="onRetirementChange">
            <view class="picker-value">{{ retirementDate || '请选择预计退休时间' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">预计寿命</text>
          <picker mode="selector" :range="lifeExpectancyOptions" :value="lifeExpectancyIndex"
            @change="onLifeExpectancyChange">
            <view class="picker-value">{{ lifeExpectancyOptions[lifeExpectancyIndex] || '请选择预计寿命' }}</view>
          </picker>
        </view>

        <button class="submit-btn" @click="initializeLifeGrid">开始我的人生格子</button>
      </view>
    </view>

    <view v-else class="life-grid-container">
      <view class="grid-controls">
        <view class="dimension-selector">
          <text v-for="(dim, index) in dimensions" :key="index"
            :class="['dimension-option', currentDimension === dim ? 'active' : '']" @click="changeDimension(dim)">
            {{ dimensionLabels[dim] }}
          </text>
        </view>

        <view class="view-controls">
          <!-- <text v-for="(view, index) in viewOptions" :key="index"
            :class="['view-option', currentView === view ? 'active' : '']" @click="changeView(view)">
            {{ viewLabels[view] }}
          </text> -->
          <text class="view-option" @click="openSettings">设置</text>
          <text class="view-option" @click="shareLifeGrid">分享</text>
        </view>
      </view>

      <view class="grid-header">
        <text class="nav-arrow" @click="navigatePrevious">◀</text>
        <text class="header-text" @click="toggleDimension">{{ currentDimension === 'day' ?
    `${currentYear}年${currentMonth + 1}月` : currentDimension === 'year' ? '我的人生格子' : currentYear + '年' }}</text>
        <text class="nav-arrow" @click="navigateNext">▶</text>
      </view>
      <scroll-view class="grid-scroll-view" :scroll-y="true" @scroll="onGridScroll" :show-scrollbar="false"
        :scroll-top="scrollPosition" :enhanced="true" :bounces="true">
        <view class="grid-wrapper">
          <view v-if="currentDimension === 'day'" class="weekday-header">
            <text v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday-label">{{ day }}</text>
          </view>
          <view :class="['grid-container', `${currentDimension}-view`]">
            <view v-for="(cell, index) in visibleCells" :key="index"
              :class="['grid-cell', getCellClasses(cell), currentDimension === 'day' ? 'calendar-cell' : '']"
              @click="openCellDetail(cell)">
              <view class="cell-content">
                <text class="cell-label" v-html="getCellLabel(cell)"></text>
                <text v-if="cell.hasEvents" class="cell-event-indicator">•</text>
                <view v-if="currentDimension === 'day' && cell.isCurrentMonth" class="expand-button"
                  @tap.stop="viewFullDetail">+</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- <view class="navigation-controls">
        <button class="nav-btn" @click="navigatePrevious">上一{{ getNavigationUnit() }}</button>
        <button class="nav-btn" @click="navigateToday">今天</button>
        <button class="nav-btn" @click="navigateNext">下一{{ getNavigationUnit() }}</button>
      </view>
       -->
      <!-- <view class="bottom-controls">
        <button class="settings-btn" @click="openSettings">设置</button>
        <button class="share-btn" @click="shareLifeGrid">分享</button>
      </view> -->
    </view>

    <!-- 格子详情弹窗 -->
    <custom-popup ref="cellDetailPopup" type="center">
      <view class="cell-detail-popup">
        <view class="popup-header">
          <text class="popup-title">{{ selectedCell ? showPopupTitle(selectedCell) : '' }}</text>
          <text class="popup-close" @click="closeCellDetail">×</text>
        </view>
        <view class="popup-content">
          <view class="key-events-section">
            <text class="section-title">关键事项</text>
            <view v-for="(event, index) in cellEvents" :key="index" class="event-item">
              <input type="text" v-model="cellEvents[index].content" placeholder="添加关键事项..."
                @input="onEventContentChange" />
              <text class="delete-event" @click="deleteEvent(index)">×</text>
            </view>
            <button class="add-event-btn" @click="addNewEvent">添加事项</button>
          </view>
          <view class="button-group">
            <button class="cancel-btn" @click="cancelChanges">取消</button>
            <button class="save-btn" @click="saveChanges">保存</button>
          </view>
          <button class="view-detail-btn" @click="viewFullDetail">查看详情</button>
        </view>
      </view>
    </custom-popup>
  </view>
</template>

<script>
import CustomPopup from '@/components/custom-popup/custom-popup.vue'

export default {
  components: {
    CustomPopup
  },
  data() {
    return {
      initialized: false,
      birthDate: '',
      schoolStartDate: '',
      educationLevels: ['小学', '初中', '高中', '职高', '大专', '大学', '硕士', '博士'],
      educationLevelIndex: 5, // 默认大学
      workStartDate: '',
      retirementDate: '',
      lifeExpectancyOptions: ['70岁', '75岁', '80岁', '85岁', '90岁', '95岁', '100岁'],
      lifeExpectancyIndex: 2, // 默认80岁

      // 生命格子相关
      dimensions: ['year', 'month', 'day'],
      dimensionLabels: {
        year: '年',
        month: '月',
        week: '周',
        day: '日'
      },
      currentDimension: 'day', // 默认显示日维度
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),

      viewOptions: ['current', 'all'],
      viewLabels: {
        current: '当前',
        all: '全部'
      },
      currentView: 'current',

      lifeGridData: [],
      visibleCells: [],
      currentViewRange: {
        start: null,
        end: null
      },

      scrollPosition: 0,

      // 选中的格子
      selectedCell: null,
      cellEvents: [],

      // 自定义设置
      backgroundImage: '/static/images/default-bg.jpg',
      backgroundMusic: '',
      particleEffect: '无',
      themeMode: 'light',
      initialized: false,

      tempEvents: [], // 用于存储临时修改的事件
    };
  },
  onLoad() {
    // 获取全局主题和特效设置
    const app = getApp();
    this.themeMode = app.globalData.themeMode;
    this.particleEffect = app.globalData.particleEffect;

    // 检查是否已经初始化
    const userData = uni.getStorageSync('lifeGridUserData');
    if (userData) {
      this.loadUserData(userData);
      this.initialized = true;
      this.generateLifeGrid();
      this.updateVisibleCells();
    }

    // 加载自定义设置
    const settings = uni.getStorageSync('lifeGridSettings');
    if (settings) {
      this.backgroundImage = settings.backgroundImage || this.backgroundImage;
      this.backgroundMusic = settings.backgroundMusic || '';
      this.particleEffect = settings.particleEffect || 'none';

      // 播放背景音乐
      if (this.backgroundMusic) {
        this.playBackgroundMusic();
      }

      // 初始化粒子效果
      this.initParticleEffect();
    }
  },
  methods: {
    getRandomParticleStyle() {
      const size = Math.floor(Math.random() * 20) + 10; // 10-30px
      const left = Math.floor(Math.random() * 100); // 0-100%
      const animationDuration = Math.floor(Math.random() * 10) + 5; // 5-15s
      const animationDelay = Math.random() * 5; // 0-5s

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${animationDelay}s`
      };
    },
    // 初始化表单相关方法
    onBirthDateChange(e) {
      this.birthDate = e.detail.value;
    },
    onSchoolStartChange(e) {
      this.schoolStartDate = e.detail.value;
    },
    onEducationLevelChange(e) {
      this.educationLevelIndex = e.detail.value;
    },
    onWorkStartChange(e) {
      this.workStartDate = e.detail.value;
    },
    onRetirementChange(e) {
      this.retirementDate = e.detail.value;
    },
    onLifeExpectancyChange(e) {
      this.lifeExpectancyIndex = e.detail.value;
    },

    initializeLifeGrid() {
      // 验证所有必填项
      if (!this.birthDate || !this.schoolStartDate || !this.workStartDate || !this.retirementDate) {
        uni.showToast({
          title: '请填写所有必要信息',
          icon: 'none'
        });
        return;
      }

      // 保存用户数据
      const userData = {
        birthDate: this.birthDate,
        schoolStartDate: this.schoolStartDate,
        educationLevel: this.educationLevels[this.educationLevelIndex],
        workStartDate: this.workStartDate,
        retirementDate: this.retirementDate,
        lifeExpectancy: this.lifeExpectancyOptions[this.lifeExpectancyIndex]
      };

      uni.setStorageSync('lifeGridUserData', userData);
      this.initialized = true;

      // 生成生命格子数据
      this.generateLifeGrid();
      this.updateVisibleCells();
    },

    loadUserData(userData) {
      this.birthDate = userData.birthDate;
      this.schoolStartDate = userData.schoolStartDate;
      this.educationLevelIndex = this.educationLevels.indexOf(userData.educationLevel);
      this.workStartDate = userData.workStartDate;
      this.retirementDate = userData.retirementDate;
      this.lifeExpectancyIndex = this.lifeExpectancyOptions.indexOf(userData.lifeExpectancy);
    },

    // 生命格子相关方法
    generateLifeGrid() {
      const birthYear = new Date(this.birthDate).getFullYear();
      const deathYear = birthYear + parseInt(this.lifeExpectancyOptions[this.lifeExpectancyIndex]);
      const schoolStartYear = new Date(this.schoolStartDate).getFullYear();
      const workStartYear = new Date(this.workStartDate).getFullYear();
      const retirementYear = new Date(this.retirementDate).getFullYear();

      this.lifeGridData = [];

      // 生成年维度的数据
      for (let year = birthYear; year <= deathYear; year++) {
        // 确定当前年份所属的生命阶段
        let stage = 'childhood';
        if (year >= schoolStartYear && year < workStartYear) {
          stage = 'education';
        } else if (year >= workStartYear && year < retirementYear) {
          stage = 'work';
        } else if (year >= retirementYear) {
          stage = 'retirement';
        }

        // 判断是否是过去、现在或未来
        const now = new Date();
        const currentYear = now.getFullYear();
        let timeStatus = 'future';
        if (year < currentYear) {
          timeStatus = 'past';
        } else if (year === currentYear) {
          timeStatus = 'present';
        }

        // 添加年格子
        this.lifeGridData.push({
          type: 'year',
          year,
          stage,
          timeStatus,
          hasEvents: false // 默认没有事件
        });

        // 生成月维度的数据
        for (let month = 0; month < 12; month++) {
          const monthDate = new Date(year, month, 1);
          let monthTimeStatus = 'future';

          if (monthDate < now) {
            monthTimeStatus = 'past';
          } else if (monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth()) {
            monthTimeStatus = 'present';
          }

          this.lifeGridData.push({
            type: 'month',
            year,
            month,
            stage,
            timeStatus: monthTimeStatus,
            hasEvents: false
          });

          // 生成周维度的数据
          const weeksInMonth = this.getWeeksInMonth(year, month);
          for (let week = 0; week < weeksInMonth; week++) {
            const weekStartDate = this.getWeekStartDate(year, month, week);
            let weekTimeStatus = 'future';

            if (weekStartDate < now) {
              weekTimeStatus = 'past';
            } else if (
              weekStartDate <= now &&
              new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000) > now
            ) {
              weekTimeStatus = 'present';
            }

            this.lifeGridData.push({
              type: 'week',
              year,
              month,
              week,
              stage,
              timeStatus: weekTimeStatus,
              hasEvents: false
            });
          }

          // 生成日维度的数据
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            let dayTimeStatus = 'future';

            if (dayDate < now && dayDate.getDate() !== now.getDate()) {
              dayTimeStatus = 'past';
            } else if (
              dayDate.getFullYear() === now.getFullYear() &&
              dayDate.getMonth() === now.getMonth() &&
              dayDate.getDate() === now.getDate()
            ) {
              dayTimeStatus = 'present';
            }

            this.lifeGridData.push({
              type: 'day',
              year,
              month,
              day,
              stage,
              timeStatus: dayTimeStatus,
              hasEvents: false
            });
          }
        }
      }

      // 加载保存的事件数据
      this.loadEvents();
    },

    getWeeksInMonth(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // 计算第一天是星期几 (0-6)
      const firstDayOfWeek = firstDay.getDay();

      // 计算这个月有多少天
      const daysInMonth = lastDay.getDate();

      // 计算这个月有多少周
      return Math.ceil((firstDayOfWeek + daysInMonth) / 7);
    },

    getWeekStartDate(year, month, weekIndex) {
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay();

      // 计算第一周的第一天
      const firstWeekStartDay = 1 - firstDayOfWeek;

      // 计算指定周的第一天
      const weekStartDay = firstWeekStartDay + (weekIndex * 7);

      return new Date(year, month, weekStartDay);
    },

    updateVisibleCells() {
      const now = new Date();

      // 根据当前维度和视图选项筛选可见格子
      switch (this.currentDimension) {
        case 'year':
          // 显示所有年份，并添加时期标记
          this.visibleCells = this.lifeGridData.filter(cell => cell.type === 'year');

          // 为每个时期的第一个格子添加标记
          const stages = [
            { name: '童年', start: this.birthDate },
            { name: '学习', start: this.schoolStartDate },
            { name: '工作', start: this.workStartDate },
            { name: '退休', start: this.retirementDate }
          ];

          stages.forEach(stage => {
            const firstCell = this.visibleCells.find(
              cell => cell.year === new Date(stage.start).getFullYear()
            );
            if (firstCell) {
              firstCell.stageMark = stage.name;
            }
          });
          break;

        case 'month':
          // 显示当前年的所有月份
          this.visibleCells = this.lifeGridData.filter(
            cell => cell.type === 'month' && cell.year === this.currentYear
          );
          break;

        case 'day':
          // 显示当前月的所有天，包括上个月和下个月的部分天数以填充日历网格
          const firstDay = new Date(this.currentYear, this.currentMonth, 1);
          const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
          const firstDayOfWeek = firstDay.getDay();
          const lastDayOfMonth = lastDay.getDate();

          // 获取上个月的天数
          const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

          // 生成日历网格数据
          this.visibleCells = [];

          // 添加上个月的天数
          for (let i = 0; i < firstDayOfWeek; i++) {
            const day = prevMonthLastDay - firstDayOfWeek + i + 1;
            const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
            const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;

            this.visibleCells.push({
              type: 'day',
              year: prevYear,
              month: prevMonth,
              day,
              stage: 'other-month',
              timeStatus: 'past'
            });
          }

          // 添加当前月的天数
          for (let day = 1; day <= lastDayOfMonth; day++) {
            const cellDate = new Date(this.currentYear, this.currentMonth, day);
            let timeStatus = 'future';

            if (cellDate < now && cellDate.getDate() !== now.getDate()) {
              timeStatus = 'past';
            } else if (
              cellDate.getFullYear() === now.getFullYear() &&
              cellDate.getMonth() === now.getMonth() &&
              cellDate.getDate() === now.getDate()
            ) {
              timeStatus = 'present';
            }

            this.visibleCells.push({
              type: 'day',
              year: this.currentYear,
              month: this.currentMonth,
              day,
              stage: this.getStageForDate(cellDate),
              timeStatus,
              hasEvents: false
            });
          }

          // 添加下个月的天数以填充网格
          const remainingDays = 42 - this.visibleCells.length; // 6行7列的网格
          for (let i = 1; i <= remainingDays; i++) {
            const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
            const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;

            this.visibleCells.push({
              type: 'day',
              year: nextYear,
              month: nextMonth,
              day: i,
              stage: 'other-month',
              timeStatus: 'future'
            });
          }
          break;
      }

      // 滚动到当前时间的格子
      this.$nextTick(() => {
        this.scrollToCurrentCell();
      });
    },

    getWeekOfYear(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    scrollToCurrentCell() {
      const now = new Date();
      const currentIndex = this.visibleCells.findIndex(cell => {
        if (cell.type === 'year' && cell.year === now.getFullYear()) {
          return true;
        } else if (
          cell.type === 'month' &&
          cell.year === now.getFullYear() &&
          cell.month === now.getMonth()
        ) {
          return true;
        } else if (
          cell.type === 'week' &&
          cell.timeStatus === 'present'
        ) {
          return true;
        } else if (
          cell.type === 'day' &&
          cell.year === now.getFullYear() &&
          cell.month === now.getMonth() &&
          cell.day === now.getDate()
        ) {
          return true;
        }
        return false;
      });

      if (currentIndex >= 0) {
        // 计算滚动位置，使当前格子居中
        const cellWidth = 100; // 假设每个格子宽度为100px
        const containerWidth = uni.getSystemInfoSync().windowWidth;
        this.scrollPosition = Math.max(0, (currentIndex * cellWidth) - (containerWidth / 2) + (cellWidth / 2));
      }
    },

    changeDimension(dimension) {
      this.currentDimension = dimension;
      this.updateVisibleCells();
    },

    changeView(view) {
      this.currentView = view;
      this.updateVisibleCells();
    },

    getCellClasses(cell) {
      const classes = [
        `time-${cell.timeStatus}`,
        `stage-${cell.stage}`
      ];

      if (cell.timeStatus === 'present') {
        classes.push('current');
      }

      if (cell.hasEvents) {
        classes.push('has-events');
      }

      return classes;
    },

    getStageForDate(date) {
      if (date < new Date(this.schoolStartDate)) {
        return 'childhood';
      } else if (date < new Date(this.workStartDate)) {
        return 'education';
      } else if (date < new Date(this.retirementDate)) {
        return 'work';
      } else {
        return 'retirement';
      }
    },
    showPopupTitle(cell) {
      return `${cell.year}年${cell.month + 1}月${cell.day}日`;
    },

    getCellLabel(cell) {
      let label = '';
      switch (cell.type) {
        case 'year':
          label = `${cell.year}年`;
          if (cell.stageMark) {
            // 根据不同阶段添加对应的年龄范围
            const stageRanges = {
              '童年': '(0-3岁)',
              '学习': '(3-18岁)',
              '工作': '(18-60岁)',
              '退休': '(60岁以后)'
            };
            const range = stageRanges[cell.stageMark] || '';
            return `<div class="stage-mark">${cell.stageMark}${range}</div>${label}`;
          }
          break;
        case 'month':
          label = `${cell.month + 1}月`;
          break;
        case 'day':
          label = `${cell.day}`;
          break;
        default:
          break;
      }
      return label;
    },

    getWeekNumber(year, month, weekIndex) {
      const firstDay = new Date(year, 0, 1);
      const weekStartDate = this.getWeekStartDate(year, month, weekIndex);

      // 计算这是一年中的第几周
      const dayOfYear = Math.floor((weekStartDate - firstDay) / (24 * 60 * 60 * 1000));
      return Math.ceil((dayOfYear + firstDay.getDay() + 1) / 7);
    },

    getNavigationUnit() {
      switch (this.currentDimension) {
        case 'year':
          return '年';
        case 'month':
          return '月';
        case 'week':
          return '周';
        case 'day':
          return '天';
        default:
          return '';
      }
    },

    toggleDimension() {
      if (this.currentDimension === 'day') {
        this.currentDimension = 'month';
      } else if (this.currentDimension === 'month') {
        this.currentDimension = 'year';
      }
      this.updateVisibleCells();
    },

    navigatePrevious() {
      const now = new Date();

      switch (this.currentDimension) {
        case 'year':
          // 前移一年
          this.currentYear--;
          break;
        case 'month':
          if (this.currentMonth === 0) {
            this.currentYear--;
            this.currentMonth = 11;
          } else {
            this.currentMonth--;
          }
          break;
        case 'day':
          if (this.currentMonth === 0) {
            this.currentYear--;
            this.currentMonth = 11;
          } else {
            this.currentMonth--;
          }
          break;
      }
      this.updateVisibleCells();
    },

    navigateNext() {
      const now = new Date();

      switch (this.currentDimension) {
        case 'year':
          // 后移一年
          this.currentYear++;
          break;
        case 'month':
          if (this.currentMonth === 11) {
            this.currentYear++;
            this.currentMonth = 0;
          } else {
            this.currentMonth++;
          }
          break;
        case 'day':
          if (this.currentMonth === 11) {
            this.currentYear++;
            this.currentMonth = 0;
          } else {
            this.currentMonth++;
          }
          break;
      }
      this.updateVisibleCells();
    },

    navigateToday() {
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      this.updateVisibleCells();
    },
    updateVisibleCellsWithRange(range) {
      const now = new Date();

      switch (this.currentDimension) {
        case 'year':
          if (range.start && range.end) {
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'year' && cell.year >= range.start && cell.year <= range.end
            );
          }
          break;
        case 'month':
          if (range.year) {
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'month' && cell.year === range.year
            );
          }
          break;
        case 'week':
          if (range.year !== undefined && range.month !== undefined) {
            const prevMonth = range.month === 0 ? 11 : range.month - 1;
            const prevYear = range.month === 0 ? range.year - 1 : range.year;
            const nextMonth = range.month === 11 ? 0 : range.month + 1;
            const nextYear = range.month === 11 ? range.year + 1 : range.year;

            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'week' && (
                (cell.year === prevYear && cell.month === prevMonth) ||
                (cell.year === range.year && cell.month === range.month) ||
                (cell.year === nextYear && cell.month === nextMonth)
              )
            );
          }
          break;
        case 'day':
          if (range.year !== undefined && range.month !== undefined) {
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'day' && cell.year === range.year && cell.month === range.month
            );
          }
          break;
      }

      // 重置滚动位置
      this.scrollPosition = 0;
    },

    onGridScroll(e) {
      // 可以在这里处理滚动事件
    },

    // 格子详情相关方法
    openCellDetail(cell) {
      if (cell.type === 'year') {
        // 年视图点击进入对应月视图
        this.currentDimension = 'month';
        this.currentYear = cell.year;
        this.updateVisibleCells();
      } else if (cell.type === 'month') {
        // 月视图点击进入对应日视图
        this.currentDimension = 'day';
        this.currentYear = cell.year;
        this.currentMonth = cell.month;
        this.updateVisibleCells();
      } else if (cell.type === 'day') {
        // 日视图点击打开详情弹窗
        this.selectedCell = cell;
        this.loadCellEvents(cell);
        if (this.$refs.cellDetailPopup) {
          this.$refs.cellDetailPopup.open();
        }
      }
    },

    closeCellDetail() {
      // 关闭弹窗
      if (this.$refs.cellDetailPopup) {
        this.$refs.cellDetailPopup.close();
        this.selectedCell = null;
        this.cellEvents = [];
      }
    },

    loadCellEvents(cell) {
      const key = this.getCellStorageKey(cell);
      const events = uni.getStorageSync(key) || [];
      // 为每个事件添加编辑状态标记
      this.cellEvents = events.map(event => ({
        ...event,
        isEditing: false,
        isNew: false
      }));
      // 保存一份临时副本
      this.tempEvents = JSON.parse(JSON.stringify(this.cellEvents));
    },
    enableEventEditing(index) {
      console.log('设置为编辑状态', index);
      // 移除 isNew 的判断，让所有事项都可以编辑
      this.cellEvents[index].isEditing = true;
      // 强制更新视图
      this.$forceUpdate();
    },
    addNewEvent() {
      this.cellEvents.push({
        id: Date.now(),
        content: '', // 空内容
        tags: [],
        isEditing: true, // 新事项默认可编辑
        isNew: true
      });
    },

    cancelChanges() {
      // 恢复到原始状态
      this.cellEvents = JSON.parse(JSON.stringify(this.tempEvents));
      this.closeCellDetail();
    },
    saveChanges() {
      if (!this.selectedCell) return;

      // 过滤掉空事件并移除临时状态标记
      const validEvents = this.cellEvents
        .filter(event => event.content.trim() !== '')
        .map(({ isEditing, isNew, ...event }) => event);

      // 保存到本地存储
      const key = this.getCellStorageKey(this.selectedCell);
      uni.setStorageSync(key, validEvents);

      // 更新格子的事件标记
      this.updateCellEventIndicator(this.selectedCell, validEvents.length > 0);

      // 关闭弹窗
      this.closeCellDetail();
    },


    saveCellEvents() {
      if (!this.selectedCell) return;

      // 过滤掉空事件
      const validEvents = this.cellEvents.filter(event => event.content.trim() !== '');

      // 保存到本地存储
      const key = this.getCellStorageKey(this.selectedCell);
      uni.setStorageSync(key, validEvents);

      // 更新格子的事件标记
      this.updateCellEventIndicator(this.selectedCell, validEvents.length > 0);
    },

    getCellStorageKey(cell) {
      switch (cell.type) {
        case 'year':
          return `events_year_${cell.year}`;
        case 'month':
          return `events_month_${cell.year}_${cell.month}`;
        case 'week':
          return `events_week_${cell.year}_${cell.month}_${cell.week}`;
        case 'day':
          return `events_day_${cell.year}_${cell.month}_${cell.day}`;
        default:
          return '';
      }
    },

    updateCellEventIndicator(cell, hasEvents) {
      // 更新内存中的数据
      const index = this.lifeGridData.findIndex(item => {
        if (item.type !== cell.type) return false;

        switch (item.type) {
          case 'year':
            return item.year === cell.year;
          case 'month':
            return item.year === cell.year && item.month === cell.month;
          case 'week':
            return item.year === cell.year && item.month === cell.month && item.week === cell.week;
          case 'day':
            return item.year === cell.year && item.month === cell.month && item.day === cell.day;
          default:
            return false;
        }
      });

      if (index !== -1) {
        this.lifeGridData[index].hasEvents = hasEvents;

        // 更新可见格子
        const visibleIndex = this.visibleCells.findIndex(item => {
          if (item.type !== cell.type) return false;

          switch (item.type) {
            case 'year':
              return item.year === cell.year;
            case 'month':
              return item.year === cell.year && item.month === cell.month;
            case 'week':
              return item.year === cell.year && item.month === cell.month && item.week === cell.week;
            case 'day':
              return item.year === cell.year && item.month === cell.month && item.day === cell.day;
            default:
              return false;
          }
        });

        if (visibleIndex !== -1) {
          this.visibleCells[visibleIndex].hasEvents = hasEvents;
        }
      }
    },
    handleEventClick(index, event) {
      console.log('点击了事件', index, event);
      // 如果有内容，则进入编辑状态
      if (event.content) {
        this.enableEventEditing(index);
      }
    },
    deleteEvent(index) {
      this.cellEvents.splice(index, 1);
      // 删除事项后自动保存
      this.saveCellEvents();
    },

    // 监听事项内容变化
    onEventContentChange() {
      // 自动保存事项
      // this.saveCellEvents();
    },

    viewFullDetail() {
      if (!this.selectedCell) return;

      // 保存当前事件
      this.saveCellEvents();

      // 关闭弹窗
      this.$refs.cellDetailPopup.close();

      // 跳转到详情页
      uni.navigateTo({
        url: `/pages/detail/detail?type=${this.selectedCell.type}&year=${this.selectedCell.year}&month=${this.selectedCell.month || 0}&day=${this.selectedCell.day || 1}&week=${this.selectedCell.week || 0}`
      });
    },

    // 设置和分享相关方法
    openSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
      });
    },

    shareLifeGrid() {
      uni.navigateTo({
        url: '/pages/share/share'
      });
    },

    // 加载事件数据
    loadEvents() {
      // 遍历所有格子，检查是否有事件
      this.lifeGridData.forEach(cell => {
        const key = this.getCellStorageKey(cell);
        const events = uni.getStorageSync(key) || [];
        cell.hasEvents = events.length > 0;
      });
    },

    // 背景音乐和粒子效果
    playBackgroundMusic() {
      if (!this.backgroundMusic) return;

      const bgm = uni.createInnerAudioContext();
      bgm.autoplay = true;
      bgm.loop = true;
      bgm.src = this.backgroundMusic;

      // 保存到全局，以便其他页面可以控制
      getApp().globalData.bgm = bgm;
    },

    initParticleEffect() {
      // 粒子效果将在组件中实现
    }
  }
};
</script>

<style>
@import './index.css';


/* 修改时期标签样式 */
.stage-mark {
  position: absolute;
  top: 0;
  /* 改为固定的上边距 */
  left: 0;
  /* 从左边开始 */
  right: 0;
  /* 延伸到右边 */
  margin: 0 auto;
  /* 水平居中 */
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-size: 10px;
  /* 使用固定的字体大小 */
  padding: 2px 0;
  /* 只保留垂直方向的内边距 */
  text-align: center;
  border-radius: 10px 10px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  /* 设置宽度为格子的90% */
  transform: none;
  /* 移除之前的transform */
}
</style>
