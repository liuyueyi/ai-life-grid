<template>
    <view class="calendar-card">
        <!-- 上部分：日期卡片 -->
        <view class="card-header" :style="{ backgroundImage: `url(${backgroundImage})` }">
            <view class="date-info">
                <text class="date">{{ day }}</text>
                <text class="month-year">{{ month + 1 }}月 {{ year }}</text>
            </view>
            <view class="quote">
                <text>{{ dailyQuote }}</text>
            </view>
        </view>

        <!-- 下部分：用户记录 -->
        <view class="card-content">
            <!-- 任务列表 -->
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

            <!-- 心情日志 -->
            <view class="section" v-if="moods.length > 0">
                <view class="section-title">心情记录</view>
                <view class="mood-list">
                    <view v-for="(mood, index) in moods" :key="index" class="mood-item"
                        @click="navigateToDetail('mood')">
                        <text class="mood-emoji">{{ mood.emoji }}</text>
                        <text class="mood-text">{{ mood.content }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 悬浮按钮 -->
        <view class="floating-button" @click="navigateToDetail">
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
            backgroundImage: 'https://picsum.photos/400/800', // 使用随机图片服务
            dailyQuotes: [
                '每一天都是新的开始',
                '保持乐观，保持希望',
                '今天的努力是明天的礼物',
                '相信自己，你就是最好的',
                '生活中的每个细节都值得感恩'
            ],
            dailyQuote: '',
            events: [],
            finances: [],
            moods: []
        };
    },
    created() {
        this.initializeData();
    },
    methods: {
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
        }
    }
};
</script>

<style>
.calendar-card {
    margin: 20rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    position: relative;
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
}

.plus-icon {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
}
</style>