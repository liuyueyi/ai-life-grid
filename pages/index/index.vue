<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }" :data-theme="themeMode">
    <view v-if="!initialized">
      <init-form @initialize="handleInitialize"></init-form>
    </view>

    <view v-else class="life-grid-container">
      <view class="grid-controls">
        <view class="dimension-selector">
          <text v-for="(dim, index) in dimensions" :key="index"
            :class="['dimension-option', currentDimension === dim && !showDayCard ? 'active' : '']"
            @click="changeDimension(dim)">
            {{ dimensionLabels[dim] }}
          </text>
          <text :class="['dimension-option', showDayCard ? 'active' : '']" @click="doShowDayCard()">台历</text>
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

      <CalendarCard :year="this.selectedCell.year" :month="this.selectedCell.month" :day="this.selectedCell.day"
        @date-change="handleDateChange" v-if="showDayCard">
      </CalendarCard>
      <view v-else>
        <view class="grid-header">
          <text class="nav-arrow" @click="navigatePrevious" v-if="this.currentDimension != 'year'">◀</text>
          <text v-else></text>
          <text class="header-text" @click="toggleDimension">{{ currentDimension === 'day' ?
    `${currentYear}年${currentMonth + 1}月` : currentDimension === 'year' ? '我的人生格子' : currentYear + '年' }}</text>
          <text class="nav-arrow" @click="navigateNext" v-if="this.currentDimension != 'year'">▶</text>
          <text v-else></text>
        </view>
        <scroll-view class="grid-scroll-view" :scroll-y="true" @scroll="onGridScroll" :show-scrollbar="false"
          :scroll-top="scrollPosition" :enhanced="true" :bounces="true">
          <view class="grid-wrapper">
            <view v-if="currentDimension === 'day'" class="weekday-header">
              <text v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday-label">{{ day }}</text>
            </view>
            <view :class="['grid-container', `${currentDimension}-view`]">
              <view v-for="(cell, index) in visibleCells" :key="index"
                :class="['grid-cell', getCellClasses(cell), currentDimension === 'day' ? 'calendar-cell' : '', cell === selectedCell ? 'selected-cell' : '']"
                @click="handleCellClick(cell)">
                <view class="cell-content">
                  <text class="cell-label" v-html="getCellLabel(cell)">
                  </text>
                  <text v-if="cell.hasEvents" class="cell-event-indicator">•</text>
                  <view v-if="currentDimension === 'day' && cell.isCurrentMonth" class="expand-button"
                    @tap.stop="viewFullDetail">+</view>
                  <view class="fullscreen-icon" @tap.stop="handleFullscreenClick(cell)"
                    style="position: absolute; top: 2rpx; right: 12%;">
                    <text>⛶</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 浮动按钮 -->
        <view class="floating-today-btn" @click="navigateToToday()">
          <text>今</text>
        </view>
        <view class="floating-add-btn" @click="openCellDetail()" v-if="this.selectedCell">
          <text>+</text>
        </view>
      </view>
    </view>


    <!-- 格子详情弹窗 -->
    <custom-popup ref="cellDetailPopup" type="center" height="68vh">
      <view class="cell-detail-popup">
        <view class="popup-header">
          <text class="popup-title">{{ selectedCell ? showPopupTitle(selectedCell) : '' }}</text>
          <text class="popup-close" @click="closeCellDetail">×</text>
        </view>
        <view class="popup-content">
          <event-manager :visible="true" :cell="selectedCell" source="index" @save="saveChanges"
            @cancel="cancelChanges" />
        </view>
      </view>
    </custom-popup>
  </view>
</template>

<script>
import CustomPopup from '@/components/custom-popup/custom-popup.vue'
import InitForm from '@/components/init-form/init-form.vue'
import CalendarCard from '@/components/calendar-card/calendar-card.vue'
import EventManager from '@/components/event-manager/event-manager.vue'
import TaskUtils from '../../utils/TaskUtils.js';


export default {
  components: {
    CustomPopup,
    InitForm,
    EventManager,
    CalendarCard
  },
  data() {
    return {
      selectedCell: null,
      initialized: false,
      birthDate: '',
      schoolStartDate: '',
      educationLevel: '',
      workStartDate: '',
      retirementDate: '',
      lifeExpectancy: '',

      // 默认显示台历模式
      showDayCard: true,
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

      // 初始化 selectedCell 为当天对应的格子
      const now = new Date();
      const currentCell = this.lifeGridData.find(cell => {
        if (this.currentDimension === 'day') {
          return cell.type === 'day' &&
            cell.year === now.getFullYear() &&
            cell.month === now.getMonth() &&
            cell.day === now.getDate();
        } else if (this.currentDimension === 'month') {
          return cell.type === 'month' &&
            cell.year === now.getFullYear() &&
            cell.month === now.getMonth();
        } else {
          return cell.type === 'year' &&
            cell.year === now.getFullYear();
        }
      });

      if (!this.selectedCell) {
        this.handleCellClick(currentCell)
      }
    }
  },
  methods: {
    handleDateChange(newDate) {
      // 更新selectedCell的日期
      this.selectedCell = {
        ...this.selectedCell,
        year: newDate.year,
        month: newDate.month,
        day: newDate.day
      };
    },
    handleCellClick(cell) {
      if (this.selectedCell === cell) {
        // 双击了格子，准备进入详情页吧
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
          // 日视图点击之后进入详情页
          this.handleFullscreenClick(cell);
        }
      } else {
        // 切换选中的格子
        this.selectedCell = cell;
      }
    },
    // 处理初始化表单提交
    handleInitialize(userData) {
      // 保存用户数据
      this.birthDate = userData.birthDate;
      this.schoolStartDate = userData.schoolStartDate;
      this.educationLevel = userData.educationLevel;
      this.workStartDate = userData.workStartDate;
      this.retirementDate = userData.retirementDate;
      this.lifeExpectancy = userData.lifeExpectancy;

      uni.setStorageSync('lifeGridUserData', userData);
      this.initialized = true;

      // 生成生命格子数据
      this.generateLifeGrid();
      this.updateVisibleCells();
    },

    loadUserData(userData) {
      this.birthDate = userData.birthDate;
      this.schoolStartDate = userData.schoolStartDate;
      this.educationLevel = userData.educationLevel;
      this.workStartDate = userData.workStartDate;
      this.retirementDate = userData.retirementDate;
      this.lifeExpectancy = userData.lifeExpectancy;
    },

    showCalendarCards() {
      if (!this.selectedCell) {
        // 默认选中今天对应的格子

      }
    },

    // 生命格子相关方法
    generateLifeGrid() {
      const birthYear = new Date(this.birthDate).getFullYear();
      const deathYear = birthYear + parseInt(this.lifeExpectancy);
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

          // 更新可见格子的事件指示器
          this.visibleCells.forEach(cell => {
            cell.hasEvents = TaskUtils.hasEvents(cell)
          });

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

          // 更新可见格子的事件指示器
          this.visibleCells.forEach(cell => {
            cell.hasEvents = TaskUtils.hasEvents(cell)
          });
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

            const cell = {
              type: 'day',
              year: this.currentYear,
              month: this.currentMonth,
              day,
              stage: this.getStageForDate(cellDate),
              timeStatus,
              hasEvents: false
            };

            if (timeStatus === 'present' && !this.selectedCell) {
              // 如果当前格子是今天，将其作为选中的格子
              this.selectedCell = cell;
            }

            // 获取并更新事件指示器
            cell.hasEvents = TaskUtils.hasEvents(cell)

            this.visibleCells.push(cell);
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
      console.log('点击了' + dimension + '按钮')
      this.currentDimension = dimension;
      this.updateVisibleCells();
      // 不显示台历
      this.showDayCard = false;
    },
    doShowDayCard() {
      // 显示台历
      if (this.selectedCell == null) {
        this.selectedCell = {
          type: 'day',
          year: this.currentYear,
          month: this.currentMonth,
          day: this.currentDay
        };
      }
      this.showDayCard = true;
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
      switch (this.currentDimension) {
        case 'year':
          return `${cell.year}年`;
        case 'month':
          return `${cell.year}年${cell.month + 1}月`;
        case 'day':
          return `${cell.year}年${cell.month + 1}月${cell.day}日`;
      }
    },

    getCellLabel(cell) {
      let label = '';
      switch (cell.type) {
        case 'year':
          const birthYear = new Date(this.birthDate).getFullYear();
          const age = cell.year - birthYear;
          const ageStyle = `position: absolute; font-style: italic; color: rgba(128, 128, 128, 0.2); font-size: 1.8em; z-index: 1; top: 50%; left: 50%; transform: translate(-50%, -50%);`;
          const yearStyle = `position: relative; z-index: 2;font-size:1.1rem`;
          label = `<span style="${ageStyle}">${age}岁</span><span style="${yearStyle}">${cell.year}</span>`;
          if (cell.stageMark) {
            // 根据不同阶段添加对应的年龄范围
            const birthYear = new Date(this.birthDate).getFullYear();
            const schoolStartYear = new Date(this.schoolStartDate).getFullYear();
            const workStartYear = new Date(this.workStartDate).getFullYear();
            const retirementYear = new Date(this.retirementDate).getFullYear();

            const stageRanges = {
              '童年': `(0-${schoolStartYear - birthYear}岁)`,
              '学习': `(${schoolStartYear - birthYear}-${workStartYear - birthYear}岁)`,
              '工作': `(${workStartYear - birthYear}-${retirementYear - birthYear}岁)`,
              '退休': `(${retirementYear - birthYear}岁以后)`
            };
            const range = stageRanges[cell.stageMark] || '';
            return `<div style="position: absolute;
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
                    transform: none;">${cell.stageMark}${range}</div>${label}`;
          }
          break;
        case 'month':
          const birthDate = new Date(this.birthDate);
          const cellDate = new Date(cell.year, cell.month);
          const ageYears = cellDate.getFullYear() - birthDate.getFullYear();
          const ageMonths = cellDate.getMonth() - birthDate.getMonth();
          const totalMonths = ageYears * 12 + ageMonths;
          const monthAgeStyle = `position: absolute; font-style: italic; color: rgba(128, 128, 128, 0.2); font-size: 1.5rem; z-index: 1; top: 50%; left: 50%; transform: translate(-50%, -80%);`;
          const monthNumberStyle = `position: relative; z-index: 2;font-size:2rem`;
          label = `<span style="${monthAgeStyle}">${Math.floor(totalMonths / 12)}岁${totalMonths % 12}月</span><span style="${monthNumberStyle}">${cell.month + 1}月</span>`;
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

    navigateToToday() {
      // 切换到日视图
      this.currentDimension = 'day';

      // 设置为当前年月
      const now = new Date();
      this.selectedCell = null;
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();

      // 更新视图并滚动到当前日期
      this.updateVisibleCells();
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
      switch (this.currentDimension) {
        case 'year':
          break;
        case 'month':
          // 前移一年
          this.currentYear--;
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
      switch (this.currentDimension) {
        case 'year':
          // 年视图，不支持左右切换
          break;
        case 'month':
          // 后移一年
          this.currentYear++;
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
    openCellDetail() {
      if (!this.selectedCell) {
        // 没有选中的cell
        console.log('请选择一个cell');
        return;
      }
      if (this.$refs.cellDetailPopup) {
        this.$refs.cellDetailPopup.open();
      }
    },

    closeCellDetail() {
      // 关闭弹窗
      if (this.$refs.cellDetailPopup) {
        this.$refs.cellDetailPopup.close();
      }
    },
    cancelChanges() {
      // 恢复到原始状态
      this.cellEvents = JSON.parse(JSON.stringify(this.tempEvents));
      this.closeCellDetail();
    },
    saveChanges() {
      if (!this.selectedCell) return;
      // 更新格子的事件标记
      this.updateCellEventIndicator(this.selectedCell, TaskUtils.hasEvents(this.selectedCell));

      // 关闭弹窗
      // this.closeCellDetail();
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

    handleFullscreenClick(cell) {
      if (this.currentDimension === 'day') {
        uni.navigateTo({
          url: '/pages/detail/detail?date=' + cell.year + '-' + (cell.month + 1) + '-' + cell.day
        });
        return;
      } else if (this.currentDimension === 'month') {
        uni.navigateTo({
          url: '/pages/detail/detail?date=' + cell.year + '-' + (cell.month + 1)
        });
      } else if (this.currentDimension === 'year') {
        uni.navigateTo({
          url: '/pages/detail/detail?date=' + cell.year
        });
      }
    },

    viewFullDetail() {
      if (!this.selectedCell) return;

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
  }
};
</script>

<style>
@import './index.css';
</style>
