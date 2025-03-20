<template>
    <view class="mood-component">
        <!-- 已有记录的展示 -->
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
            <button class="add-btn" @click="addNewMoodLog">添加心情日志</button>
        </view>
    </view>
</template>

<script>
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
        }
    },
    data() {
        return {
            // 心情表情
            moodFaces: [
                { icon: '😊', name: '开心' },
                { icon: '🙂', name: '平心' },
                { icon: '😐', name: '平淡' },
                { icon: '😔', name: '不满' },
                { icon: '😫', name: '超烦' }
            ],
            selectedMood: null,

            // 活动分类
            activities: [
                { id: 'work', icon: '💼', name: '工作' },
                { id: 'study', icon: '📚', name: '学习' },
                { id: 'rest', icon: '🛌', name: '休息' },
                { id: 'sport', icon: '🏃', name: '运动' },
                { id: 'food', icon: '🍔', name: '美食' },
                { id: 'travel', icon: '✈️', name: '旅行' },
                { id: 'game', icon: '🎮', name: '游戏' },
                { id: 'movie', icon: '🎬', name: '电影' },
                { id: 'music', icon: '🎵', name: '音乐' },
                { id: 'read', icon: '📖', name: '阅读' },
                { id: 'shop', icon: '🛒', name: '购物' },
                { id: 'social', icon: '👥', name: '社交' },
                { id: 'love', icon: '❤️', name: '恋爱' },
                { id: 'family', icon: '👨‍👩‍👧', name: '家庭' },
                { id: 'pet', icon: '🐱', name: '宠物' }
            ],
            selectedActivities: [],
            showCustomInput: false,
            customActivity: '',

            // 编辑器相关
            editorVisible: false,
            moodContent: '',
            moodImages: [],
            voiceUrl: '',
            voiceDuration: '',

            // 心情日志数据
            moodLogs: [],
            hasMoodLog: false,
            currentMoodLogIndex: -1,

            // 时间相关
            currentTime: '',
            timeInterval: null,

            // 录音相关
            isRecording: false,
            recordingTime: '00:00',
            recordTimer: null,
            recorder: null
        };
    },
    created() {
        this.loadMoodLogs();
        this.updateCurrentTime();
        this.timeInterval = setInterval(this.updateCurrentTime, 1000);
    },
    beforeDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    },
    watch: {
        storageKey: {
            handler() {
                this.loadMoodLogs();
            },
            immediate: true
        }
    },
    methods: {
        // 时间相关方法
        updateCurrentTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            this.currentTime = `${hours}:${minutes}`;
        },

        formatDate(date) {
            if (!date) return '';

            if (typeof date === 'string') {
                date = new Date(date);
            }

            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        },

        // 数据加载和保存方法
        loadMoodLogs() {
            const moodKey = `${this.storageKey}_mood`;
            this.moodLogs = uni.getStorageSync(moodKey) || [];
            this.hasMoodLog = this.moodLogs.length > 0;
        },

        saveMoodLogs() {
            const moodKey = `${this.storageKey}_mood`;
            uni.setStorageSync(moodKey, this.moodLogs);
            this.hasMoodLog = this.moodLogs.length > 0;
            this.$emit('save', this.moodLogs);
        },

        // 心情日志管理方法
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
            this.saveMoodLogs();
        },

        updateMoodScore(index, score) {
            if (index >= 0 && index < this.moodLogs.length) {
                this.moodLogs[index].score = score;
                this.saveMoodLogs();
            }
        },

        deleteMoodLog(index) {
            if (index >= 0 && index < this.moodLogs.length) {
                this.moodLogs.splice(index, 1);
                this.saveMoodLogs();
            }
        },

        saveMoodLog() {
            // 从编辑器保存新的心情日志
            const selectedActivitiesText = this.selectedActivities.map(id => {
                const activity = this.activities.find(a => a.id === id);
                return activity ? activity.name : '';
            }).filter(Boolean).join(', ');

            const newLog = {
                id: Date.now(),
                date: new Date(),
                score: this.selectedMood !== null ? this.selectedMood + 1 : 3, // 转换为1-5分
                content: this.moodContent + (selectedActivitiesText ? `\n活动: ${selectedActivitiesText}` : ''),
                images: this.moodImages,
                voiceUrl: this.voiceUrl,
                voiceDuration: this.voiceDuration
            };

            this.moodLogs.push(newLog);
            this.saveMoodLogs();

            // 重置状态
            this.selectedMood = null;
            this.selectedActivities = [];
            this.closeEditor();
        },
    }
}
</script>
<style>
@import './mood.css';
</style>
