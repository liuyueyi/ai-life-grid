<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
          <picker mode="selector" :range="lifeExpectancyOptions" :value="lifeExpectancyIndex" @change="onLifeExpectancyChange">
            <view class="picker-value">{{ lifeExpectancyOptions[lifeExpectancyIndex] || '请选择预计寿命' }}</view>
          </picker>
        </view>
        
        <button class="submit-btn" @click="initializeLifeGrid">开始我的人生格子</button>
      </view>
    </view>
    
    <view v-else class="life-grid-container">
      <view class="grid-controls">
        <view class="dimension-selector">
          <text 
            v-for="(dim, index) in dimensions" 
            :key="index" 
            :class="['dimension-option', currentDimension === dim ? 'active' : '']"
            @click="changeDimension(dim)"
          >
            {{ dimensionLabels[dim] }}
          </text>
        </view>
        
        <view class="view-controls">
          <text 
            v-for="(view, index) in viewOptions" 
            :key="index" 
            :class="['view-option', currentView === view ? 'active' : '']"
            @click="changeView(view)"
          >
            {{ viewLabels[view] }}
          </text>
        </view>
      </view>
      
      <scroll-view 
        class="grid-scroll-view" 
        :scroll-x="true" 
        @scroll="onGridScroll"
        :show-scrollbar="false"
        :scroll-left="scrollPosition"
        :enhanced="true"
        :bounces="true"
      >
        <view class="grid-wrapper">
          <view 
            v-for="(cell, index) in visibleCells" 
            :key="index" 
            :class="['grid-cell', getCellClasses(cell)]"
            @click="openCellDetail(cell)"
          >
            <view class="cell-content">
              <text class="cell-label">{{ getCellLabel(cell) }}</text>
              <text v-if="cell.hasEvents" class="cell-event-indicator">•</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="navigation-controls">
        <button class="nav-btn" @click="navigatePrevious">上一{{ getNavigationUnit() }}</button>
        <button class="nav-btn" @click="navigateToday">今天</button>
        <button class="nav-btn" @click="navigateNext">下一{{ getNavigationUnit() }}</button>
      </view>
      
      <view class="bottom-controls">
        <button class="settings-btn" @click="openSettings">设置</button>
        <button class="share-btn" @click="shareLifeGrid">分享</button>
      </view>
    </view>
    
    <!-- 格子详情弹窗 -->
    <uni-popup ref="cellDetailPopup" type="center">
      <view class="cell-detail-popup">
        <view class="popup-header">
          <text class="popup-title">{{ selectedCell ? getCellLabel(selectedCell) : '' }}</text>
          <text class="popup-close" @click="closeCellDetail">×</text>
        </view>
        <view class="popup-content">
          <view class="key-events-section">
            <text class="section-title">关键事项</text>
            <view v-for="(event, index) in cellEvents" :key="index" class="event-item">
              <input type="text" v-model="cellEvents[index].content" placeholder="添加关键事项..." />
              <text class="delete-event" @click="deleteEvent(index)">×</text>
            </view>
            <button class="add-event-btn" @click="addNewEvent">添加事项</button>
          </view>
          <button class="view-detail-btn" @click="viewFullDetail">查看详情</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
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
      dimensions: ['year', 'month', 'week', 'day'],
      dimensionLabels: {
        year: '年',
        month: '月',
        week: '周',
        day: '日'
      },
      currentDimension: 'year',
      
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
      particleEffect: 'none'
    };
  },
  onLoad() {
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
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentWeek = this.getWeekOfYear(now);
      
      // 根据当前维度和视图选项筛选可见格子
      if (this.currentView === 'all') {
        // 显示所有格子
        this.visibleCells = this.lifeGridData.filter(cell => cell.type === this.currentDimension);
      } else {
        // 显示当前时间段的格子
        switch (this.currentDimension) {
          case 'year':
            // 显示所有年份
            this.visibleCells = this.lifeGridData.filter(cell => cell.type === 'year');
            break;
          case 'month':
            // 显示当前年的所有月份
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'month' && cell.year === currentYear
            );
            break;
          case 'week':
            // 显示当前月及前后月的周
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'week' && (
                (cell.year === prevYear && cell.month === prevMonth) ||
                (cell.year === currentYear && cell.month === currentMonth) ||
                (cell.year === nextYear && cell.month === nextMonth)
              )
            );
            break;
          case 'day':
            // 显示当前月的所有天
            this.visibleCells = this.lifeGridData.filter(
              cell => cell.type === 'day' && cell.year === currentYear && cell.month === currentMonth
            );
            break;
        }
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
        `stage-${cell.stage}`,
        `time-${cell.timeStatus}`
      ];
      
      if (cell.timeStatus === 'present') {
        classes.push('current');
      }
      
      if (cell.hasEvents) {
        classes.push('has-events');
      }
      
      return classes;
    },
    
    getCellLabel(cell) {
      switch (cell.type) {
        case 'year':
          return `${cell.year}年`;
        case 'month':
          return `${cell.year}年${cell.month + 1}月`;
        case 'week':
          return `第${this.getWeekNumber(cell.year, cell.month, cell.week)}周`;
        case 'day':
          return `${cell.month + 1}月${cell.day}日`;
        default:
          return '';
      }
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
    
    navigatePrevious() {
      const now = new Date();
      let newRange;
      
      switch (this.currentDimension) {
        case 'year':
          // 前移10年
          newRange = {
            start: this.visibleCells[0].year - 10,
            end: this.visibleCells[this.visibleCells.length - 1].year - 10
          };
          break;
        case 'month':
          // 前移一年
          newRange = {
            year: this.visibleCells[0].year - 1
          };
          break;
        case 'week':
          // 前移三个月
          let prevYear = this.visibleCells[0].year;
          let prevMonth = this.visibleCells[0].month - 3;
          
          if (prevMonth < 0) {
            prevYear--;
            prevMonth = 12 + prevMonth;
          }
          
          newRange = {
            year: prevYear,
            month: prevMonth
          };
          break;
        case 'day':
          // 前移一个月
          let yearForDay = this.visibleCells[0].year;
          let monthForDay = this.visibleCells[0].month - 1;
          
          if (monthForDay < 0) {
            yearForDay--;
            monthForDay = 11;
          }
          
          newRange = {
            year: yearForDay,
            month: monthForDay
          };
          break;
      }
      
      this.updateVisibleCellsWithRange(newRange);
    },
    
    navigateNext() {
      const now = new Date();
      let newRange;
      
      switch (this.currentDimension) {
        case 'year':
          // 后移10年
          newRange = {
            start: this.visibleCells[0].year + 10,
            end: this.visibleCells[this.visibleCells.length - 1].year + 10
          };
          break;
        case 'month':
          // 后移一年
          newRange = {
            year: this.visibleCells[0].year + 1
          };
          break;
        case 'week':
          // 后移三个月
          let nextYear = this.visibleCells[0].year;
          let nextMonth = this.visibleCells[0].month + 3;
          
          if (nextMonth > 11) {
            nextYear++;
            nextMonth = nextMonth - 12;
          }
          
          newRange = {
            year: nextYear,
            month: nextMonth
          };
          break;
        case 'day':
          // 后移一个月
          let yearForDay = this.visibleCells[0].year;
          let monthForDay = this.visibleCells[0].month + 1;
          
          if (monthForDay > 11) {
            yearForDay++;
            monthForDay = 0;
          }
          
          newRange = {
            year: yearForDay,
            month: monthForDay
          };
          break;
      }
      
      this.updateVisibleCellsWithRange(newRange);
    },
    
    navigateToday() {
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
      this.selectedCell = cell;
      
      // 加载该格子的事件
      this.loadCellEvents(cell);
      
      // 打开弹窗
      this.$refs.cellDetailPopup.open();
    },
    
    closeCellDetail() {
      // 保存事件
      this.saveCellEvents();
      
      // 关闭弹窗
      this.$refs.cellDetailPopup.close();
      this.selectedCell = null;
      this.cellEvents = [];
    },
    
    loadCellEvents(cell) {
      // 从本地存储加载该格子的事件
      const key = this.getCellStorageKey(cell);
      const events = uni.getStorageSync(key) || [];
      this.cellEvents = events;
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
    
    addNewEvent() {
      this.cellEvents.push({
        id: Date.now(),
        content: '',
        tags: []
      });
    },
    
    deleteEvent(index) {
      this.cellEvents.splice(index, 1);
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
.container {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 初始化表单样式 */
.setup-container {
  width: 90%;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.setup-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 16px;
  color: #555;
}

.picker-value {
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #333;
}

.submit-btn {
  margin-top: 20px;
  height: 45px;
  line-height: 45px;
  background-color: #8e44ad;
  color: white;
  border-radius: 8px;
  font-size: 16px;
}

/* 生命格子样式 */
.life-grid-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.grid-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 10px;
}

.dimension-selector, .view-controls {
  display: flex;
  gap: 10px;
}

.dimension-option, .view-option {
  padding: 5px 15px;
  border-radius: 15px;
  background-color: #f0f0f0;
  color: #555;
}

.dimension-option.active, .view-option.active {
  background-color: #8e44ad;
  color: white;
}

.grid-scroll-view {
  flex: 1;
  width: 100%;
}

.grid-wrapper {
  display: flex;
  padding: 10px;
  min-width: 100%;
}

.grid-cell {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  margin-right: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
}

.cell-label {
  font-size: 14px;
  font-weight: bold;
}

.cell-event-indicator {
  position: absolute;
  bottom: 8px;
  font-size: 20px;
  color: #e74c3c;
}

/* 格子阶段颜色 */
.grid-cell.stage-childhood {
  background-color: rgba(155, 89, 182, 0.7);
  color: white;
}

.grid-cell.stage-education {
  background-color: rgba(52, 152, 219, 0.7);
  color: white;
}

.grid-cell.stage-work {
  background-color: rgba(46, 204, 113, 0.7);
  color: white;
}

.grid-cell.stage-retirement {
  background-color: rgba(241, 196, 15, 0.7);
  color: white;
}

/* 时间状态样式 */
.grid-cell.time-past {
  opacity: 0.7;
}

.grid-cell.time-present {
  border: 3px solid #e74c3c;
}

.grid-cell.time-future {
  background-color: rgba(52, 152, 219, 0.5);
}

.grid-cell.has-events::after {
  content: "";
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e74c3c;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
}

.nav-btn {
  flex: 1;
  margin: 0 5px;
  height: 40px;
  line-height: 40px;
  background-color: #8e44ad;
  color: white;
  border-radius: 8px;
  font-size: 14px;
}

.bottom-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding: 10px;
}

.settings-btn, .share-btn {
  width: 48%;
  height: 45px;
  line-height: 45px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  border-radius: 8px;
  font-size: 16px;
}

/* 弹窗样式 */
.cell-detail-popup {
  width: 300px;
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #8e44ad;
  color: white;
}

.popup-title {
  font-size: 16px;
  font-weight: bold;
}

.popup-close {
  font-size: 20px;
  font-weight: bold;
}

.popup-content {
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.event-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.event-item input {
  flex: 1;
  height: 35px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.delete-event {
  margin-left: 10px;
  font-size: 18px;
  color: #e74c3c;
}

.add-event-btn {
  width: 100%;
  height: 35px;
  line-height: 35px;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 5px;
  margin-top: 10px;
}

.view-detail-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background-color: #8e44ad;
  color: white;
  border-radius: 5px;
  margin-top: 20px;
}
</style>

