<template>
    <view class="event-manager">
        <view class="key-events-section">
            <text class="section-title" v-if="source == 'index'">记录生活中的一点一滴</text>
            <view :class="cell.type != 'day' ? 'record-pannel' : ''">
                <view class="record-header" v-if="cell.type == 'year'">
                    <text class="record-title">{{ cell.year }}年度记录</text>
                    <text class="record-subtitle">Annual Records</text>
                </view>
                <view class="record-header" v-if="cell.type == 'month'">
                    <text class="record-title">{{ cell.year }}年{{ cell.month + 1 }}月记录</text>
                    <text class="record-subtitle">Monthly Records</text>
                </view>
                <view v-for="(event, index) in events" :key="index" class="event-item">
                    <view class="event-dot"></view>
                    <view class="event-content">
                        <view class="content-wrapper">
                            <view v-if="event.show" @tap="toEditContent(event)">{{ event.content }}
                            </view>
                            <textarea v-else v-model="event.content" :id="'area' + index" :ref="'textarea' + index"
                                placeholder="记录点滴事件..." @input="onEventContentChange" @blur="onBlur(index)" />
                        </view>
                        <view class="event-meta">
                            <view class="event-time" style="margin-left: -1rem;">
                                <text v-if="cell.type != 'day'"> {{ formatEventDate(event.id) }} &nbsp;</text>
                                <picker mode="time" :value="event.time || currentTime" start="00:00" end="23:59"
                                    @change="onTimeChange($event, index)">
                                    <text>{{ event.time || currentTime }}</text>
                                </picker>
                            </view>
                            <view class="event-tags">
                                <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" :class="['tag', {
                'tag-urgent': tag === '紧急',
                'tag-reminder': tag === '提醒',
                'tag-daily': tag === '日常',
                'tag-note': tag === '备注',
                'tag-default': !['紧急', '提醒', '日常', '备注'].includes(tag)
            }]">
                                    {{ tag }}
                                    <text class="tag-delete" @click.stop="removeTag(index, tagIndex)">×</text>
                                </text>
                                <view class="tag-selector">
                                    <view class="tag-selector-trigger" @click="showTagSelector(index)">
                                        <text class="add-tag-icon">+</text>
                                    </view>
                                    <view class="tag-selector-dropdown" v-if="event.showTagSelector">
                                        <view class="tag-list">
                                            <view v-for="(tag, tagIndex) in availableTags" :key="tagIndex"
                                                class="tag-item" @click="toggleTag(index, tag)">
                                                <text class="tag-item-text"
                                                    :class="{ 'selected': event.tags.includes(tag) }">{{ tag
                                                    }}</text>
                                            </view>
                                        </view>
                                        <view class="tag-manage">
                                            <input type="text" v-model="newTag" placeholder="添加新标签"
                                                class="new-tag-input" />
                                            <button class="add-tag-btn" @click="addNewTag">添加</button>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>

                    <text class="delete-event" @click="deleteEvent(index)">×</text>
                </view>
            </view>

            <view class="record-pannel" v-if="subLevelEvents.length > 0">
                <view class="record-header" v-if="cell.type == 'year'">
                    <text class="record-title">{{ cell.year }}年月记录明细</text>
                    <text class="record-subtitle">Monthly Records</text>
                </view>
                <view class="record-header" v-if="cell.type == 'month'">
                    <text class="record-title">{{ cell.month + 1 }}月日记录明细</text>
                    <text class="record-subtitle">Daily Records</text>
                </view>

                <view v-for="(event, index) in subLevelEvents" :key="index" class="event-item"
                    v-if="subLevelEvents.length > 0">
                    <view class="event-dot"></view>
                    <view class="event-content">
                        <view class="content-wrapper">
                            <view @tap="navToDetail(event)">{{ event.content }}
                            </view>
                        </view>
                        <view class="event-meta">
                            <view class="event-time">
                                <text>{{ event.day }} </text>
                            </view>
                            <view class="event-tags">
                                <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" :class="['tag', {
                'tag-urgent': tag === '紧急',
                'tag-reminder': tag === '提醒',
                'tag-daily': tag === '日常',
                'tag-note': tag === '备注',
                'tag-default': !['紧急', '提醒', '日常', '备注'].includes(tag)
            }]">
                                    {{ tag }}
                                </text>
                            </view>
                        </view>
                    </view>
                    <text class="delete-event" @click="deleteSubEvent(index)">×</text>
                </view>
            </view>
            <button class="add-event-btn" @click="addNewEvent" v-if="source == 'index'">+</button>
        </view>
        <view class="floating-add-btn" @click="addNewEvent" v-if="source != 'index'">
            <text class="floating-add-icon">+</text>
        </view>
    </view>
</template>

<script>
import { TaskUtils } from '../../utils/TaskUtils.js';
import { DateUtil } from '../../utils/DateUtil.js';

export default {
    name: 'EventManager',
    props: {
        cell: {
            type: Object,
            default: () => { }
        },
        source: {
            type: String,
            default: 'index'
        }
    },
    data() {
        return {
            events: [],
            subLevelEvents: [], // 月维度详情时,这里显示日维度的记录列表; 年维度详情时,这里展示月维度的记录列表
            currentTime: '',
            availableTags: [],
            newTag: '',
            visible: false,
            expandedEvents: []
        }
    },
    watch: {
        cell: {
            immediate: true,
            handler(newEvents) {
                console.log('cell发生了变更 = ', this.cell, newEvents);
                this.events = TaskUtils.getEvents(this.cell);
                for (let e of this.events) {
                    e.show = true;
                }
                if (this.events.length < 1) {
                    this.addNewEvent();
                }
                this.loadDetailEvents();
            }
        },
    },
    created() {
        this.updateCurrentTime();
        this.availableTags = TaskUtils.initDefaultTags();
        console.log('初始化的内容', this.availableTags);
    },

    methods: {
        navToDetail(event) {
            uni.navigateTo({
                url: '/pages/detail/detail?date=' + event.day
            });
        },
        formatEventDate(time) {
            return DateUtil.formatEventDate(time);
        },
        updateCurrentTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            this.currentTime = `${hours}:${minutes}`;
        },
        onBlur(index) {
            this.$set(this.events[index], 'show', true);
            this.save();
        },
        loadDetailEvents() {
            if (this.source == 'index') {
                return;
            }

            // 如果是月\年进入的详情,则展示完月/年的记录之后,再将每天的计划明细展示出来
            if (this.cell.type == 'month') {
                // 展示日事件
                const days = DateUtil.getDays(this.cell.year, this.cell.month);
                let subLevelEvents = []

                for (let m = days; m > 0; m--) {
                    let tmpCell = { type: 'day', year: this.cell.year, month: this.cell.month, 'day': m }
                    let sub = TaskUtils.getEvents(tmpCell);
                    if (sub && sub.length > 0) {
                        for (let c of sub) {
                            c.day = `${this.cell.year}-${this.cell.month + 1}-${m}`
                            c.cell = tmpCell;
                        }
                        subLevelEvents = subLevelEvents.concat(sub);
                    }
                }
                for (let e of subLevelEvents) {
                    e.show = true;
                }
                this.subLevelEvents = subLevelEvents;
            } else if (this.cell.type == 'year') {
                // 展示月事件
                let subLevelEvents = []
                for (let m = 11; m >= 0; m--) {
                    let tmpCell = { type: 'month', year: this.cell.year, 'month': m };
                    let sub = TaskUtils.getEvents(tmpCell);
                    if (sub && sub.length > 0) {
                        for (let c of sub) {
                            c.day = `${this.cell.year}-${m + 1}`
                            c.cell = tmpCell;
                        }
                        subLevelEvents = subLevelEvents.concat(sub);
                    }
                }
                for (let e of subLevelEvents) {
                    e.show = true;
                }
                this.subLevelEvents = subLevelEvents;
            }

            console.log('子记录明细:', this.subLevelEvents);
        },
        addNewEvent() {
            const newEvent = {
                id: Date.now(),
                content: '',
                tags: [],
                time: this.currentTime,
                show: false,
                isEditing: true,
                isNew: true,
                expanded: false
            };
            this.events.push(newEvent);
        },
        deleteEvent(index) {
            const event = this.events[index];
            console.log('准备删除时间', event)
            if (TaskUtils.deleteEvent(this.cell, event.id)) {
                console.log('删除成功')
                this.events.splice(index, 1);
            } else {
                console.log('删除失败')
            }
        },
        deleteSubEvent(index) {
            const event = this.subLevelEvents[index];
            if (TaskUtils.deleteEvent(event.cell, event.id)) {
                this.subLevelEvents.splice(index, 1);
            }
        },
        toEditContent(e) {
            // 进入编辑状态
            e.show = false;
            // 等待DOM更新后获取焦点
            this.$nextTick(() => {
                const index = this.events.findIndex(event => event === e);
                // 使用uni-app的ref获取组件实例
                const query = uni.createSelectorQuery().in(this);
                query.select('#area' + index).node()
                    .exec((res) => {
                        if (res && res[0]) {
                            const textarea = res[0].node;
                            textarea.focus();
                        }
                    });
            });
        },
        onEventContentChange(e) {
            console.log('内容发生了变更', e.detail.value);
            if (e.detail.value) {
                // 保存内容
                this.save();
            }
        },
        onTimeChange(event, index) {
            this.events[index].time = event.detail.value;
            this.save();
        },

        showTagSelector(index) {
            this.events.forEach((event, i) => {
                if (i !== index) event.showTagSelector = false;
            });
            this.events[index].showTagSelector = !this.events[index].showTagSelector;
        },

        toggleTag(eventIndex, tag) {
            const event = this.events[eventIndex];
            const tagIndex = event.tags.indexOf(tag);
            if (tagIndex === -1) {
                event.tags.push(tag);
            } else {
                event.tags.splice(tagIndex, 1);
            }
            event.showTagSelector = false;
            this.save();
        },

        addNewTag() {
            if (this.newTag.trim()) {
                this.availableTags = TaskUtils.addTag(this.newTag.trim());
                console.log('添加了新标签：', this.availableTags);
                this.newTag = '';
            }
        },

        removeTag(eventIndex, tagIndex) {
            const event = this.events[eventIndex];
            event.tags.splice(tagIndex, 1);
            this.save();
        },
        cancel() {
            this.$emit('cancel')
        },
        toggleExpand(index) {
            this.$set(this.events[index], 'expanded', !this.events[index].expanded);
        },
        save() {
            // 删除内容为空的事件
            this.events = this.events.filter(event => {
                if (event.content.trim() === '') {
                    if (event.id) {
                        TaskUtils.deleteEvent(this.cell, event.id);
                    }
                    return false;
                }
                return true;
            });

            const validEvents = this.events
                .map(({ isEditing, isNew, ...event }) => {
                    isNew = event.id ? false : true;
                    console.log('   ')
                    if (isNew) {
                        return TaskUtils.createEvent(this.cell, event);
                    } else {
                        return TaskUtils.updateEvent(this.cell, event.id, event);
                    }
                });
            this.$emit('save', validEvents)
        }
    }
}
</script>

<style>
.event-manager {
    width: 100%;
}

.key-events-section {
    margin-bottom: 20px;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    display: block;
}

.event-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 15px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-dot {
    width: 8px;
    height: 8px;
    background-color: #FF5B5B;
    border-radius: 50%;
    margin-top: 13px;
    margin-right: 10px;
}

.event-content {
    flex: 1;
}

.content-wrapper {
    position: relative;
    width: 100%;
}

.event-content textarea {
    width: 100%;
    min-height: 35px;
    border: none;
    padding: 0;
    font-size: 14px;
    resize: none;
    overflow: hidden;
    transition: height 0.3s ease;
    box-sizing: border-box;
    line-height: 1.5;
}

.tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.tag-urgent {
    background-color: #FFE4E4;
    color: #D32F2F;
}

.tag-reminder {
    background-color: #E3F2FD;
    color: #1976D2;
}

.tag-daily {
    background-color: #E8F5E9;
    color: #388E3C;
}

.tag-note {
    background-color: #FFF3E0;
    color: #E64A19;
}

.tag-default {
    background-color: #F5F5F5;
    color: #666;
}

.tag-delete {
    font-size: 12px;
    color: #999;
    cursor: pointer;
    padding: 2px;
    line-height: 1;
}

.tag-delete:hover {
    color: #FF5B5B;
}

.tag-selector {
    position: relative;
    display: inline-block;
}

.tag-selector-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: #F5F5F5;
    cursor: pointer;
}

.add-tag-icon {
    font-size: 14px;
    color: #666;
}

.tag-selector-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 200px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 12px;
    margin-top: 8px;
    z-index: 1000;
}

.tag-list {
    max-height: 150px;
    overflow-y: auto;
    margin-bottom: 12px;
}

.tag-item {
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.tag-item:hover {
    background-color: #F5F5F5;
}

.tag-item-text {
    font-size: 14px;
    color: #333;
}

.tag-item-text.selected {
    color: #007AFF;
    font-weight: 500;
}

.tag-manage {
    display: flex;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

.new-tag-input {
    flex: 1;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.add-tag-btn {
    height: 32px;
    padding: 0 12px;
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-tag-btn:hover {
    background-color: #0066d6;
}

.event-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

.event-time {
    font-size: 12px;
    color: #999;
    margin-right: 10px;
    white-space: nowrap;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
    min-width: 0;
    align-items: center;
}

.delete-event {
    font-size: 16px;
    color: #999;
    padding: 0 5px;
    cursor: pointer;
}

.add-event-btn {
    width: 100%;
    height: 40px;
    background-color: #f8f8f8;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-top: 15px;
    color: #666;
    font-size: 14px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.add-event-btn:hover {
    background-color: #f0f0f0;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding: 0 5px;
}

.cancel-btn,
.save-btn {
    padding: 10px 24px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #666;
}

.cancel-btn:hover {
    background-color: #ebebeb;
}

.save-btn {
    background-color: #007AFF;
    color: white;
}

.save-btn:hover {
    background-color: #0066d6;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.floating-add-btn {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 50px;
    height: 50px;
    background-color: #007AFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0, 122, 255, 0.3);
    transition: transform 0.2s ease;
    z-index: 1000;
}

.floating-add-btn:active {
    transform: scale(0.95);
}

.floating-add-icon {
    color: white;
    font-size: 24px;
    font-weight: bold;
}

.record-pannel {
    margin: 20rpx 0 30rpx;
    padding: 20rpx;
    background: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.record-header {

    text-align: center;
}

.record-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.record-subtitle {
    font-size: 24rpx;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
}
</style>