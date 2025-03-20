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
                    <view v-for="(event, index) in events" :key="index" class="event-item">
                        <text class="event-text">{{ event.content }}</text>
                        <text class="event-time">{{ event.time }}</text>
                    </view>
                </view>
            </view>

            <!-- 收支明细 -->
            <view class="section" v-if="finances.length > 0">
                <view class="section-title">收支记录</view>
                <view class="finance-list">
                    <view v-for="(item, index) in finances" :key="index" class="finance-item">
                        <text class="finance-category">{{ item.category }}</text>
                        <text :class="['finance-amount', item.type === 'income' ? 'income' : 'expense']">{{ item.type
            === 'income' ? '+' : '-' }}{{ item.amount }}</text>
                    </view>
                </view>
            </view>

            <!-- 心情日志 -->
            <view class="section" v-if="moods.length > 0">
                <view class="section-title">心情记录</view>
                <view class="mood-list">
                    <view v-for="(mood, index) in moods" :key="index" class="mood-item">
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
            const financeKey = `${date}_finance`;
            this.finances = uni.getStorageSync(financeKey) || [];

            // 获取心情数据
            const moodKey = `${date}_mood`;
            this.moods = uni.getStorageSync(moodKey) || [];
        },
        navigateToDetail() {
            uni.navigateTo({
                url: `/pages/detail/detail?date=${this.currentYear}-${this.currentMonth + 1}-${this.currentDay}`
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
    padding: 10rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.event-text,
.finance-category,
.mood-text {
    font-size: 26rpx;
    color: #666;
}

.event-time {
    font-size: 24rpx;
    color: #999;
}

.finance-amount {
    font-size: 26rpx;
    font-weight: bold;
}

.finance-amount.income {
    color: #4CAF50;
}

.finance-amount.expense {
    color: #F44336;
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