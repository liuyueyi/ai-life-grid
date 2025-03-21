<template>
	<view class="mood-component" :style="{ backgroundImage: `url(${backgroundImage})` }">
		<view class="top" v-if="selectedMood == null">
			<view class="mood-question">感觉怎么样?</view>

			<view class="mood-date-time">
				<view class="date-time-row">
					<view class="mood-date-row" @click="showDatePicker">
						<text class="date-icon">📅</text>
						<text class="mood-date">{{ cell.year + '-' + (cell.month + 1) + '-' + cell.day }}</text>
					</view>
					<view class="mood-time-row" @click="showTimePicker">
						<text class="time-icon">🕒</text>
						<text class="mood-time">{{ currentTime }}</text>
					</view>
				</view>
			</view>
			<!-- 日期选择器弹窗 -->
			<custom-popup ref="datePickerPopup" type="center">
				<date-picker :year="cell.year" :initial-month="cell.month" :initial-day="cell.day"
					@confirm="confirmDate" @cancel="$refs.datePickerPopup.close()" />
			</custom-popup>

			<!-- 时间选择器弹窗 -->
			<custom-popup ref="timePickerPopup" type="center">
				<time-picker :initial-hour="parseInt(currentTime.split(':')[0])"
					:initial-minute="parseInt(currentTime.split(':')[1])" @confirm="confirmTime"
					@cancel="$refs.timePickerPopup.close()" />
			</custom-popup>

			<!-- 表情选择 -->
			<view class="mood-faces">
				<view v-for="(face, index) in moodFaces" :key="index" class="mood-face-item"
					:class="{ 'selected': selectedMood === index }" @click="selectMood(index)">
					<view class="face-icon">{{ face.icon }}</view>
					<view class="face-name">{{ face.name }}</view>
				</view>
			</view>
		</view>

		<!-- 当没有记录时的图片布局展示 -->
		<view v-if="selectedMood" class="mood-empty">
			<view>
				<view class="selected-time"> {{ this.cell.year + '-' + (this.cell.month + 1) + "-" + this.cell.day }}
				</view>
				<view class="selected-emoj"> {{ moodFaces[selectedMood].icon }} </view>
			</view>
			<!-- 活动分类选择区 -->
			<view>你这一阵子都在忙些什么呢？</view>
			<view class="activity-section" v-if="selectedMood !== null">
				<view class="activity-grid" :class="{ 'edit-mode': isEditingActivities }">
					<view v-for="(activity, index) in activities" :key="index" class="activity-item"
						:class="{ 'selected': selectedActivities.includes(activity.id) }"
						@click="isEditingActivities ? editActivity(activity) : toggleActivity(activity.id)">
						<view class="delete-activity" v-if="isEditingActivities"
							@click.stop="deleteActivity(activity.id)">×</view>
						<view class="activity-icon">{{ activity.icon }}</view>
						<view class="activity-name">{{ activity.name }}</view>
					</view>
					<view class="activity-item add-custom" @click="toggleEditActivities()">
						<view class="activity-icon">🖊</view>
						<view class="activity-name"> {{ !isEditingActivities ? '编辑' : '取消' }} </view>
					</view>
					<view class="activity-item add-custom" @click="showActivityPopup()">
						<view class="activity-icon">+</view>
						<view class="activity-name">自定义</view>
					</view>
				</view>
			</view>

			<!-- 心情输入区 -->
			<view class="mood-input-section" v-if="selectedMood !== null">
				<view class="input-header">
					<view class="section-title" @click="recordVoice">
						<text class="section-icon">📒</text>
						<text>心情笔记</text>
					</view>
					<view class="fullscreen-btn" @click="toggleFullscreen">
						<view><svg class="icon"
								style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
								viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1640">
								<path
									d="M128 266.666667v490.666666a53.393333 53.393333 0 0 0 53.333333 53.333334h661.333334a53.393333 53.393333 0 0 0 53.333333-53.333334V266.666667a53.393333 53.393333 0 0 0-53.333333-53.333334H181.333333a53.393333 53.393333 0 0 0-53.333333 53.333334z m725.333333 0v490.666666a10.666667 10.666667 0 0 1-10.666666 10.666667H181.333333a10.666667 10.666667 0 0 1-10.666666-10.666667V266.666667a10.666667 10.666667 0 0 1 10.666666-10.666667h661.333334a10.666667 10.666667 0 0 1 10.666666 10.666667z m-597.333333 608a21.333333 21.333333 0 0 1-21.333333 21.333333H96a53.393333 53.393333 0 0 1-53.333333-53.333333v-138.666667a21.333333 21.333333 0 0 1 42.666666 0v138.666667a10.666667 10.666667 0 0 0 10.666667 10.666666h138.666667a21.333333 21.333333 0 0 1 21.333333 21.333334zM42.666667 320V181.333333a53.393333 53.393333 0 0 1 53.333333-53.333333h138.666667a21.333333 21.333333 0 0 1 0 42.666667H96a10.666667 10.666667 0 0 0-10.666667 10.666666v138.666667a21.333333 21.333333 0 0 1-42.666666 0z m938.666666-138.666667v138.666667a21.333333 21.333333 0 0 1-42.666666 0V181.333333a10.666667 10.666667 0 0 0-10.666667-10.666666h-138.666667a21.333333 21.333333 0 0 1 0-42.666667h138.666667a53.393333 53.393333 0 0 1 53.333333 53.333333z m0 522.666667v138.666667a53.393333 53.393333 0 0 1-53.333333 53.333333h-138.666667a21.333333 21.333333 0 0 1 0-42.666667h138.666667a10.666667 10.666667 0 0 0 10.666667-10.666666v-138.666667a21.333333 21.333333 0 0 1 42.666666 0z"
									fill="#5C5C66" p-id="1641"></path>
							</svg></view>
					</view>
				</view>
				<textarea v-model="moodContent" placeholder="记录此刻的心情..." :class="{ 'fullscreen': isFullscreen }"
					class="custom-textarea" />

				<view class="section-title" @click="recodingShow = true">
					<text class="section-icon">🎤</text>
					<text>录制语音</text>
				</view>
				<view class="voice-recorder" v-if="true">
					<view class="recorder-content">
						<view class="recorder-timer">{{ recordingTime }}</view>
						<view :class="['recorder-btn', isRecording ? 'recording' : '']" @touchstart="startRecording"
							@touchend="stopRecording">
							{{ isRecording ? '松开结束' : '按住录音' }}
						</view>
					</view>
				</view>
			</view>

			<!-- 照片上传区 -->
			<view class="photo-section" v-if="selectedMood !== null">
				<view class="section-title">
					<text class="section-icon">📷️</text>
					<text>照片</text>
				</view>
				<view class="photo-grid">
					<image v-for="(img, index) in moodImages" :key="index" :src="img" mode="aspectFill"
						class="photo-item" />
					<view class="add-photo" @click="addImage">+</view>
				</view>
			</view>

			<!-- 底部悬浮按钮 -->
			<view class="floating-buttons">
				<view class="save-button" @click="saveMoodLog">保存</view>
			</view>
		</view>
	</view>

	<!-- 富文本编辑器 -->
	<view v-if="editorVisible" class="rich-editor">
		<view class="editor-header">
			<view class="editor-title">记录心情</view>
			<view class="editor-close" @click="closeEditor">×</view>
		</view>
		<view class="editor-content">
			<textarea v-model="moodContent" placeholder="记录今天的心情..." class="mood-textarea" />

			<!-- 图片区域 -->
			<view class="mood-images" v-if="moodImages.length > 0">
				<image v-for="(img, imgIndex) in moodImages" :key="imgIndex" :src="img" class="mood-image"
					mode="aspectFill" />
				<view class="add-image" @click="addImage">+</view>
			</view>
			<view v-else class="add-image-btn" @click="addImage">添加图片</view>

			<!-- 语音区域 -->
			<view class="mood-voice" v-if="voiceUrl">
				<view class="voice-player" @click="playVoice(voiceUrl)">
					<view class="voice-icon">🎤</view>
					<view class="voice-duration">{{ voiceDuration || '0:00' }}</view>
				</view>
				<view class="delete-voice" @click="deleteVoice">×</view>
			</view>
			<view v-else class="add-voice-btn" @click="recordVoice">录制语音</view>

			<!-- 保存按钮 -->
			<button class="save-btn" @click="saveMoodLog">保存</button>
		</view>
	</view>

	<!-- 活动编辑弹窗 -->
	<custom-popup ref="activityPopup" type="center">
		<view class="activity-popup">
			<view class="activity-popup-header">
				<text class="activity-popup-title">{{ editingActivity ? '编辑活动' : '新建活动' }}</text>
				<text class="activity-popup-close" @click="closeActivityPopup">×</text>
			</view>
			<view class="activity-popup-content">
				<view class="activity-input-group">
					<view class="activity-input-label">表情符号</view>
					<input class="activity-input" v-model="customActivityIcon" placeholder="输入表情符号" />
				</view>
				<view class="activity-input-group">
					<view class="activity-input-label">活动名称</view>
					<input class="activity-input" v-model="customActivity" placeholder="输入活动名称" />
				</view>
				<view class="activity-save-btn" @click="saveActivity">保存</view>
			</view>
		</view>
	</custom-popup>

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
</template>

<script>
import { DateUtil } from '../../utils/DateUtil.js';
import { MoodsUtil } from '../../utils/MoodsUtil.js';
import CustomPopup from '../../components/custom-popup/custom-popup.vue';
import DatePicker from '../../components/date-picker/date-picker.vue';
import TimePicker from '../../components/time-picker/time-picker.vue';
export default {
	components: {
		CustomPopup,
		DatePicker,
		TimePicker
	},
	data() {
		return {
			cell: {
			},
			moodId: '', // 存在时，表示编辑心情
			// 心情表情
			moodFaces: [
				{ icon: '😊', name: '狂喜' },
				{ icon: '🙂', name: '开心' },
				{ icon: '😐', name: '还行' },
				{ icon: '😔', name: '不爽' },
				{ icon: '😫', name: '超烂' }
			],
			selectedMood: null,
			currentMood: {},

			// 活动分类
			activities: [],
			selectedActivities: [],
			showCustomInput: false,
			customActivity: '',
			customActivityIcon: '',
			isEditingActivities: false,
			editingActivity: null,

			// 目标相关
			goals: [],
			selectedGoal: null,
			showGoalInput: false,
			newGoalName: '',

			// 全屏编辑相关
			isFullscreen: false,

			// 编辑器相关
			editorVisible: false,
			moodContent: '',
			moodImages: [],
			voiceUrl: '',
			voiceDuration: '',

			// 时间相关
			currentTime: '',
			timeInterval: null,

			// 录音相关
			recodingShow: false,
			isRecording: false,
			recordingTime: '00:00',
			recordTimer: null,
			recorder: null
		};
	},
	created() {
		this.updateCurrentTime();
		this.timeInterval = setInterval(this.updateCurrentTime, 1000);
	},
	beforeDestroy() {
		if (this.timeInterval) {
			clearInterval(this.timeInterval);
		}
	},
	onLoad(options) {
		const date = options.date;
		if (date) {
			const { year, month, day } = DateUtil.parseDateString(date);
			console.log('加载参数', date)
			this.cell = {
				year: year,
				month: month,
				day: day
			}
		}
		this.loadActivities();
		this.moodId = options.moodId;
		let mood = MoodsUtil.getMood(this.cell, this.moodId);
		if (mood) {
			let {year, month, day} = DateUtil.parseDateString(mood.moodDate.date);
			this.cell = {
				year: year,
				month: month,
				day: day
			};
			this.currentTime = mood.moodDate.time;
			this.selectedMood = moodFaces[mood.mood];
			this.selectedActivities = mood.activities.map(a => a.id);
			this.moodContent = mood.content;
			this.moodImages = mood.images;
			this.voiceUrl = mood.voice;
			this.voiceDuration = mood.voiceDuration;
		}
		this.currentMood = mood ? mood : {}
	},
	methods: {
		showDatePicker() {
			// 显示日期选择弹窗
			this.$refs.datePickerPopup.open();
		},
		showTimePicker() {
			// 显示时间选择弹窗
			this.$refs.timePickerPopup.open();
		},
		confirmDate(date) {
			this.cell = {
				year: this.cell.year,
				month: date.month,
				day: date.day
			}
			this.$refs.datePickerPopup.close();
		},
		confirmTime(times) {
			let { hour, minute } = times;
			const hours = hour.toString().padStart(2, '0');
			const minutes = minute.toString().padStart(2, '0');
			this.currentTime = `${hours}:${minutes}`;
			// 确认时间
			this.$refs.tCimePickerPopup.close();
		},
		// 时间相关方法
		updateCurrentTime() {
			const now = new Date();
			const hours = now.getHours().toString().padStart(2, '0');
			const minutes = now.getMinutes().toString().padStart(2, '0');
			this.currentTime = `${hours}:${minutes}`;
		},
		// 心情选择相关方法
		selectMood(index) {
			this.selectedMood = index;
		},
		loadActivities() {
			// 获取所有的分类
			this.activities = MoodsUtil.loadAllActivity();
		},
		// 活动分类相关方法
		toggleActivity(activityId) {
			const index = this.selectedActivities.indexOf(activityId);
			if (index === -1) {
				this.selectedActivities.push(activityId);
			} else {
				this.selectedActivities.splice(index, 1);
			}
		},

		showCustomActivityInput() {
			this.showCustomInput = true;
		},

		addCustomActivity() {
			let activity = this.customActivity.trim();
			if (activity) {
				let icon = this.customActivityIcon.trim();
				if (!icon) {
					icon = '📝'
				}
				this.activities = MoodsUtil.addActivity(icon, activity);

				this.customActivity = '';
				this.customActivityIcon = '';
				this.showCustomInput = false;
			}
		},

		// 切换活动编辑模式
		toggleEditActivities() {
			this.isEditingActivities = !this.isEditingActivities;
		},

		// 显示活动弹窗
		showActivityPopup(activity = null) {
			this.editingActivity = activity;
			console.log('activity', activity)
			if (activity) {
				this.customActivity = activity.name;
				this.customActivityIcon = activity.icon;
			} else {
				this.customActivity = '';
				this.customActivityIcon = '';
			}
			this.$refs.activityPopup.open();
		},

		// 关闭活动弹窗
		closeActivityPopup() {
			this.$refs.activityPopup.close();
			this.editingActivity = null;
			this.customActivity = '';
			this.customActivityIcon = '';
		},

		// 保存活动
		saveActivity() {
			const activity = this.customActivity.trim();
			const icon = this.customActivityIcon.trim() || '📝';

			if (activity) {
				if (this.editingActivity) {
					// 更新活动
					this.editingActivity.name = activity;
					this.editingActivity.icon = icon;
					MoodsUtil.updateActivity(this.editingActivity);
				} else {
					// 新建活动
					this.activities = MoodsUtil.addActivity(icon, activity);
				}
				this.closeActivityPopup();
			}
		},

		// 编辑活动
		editActivity(activity) {
			this.showActivityPopup(activity);
		},

		// 删除活动
		deleteActivity(id) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个活动吗？',
				success: (res) => {
					if (res.confirm) {
						MoodsUtil.deleteActivity(id);
						this.activities = this.activities.filter(a => a.id !== id);
					}
				}
			});
		},

		// 编辑器相关方法
		showEditor() {
			this.editorVisible = true;
		},

		closeEditor() {
			this.editorVisible = false;
			// 重置编辑器状态
			this.moodContent = '';
			this.moodImages = [];
			this.voiceUrl = '';
			this.voiceDuration = '';
		},

		// 图片相关方法
		addImage() {
			uni.chooseImage({
				count: 9,
				success: (res) => {
					const tempFilePaths = res.tempFilePaths;
					this.moodImages = [...this.moodImages, ...tempFilePaths];
				}
			});
		},

		// 录音相关方法
		recordVoice() {
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
				// 新增
				this.voiceUrl = res.tempFilePath;
				this.voiceDuration = this.recordingTime;

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

		deleteVoice() {
			// 删除编辑器中的录音
			this.voiceUrl = '';
			this.voiceDuration = '';
		},

		// 心情日志管理方法
		saveMoodLog() {
			if (!this.selectedActivities || this.selectedActivities.length <= 0) {
				uni.showToast({
					title: '请先选择活动分类',
					icon: 'none'
				});
				return;
			}

			// 根据 activityId 查询对应的活动分类
			const moodActivities = this.selectedActivities.map(id => {
				return this.activities.find(a => a.id === id);
			});
			// 更新时间
			let saveMood = {
				id: this.currentMood.id,
				editDate: Date.now(),
				mood: this.selectedMood, // 选中的心情
				moodInfo: this.moodFaces[this.selectedMood],
				activities: moodActivities, // 选中的活动分类
				content: this.moodContent, // 心情日志
				images: this.moodImages, // 上传的图片
				voiceUrl: this.voiceUrl, // 录音相关
				voiceDuration: this.voiceDuration,
				moodDate: { // 添加心情对应的日期和时间
					date: `${this.cell.year}-${this.cell.month + 1}-${this.cell.day}`,
					time: this.currentTime
				}
			}

			if (!saveMood.id) {
				saveMood.id = Date.now();
			}
			console.log('saveMood', saveMood)
			MoodsUtil.saveMood(this.cell, saveMood);

			this.resetMoodInfo();
			this.closeEditor();
		},

		resetMoodInfo() {
			// 重置状态
			this.selectedMood = null;
			this.selectedActivities = [];
			this.moodContent = '';
			this.moodImages = [];
			this.voiceUrl = '';
			this.voiceDuration = 0;
		}
	}
}
</script>
<style>
@import './mood.css';
</style>
