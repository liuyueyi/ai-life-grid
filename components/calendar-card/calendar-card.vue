<template>
    <view class="calendar-container">

        <!-- 添加前一天的卡片 -->
        <view class="calendar-card previous-card"
            :style="{ transform: `translateX(${translateX - windowWidth}px)`, transition: isAnimating ? 'transform 0.3s' : 'none' }">
            <view class="card-header" :style="{ backgroundImage: `url(${previousBackgroundImage})` }">
                <view class="date-info">
                    <text class="date">{{ previousDay }}</text>
                    <text class="month-year">{{ previousMonth + 1 }}月 {{ previousYear }}</text>
                </view>
                <view class="quote">
                    <text>{{ previousDailyQuote }}</text>
                </view>
            </view>
            <view class="card-content">
                <!-- 前一天的内容 -->
                <view class="section" v-if="previousEvents.length > 0">
                    <view class="section-title">今日任务</view>
                    <view class="event-list">
                        <view v-for="(event, index) in previousEvents" :key="index" class="event-item">
                            <view class="event-left">
                                <text class="event-indicator">●</text>
                                <text class="event-text">{{ event.content }}</text>
                            </view>
                            <view class="event-right">
                                <view class="event-tags">
                                    <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" class="event-tag">{{ tag
                                        }}</text>
                                </view>
                                <text class="event-time">{{ event.time }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="section" v-if="previousFinances.length > 0">
                    <view class="section-title">收支记录</view>
                    <view class="finance-list">
                        <view v-for="(item, index) in previousFinances" :key="index" class="finance-item">
                            <view class="finance-left">
                                <view :class="['record-icon', item.type === 'income' ? 'income-bg' : 'expense-bg']">
                                    <text class="finance-emoji">{{ getCategoryEmoji(item.category) }}</text>
                                </view>
                                <view class="finance-info">
                                    <text class="finance-category">{{ item.category }}</text>
                                    <text class="finance-remark" v-if="item.remark">{{ item.remark }}</text>
                                </view>
                            </view>
                            <view class="finance-right">
                                <text :class="['finance-amount', item.type === 'income' ? 'income' : 'expense']">{{
                item.type === 'income' ? '+' : '-' }}{{ item.amount }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="calendar-card current-card"
         @touchstart="handleTouchStart" @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            :style="{ transform: `translateX(${translateX}px)`, transition: isAnimating ? 'transform 0.3s' : 'none' }">
            <!-- 当前卡片内容 -->
            <view class="card-header" :style="{ backgroundImage: `url(${backgroundImage})` }">
                <view class="date-info">
                    <text class="date">{{ day }}</text>
                    <text class="month-year">{{ month + 1 }}月 {{ year }}</text>
                </view>
                <view class="quote">
                    <text>{{ dailyQuote }}</text>
                </view>
            </view>
            <view class="card-content">
                <!-- 原有内容保持不变 -->
                <view class="section" v-if="events.length > 0">
                    <view class="section-title">今日任务</view>
                    <view class="event-list">
                        <view v-for="(event, index) in events" :key="index" class="event-item"
                            @click="navigateToDetail('events')">
                            <view class="event-left">
                                <text class="event-indicator">●</text>
                                <text class="event-text">{{ event.content }}</text>
                            </view>
                            <view class="event-right">
                                <view class="event-tags">
                                    <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" class="event-tag">{{ tag
                                        }}</text>
                                </view>
                                <text class="event-time">{{ event.time }}</text>
                                <!-- <text class="delete-btn" @click="deleteEvent(event.id)">×</text> -->
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 收支明细 -->
                <view class="section" v-if="finances.length > 0">
                    <view class="section-title">收支记录</view>
                    <view class="finance-list">
                        <view v-for="(item, index) in finances" :key="index" class="finance-item"
                            @click="navigateToDetail('finance')">
                            <view class="finance-left">
                                <view :class="['record-icon', item.type === 'income' ? 'income-bg' : 'expense-bg']">
                                    <text class="finance-emoji">{{ getCategoryEmoji(item.category) }}</text>
                                </view>
                                <view class="finance-info">
                                    <text class="finance-category">{{ item.category }}</text>
                                    <text class="finance-remark" v-if="item.remark">{{ item.remark }}</text>
                                </view>
                            </view>
                            <view class="finance-right">
                                <text :class="['finance-amount', item.type === 'income' ? 'income' : 'expense']">{{
                item.type === 'income' ? '+' : '-' }}{{ item.amount }}</text>
                                <!-- <text class="delete-btn" @click="deleteFinance(item.id)">×</text> -->
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态提示 -->
                <view class="empty-state" v-if="events.length === 0 && finances.length === 0">
                    <text class="empty-icon">📝</text>
                    <text class="empty-text">今天还没有任何记录</text>
                    <text class="empty-subtext">点击右下角按钮添加新的任务或收支记录</text>
                </view>
            </view>
        </view>

        <!-- 添加下一天的卡片 -->
        <view class="calendar-card next-card"
            :style="{ transform: `translateX(${translateX + windowWidth}px)`, transition: isAnimating ? 'transform 0.3s' : 'none' }">
            <view class="card-header" :style="{ backgroundImage: `url(${nextBackgroundImage})` }">
                <view class="date-info">
                    <text class="date">{{ nextDay }}</text>
                    <text class="month-year">{{ nextMonth + 1 }}月 {{ nextYear }}</text>
                </view>
                <view class="quote">
                    <text>{{ nextDailyQuote }}</text>
                </view>
            </view>
            <view class="card-content">
                <!-- 下一天的内容将在切换时更新 -->
                <view class="section" v-if="nextEvents.length > 0">
                    <view class="section-title">今日任务</view>
                    <view class="event-list">
                        <view v-for="(event, index) in nextEvents" :key="index" class="event-item">
                            <view class="event-left">
                                <text class="event-indicator">●</text>
                                <text class="event-text">{{ event.content }}</text>
                            </view>
                            <view class="event-right">
                                <view class="event-tags">
                                    <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" class="event-tag">{{ tag
                                        }}</text>
                                </view>
                                <text class="event-time">{{ event.time }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="section" v-if="nextFinances.length > 0">
                    <view class="section-title">收支记录</view>
                    <view class="finance-list">
                        <view v-for="(item, index) in nextFinances" :key="index" class="finance-item">
                            <view class="finance-left">
                                <view :class="['record-icon', item.type === 'income' ? 'income-bg' : 'expense-bg']">
                                    <text class="finance-emoji">{{ getCategoryEmoji(item.category) }}</text>
                                </view>
                                <view class="finance-info">
                                    <text class="finance-category">{{ item.category }}</text>
                                    <text class="finance-remark" v-if="item.remark">{{ item.remark }}</text>
                                </view>
                            </view>
                            <view class="finance-right">
                                <text :class="['finance-amount', item.type === 'income' ? 'income' : 'expense']">{{
                item.type === 'income' ? '+' : '-' }}{{ item.amount }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 添加悬浮按钮 -->
        <view class="floating-button" @click="navigateToDetail('events')">
            <text class="plus-icon">+</text>
        </view>
    </view>
</template>

<script>
import { DateUtil } from '../../utils/DateUtil.js';
import TaskUtils from '../../utils/TaskUtils.js';
import { FinanceUtil } from '../../utils/FinanceUtil.js';

export default {
    name: 'calendar-card',
    props: {
        year: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            default: 0
        },
        day: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            backgroundImage: 'https://picsum.photos/400/800',
            nextBackgroundImage: 'https://picsum.photos/400/800',
            touchStartX: 0,
            touchEndX: 0,
            translateX: 0,
            isAnimating: false,
            windowWidth: 0,
            dailyQuotes: [
                '每一天都是新的开始',
                '保持乐观，保持希望',
                '今天的努力是明天的礼物',
                '相信自己，你就是最好的',
                '生活中的每个细节都值得感恩'
            ],
            dailyQuote: '',
            previousBackgroundImage: 'https://picsum.photos/400/800',
            previousDailyQuote: '',
            previousYear: 0,
            previousMonth: 0,
            previousDay: 1,
            previousEvents: [],
            previousFinances: [],
            previousMoods: [],
            nextDailyQuote: '',
            nextYear: 0,
            nextMonth: 0,
            nextDay: 1,
            events: [],
            finances: [],
            moods: [],
            nextEvents: [],
            nextFinances: [],
            nextMoods: []
        };
    },
    created() {
        const sysInfo = uni.getSystemInfoSync();
        this.windowWidth = sysInfo.windowWidth;
        this.initializeData();
        this.initializeNextDay();
        this.initializePreviousDay();
    },
    methods: {
        initializePreviousDay() {
            const currentDate = new Date(this.year, this.month, this.day);
            const previousDate = DateUtil.addDays(currentDate, -1);
            this.previousYear = previousDate.getFullYear();
            this.previousMonth = previousDate.getMonth();
            this.previousDay = previousDate.getDate();
            this.previousDailyQuote = this.dailyQuotes[Math.floor(Math.random() * this.dailyQuotes.length)];

            // 加载前一天的数据
            this.loadPreviousDayData();
        },

        loadPreviousDayData() {
            // 获取前一天的任务数据
            const previousCell = {
                type: 'day',
                year: this.previousYear,
                month: this.previousMonth,
                day: this.previousDay
            };
            this.previousEvents = TaskUtils.getEvents(previousCell) || [];

            // 获取前一天的收支数据
            const previousDate = `${this.previousYear}-${this.previousMonth + 1}-${this.previousDay}`;
            this.previousFinances = FinanceUtil.getFinanceRecords(this.previousYear, this.previousMonth, this.previousDay) || [];

            // 获取前一天的心情数据
            const previousMoodKey = `${previousDate}_mood`;
            this.previousMoods = uni.getStorageSync(previousMoodKey) || [];
        },

        initializeNextDay() {
            const currentDate = new Date(this.year, this.month, this.day);
            const nextDate = DateUtil.addDays(currentDate, 1);
            this.nextYear = nextDate.getFullYear();
            this.nextMonth = nextDate.getMonth();
            this.nextDay = nextDate.getDate();
            this.nextDailyQuote = this.dailyQuotes[Math.floor(Math.random() * this.dailyQuotes.length)];

            // 加载下一天的数据
            this.loadNextDayData();
        },

        loadNextDayData() {
            // 获取下一天的任务数据
            const nextCell = {
                type: 'day',
                year: this.nextYear,
                month: this.nextMonth,
                day: this.nextDay
            };
            this.nextEvents = TaskUtils.getEvents(nextCell) || [];

            // 获取下一天的收支数据
            const nextDate = `${this.nextYear}-${this.nextMonth + 1}-${this.nextDay}`;
            this.nextFinances = FinanceUtil.getFinanceRecords(this.nextYear, this.nextMonth, this.nextDay) || [];

            // 获取下一天的心情数据
            const nextMoodKey = `${nextDate}_mood`;
            this.nextMoods = uni.getStorageSync(nextMoodKey) || [];
        },
        handleTouchStart(event) {
            this.touchStartX = event.touches[0].clientX;
        },
        handleTouchMove(event) {
            const currentX = event.touches[0].clientX;
            const diffX = currentX - this.touchStartX;

            // 限制滑动范围，防止过度拖拽
            if ((diffX > 30 && diffX <= this.windowWidth) || (diffX < -30 && diffX >= -this.windowWidth)) {
                this.translateX = diffX;
            }
        },
        handleTouchEnd(event) {
            this.touchEndX = event.changedTouches[0].clientX;
            const diffX = this.touchEndX - this.touchStartX;
            this.isAnimating = true;

            if (Math.abs(diffX) > 50) {
                const currentDate = new Date(this.year, this.month, this.day);
                let newDate;
                if (diffX > 0) {
                    newDate = DateUtil.addDays(currentDate, -1);
                    this.translateX = this.windowWidth;
                } else {
                    newDate = DateUtil.addDays(currentDate, 1);
                    this.translateX = -this.windowWidth;
                }

                setTimeout(() => {
                    this.$emit('date-change', {
                        year: newDate.getFullYear(),
                        month: newDate.getMonth(),
                        day: newDate.getDate()
                    });
                    this.translateX = 0;
                    this.isAnimating = false;
                    this.initializeData();
                    this.initializeNextDay();
                    this.initializePreviousDay();
                }, 300);
            } else {
                this.translateX = 0;
                setTimeout(() => {
                    this.isAnimating = false;
                }, 300);
            }
        },
        getCategoryEmoji(category) {
            return FinanceUtil.getCategoryIcon(category);
        },

        deleteEvent(eventId) {
            const cell = {
                type: 'day',
                year: this.year,
                month: this.month,
                day: this.day
            };
            if (TaskUtils.deleteEvent(cell, eventId)) {
                this.events = TaskUtils.getEvents(cell);
                uni.showToast({ title: '删除成功', icon: 'success' });
            }
        },

        deleteFinance(financeId) {
            const date = `${this.year}-${this.month + 1}-${this.day}`;
            const record = this.finances.find(f => f.id === financeId);
            if (record && FinanceUtil.deleteDayRecord(record)) {
                this.finances = FinanceUtil.getFinanceRecords(this.year, this.month, this.day);
                uni.showToast({ title: '删除成功', icon: 'success' });
            }
        },

        initializeData() {
            // 随机选择一条每日文案
            this.dailyQuote = this.dailyQuotes[Math.floor(Math.random() * this.dailyQuotes.length)];

            // 获取当前日期的数据
            const currentDate = `${this.year}-${this.month + 1}-${this.day}`;
            console.log('显示时间:', currentDate);
            this.loadDayData(currentDate);
        },
        loadDayData(date) {
            // 获取任务数据
            const cell = {
                type: 'day',
                year: this.year,
                month: this.month,
                day: this.day
            };
            this.events = TaskUtils.getEvents(cell) || [];

            // 获取收支数据
            const { year, month, day } = DateUtil.parseDateString(date);
            this.finances = FinanceUtil.getFinanceRecords(year, month, day) || [];

            // 获取心情数据
            const moodKey = `${date}_mood`;
            this.moods = uni.getStorageSync(moodKey) || [];
        },
        navigateToDetail(tab) {
            uni.navigateTo({
                url: `/pages/detail/detail?date=${this.year}-${this.month + 1}-${this.day}&tab=${tab}`
            });
        },
    }
};
</script>
<style>
.calendar-container {
    position: relative;
    width: 100%;
    height: 100vh;
    padding-bottom: 2vh;
    overflow: hidden;
}

.calendar-card {
    position: absolute;
    width: calc(100% - 40rpx);
    height: calc(100% - 40rpx);
    margin: 20rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.current-card {
    z-index: 2;
    left: 0;
    top: 0;
}

.next-card {
    z-index: 1;
    left: 0;
    top: 0;
    transform: translateX(100%);
}

.previous-card {
    z-index: 1;
    left: 0;
    top: 0;
    transform: translateX(-100%);
}

.card-header {
    height: 60vh;
    background-size: cover;
    background-position: center;
    padding: 30rpx;
    position: relative;
}

.card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
}

.date-info {
    position: relative;
    z-index: 1;
    color: #fff;
}

.date {
    font-size: 72rpx;
    font-weight: bold;
}

.month-year {
    font-size: 32rpx;
    margin-left: 10rpx;
}

.quote {
    position: relative;
    z-index: 1;
    color: #fff;
    font-size: 28rpx;
    margin-top: 20rpx;
    font-style: italic;
}

.card-content {
    background: #fff;
    padding: 20rpx;
}

.section {
    margin-bottom: 30rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 15rpx;
}

.event-item,
.finance-item,
.mood-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15rpx;
    margin-bottom: 15rpx;
    background-color: white;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
}

.event-left,
.finance-left {
    display: flex;
    align-items: center;
    flex: 1;
}

.event-right,
.finance-right {
    display: flex;
    align-items: center;
    gap: 15rpx;
}

.event-indicator {
    color: #8e44ad;
    margin-right: 10rpx;
    font-size: 24rpx;
}

.event-text {
    font-size: 28rpx;
    color: #333;
}

.event-tags {
    display: flex;
    gap: 8rpx;
}

.event-tag {
    font-size: 20rpx;
    padding: 4rpx 8rpx;
    background-color: #f0f0f0;
    border-radius: 4rpx;
    color: #666;
}

.event-time,
.finance-time {
    font-size: 24rpx;
    color: #666;
}

.finance-emoji {
    font-size: 32rpx;
    margin-right: 10rpx;
}

.finance-info {
    display: flex;
    flex-direction: column;
}

.finance-category {
    font-size: 28rpx;
    color: #333;
}

.finance-remark {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
}

.finance-amount {
    font-size: 28rpx;
    font-weight: bold;
    margin-left: 15rpx;
}

.finance-amount.income {
    color: #4CAF50;
}

.finance-amount.expense {
    color: #F44336;
}

.delete-btn {
    font-size: 32rpx;
    color: #999;
    padding: 0 10rpx;
    cursor: pointer;
}

.mood-emoji {
    font-size: 32rpx;
    margin-right: 10rpx;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
}

.empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
    color: #ccc;
}

.empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 10rpx;
}

.empty-subtext {
    font-size: 24rpx;
    color: #999;
    text-align: center;
}

.floating-button {
    position: fixed;
    right: 40rpx;
    bottom: 40rpx;
    width: 100rpx;
    height: 100rpx;
    background: #8e44ad;
    opacity: 0.3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
    z-index: 999;
}

.plus-icon {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
}
</style>