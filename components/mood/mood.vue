<template>
    <view class="mood-component">
        <view class="mood-list">
            <view class="mood-group" v-for="(group, date) in groupedMoods" :key="date">
                <view class="mood-date" v-if="cell.type != 'day'">{{ date }}</view>
                <view class="mood-date">每一天都是好心情~</view>
                <view class="mood-card" v-for="(mood, index) in group" :key="mood.id">
                    <view class="mood-body">
                        <view class="mood-left">
                            <text class="mood-emoji">{{ mood.moodInfo.icon }}</text>
                        </view>
                        <view class="mood-right">
                            <view class="mood-header">
                                <view class="mood-info">
                                    <text class="mood-name">{{ mood.moodInfo.name }}</text>
                                    <text class="mood-time">{{ mood.moodDate.time }}</text>
                                </view>
                                <view class="mood-menu" @click="showMoodMenu(mood)">
                                    <text class="menu-icon">⋮</text>
                                </view>
                            </view>
                            <text class="mood-content" v-if="mood.content">{{ mood.content }}</text>
                            <view class="mood-images" v-if="mood.images && mood.images.length > 0">
                                <image class="mood-image" v-for="(image, index) in mood.images" :key="index"
                                    :src="image" mode="aspectFill" />
                            </view>
                            <view class="mood-voice" v-if="mood.voiceUrl">
                                <text class="voice-icon">🎤</text>
                                <text class="voice-duration">{{ mood.voiceDuration }}</text>
                            </view>
                            <view class="mood-activities" v-if="mood.activities && mood.activities.length > 0">
                                <text v-for="(activity, idx) in mood.activities" :key="activity.id">
                                    {{ activity.icon }}{{ activity.name }}<text v-if="idx < mood.activities.length - 1">
                                        · </text>
                                </text>
                            </view>
                        </view>
                    </view>
                    <view class="mood-divider" v-if="index < group.length - 1"></view>
                </view>
            </view>
        </view>

        <picker @change="handleMenuSelect" v-if="showPicker">
            <view class="menu-overlay" @click="closePicker"></view>
            <view class="menu-container">
                <view class="menu-item" v-for="(option, index) in menuOptions" :key="index"
                    @click="handleMenuSelect({ detail: { value: index } })">{{ option }}</view>
            </view>
        </picker>
    </view>
</template>

<script>
import { MoodsUtil } from '../../utils/MoodsUtil.js';

export default {
    name: 'MoodComponent',
    props: {
        storageKey: {
            type: String,
            required: true
        },
        cell: {
            type: Object,
            required: true
        },
        reload: {
            type: Number,
            required: false,
        }
    },
    data() {
        return {
            moodList: [],
            selectedMood: null,
            showPicker: false,
            menuOptions: ['编辑心情', '删除心情', '取消']
        };
    },
    computed: {
        groupedMoods() {
            const groups = {};
            this.moodList.forEach(mood => {
                const date = mood.moodDate.date;
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(mood);
            });
            return groups;
        }
    },
    created() {
        this.loadMoodList();
    },
    watch: {
        cell: {
            handler: 'loadMoodList',
            deep: true
        },
        reload: {
            immediate: true,
            handler: 'loadMoodList'
        }
    },
    methods: {
        loadMoodList() {
            if (!this.cell) return;
            this.moodList = MoodsUtil.getMoods(this.cell);
        },
        showMoodMenu(mood) {
            this.selectedMood = mood;
            this.showPicker = true;
        },
        closePicker() {
            this.showPicker = false;
            this.selectedMood = null; // 确保在关闭时重置选中状态
        },
        handleMenuSelect(e) {
            const selectedIndex = e.detail.value;
            this.showPicker = false;

            switch (selectedIndex) {
                case 0: // 编辑心情
                    if (!this.selectedMood) return;
                    uni.navigateTo({
                        url: `/pages/mood/mood?id=${this.selectedMood.id}&date=${this.selectedMood.moodDate.date}&type=${this.selectedMood.type ? this.selectedMood.type : ''}`
                    });
                    this.selectedMood = null;
                    break;
                case 1: // 删除心情
                    if (!this.selectedMood) return;
                    uni.showModal({
                        title: '删除确认',
                        content: '确定要删除这条心情记录吗？',
                        success: (res) => {
                            if (res.confirm) {
                                console.log('当前选中的心情是：', this.selectedMood);
                                MoodsUtil.deleteMoodByDetail(this.selectedMood);
                                this.loadMoodList();
                                uni.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                });
                            }

                            this.selectedMood = null;
                        }
                    });
                    break;
                default: // 取消
                    this.selectedMood = null;
                    break;
            }
        }
    }
}
</script>
<style>
@import './mood.css';
</style>
