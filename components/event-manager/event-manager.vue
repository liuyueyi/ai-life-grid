<template>
    <view class="event-manager">
        <view class="key-events-section">
            <text class="section-title">一点一滴</text>
            <view v-for="(event, index) in events" :key="index" class="event-item">
                <view class="event-dot"></view>
                <view class="event-content">
                    <input type="text" v-model="events[index].content" placeholder="记录点滴事件..." @input="onEventContentChange" />
                    <view class="event-tags">
                        <text v-for="(tag, tagIndex) in event.tags" :key="tagIndex" class="tag">{{tag}}</text>
                        <view class="tag-selector">
                            <view class="tag-selector-trigger" @click="showTagSelector(index)">
                                <text class="add-tag-icon">+</text>
                            </view>
                            <view class="tag-selector-dropdown" v-if="events[index].showTagSelector">
                                <view class="tag-list">
                                    <view v-for="(tag, tagIndex) in availableTags" :key="tagIndex" 
                                          class="tag-item" @click="toggleTag(index, tag)">
                                        <text class="tag-item-text" :class="{ 'selected': events[index].tags.includes(tag) }">{{tag}}</text>
                                    </view>
                                </view>
                                <view class="tag-manage">
                                    <input type="text" v-model="newTag" placeholder="添加新标签" class="new-tag-input" />
                                    <button class="add-tag-btn" @click="addNewTag">添加</button>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="event-time">
                    <picker mode="time" :value="events[index].time || currentTime" start="00:00" end="23:59" @change="onTimeChange($event, index)">
                        <text>{{events[index].time || currentTime}}</text>
                    </picker>
                </view>
                <text class="delete-event" @click="deleteEvent(index)">×</text>
            </view>
            <button class="add-event-btn" @click="addNewEvent">+</button>
        </view>
        <view class="button-group">
            <button class="cancel-btn" @click="cancel">取消</button>
            <button class="save-btn" @click="save">保存</button>
        </view>
    </view>
</template>

<script>
import { TaskUtils } from '../../utils/TaskUtils.js';

export default {
    name: 'EventManager',
    props: {
        cell: {
            type: Object,
            default: () => { }
        },
    },
    data() {
        return {
            events: [],
            currentTime: '',
            availableTags: [],
            newTag: '',
            visible: false
        }
    },
    watch: {
        cell: {
            immediate: true,
            handler(newEvents) {
                console.log('cell发生了变更 = ', newEvents);
                this.events = TaskUtils.getEvents(this.cell);
                console.log('cell发生了变更，读取的内容是：', this.cell, this.events);
            }
        },
    },
    created() {
        this.updateCurrentTime();
        this.availableTags = TaskUtils.initDefaultTags();
        console.log('初始化的内容', this.availableTags);
    },

    methods: {
        updateCurrentTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            this.currentTime = `${hours}:${minutes}`;
        },
        addNewEvent() {
            const newEvent = {
                content: '',
                tags: [],
                time: this.currentTime,
                isEditing: true,
                isNew: true
            };
            const createdEvent = TaskUtils.createEvent(this.cell, newEvent);
            this.events.push(createdEvent);
        },
        deleteEvent(index) {
            const event = this.events[index];
            if (TaskUtils.deleteEvent(this.cell, event.id)) {
                this.events.splice(index, 1);
            }
        },
        onEventContentChange() {
            // 事件内容变更时可以添加额外处理
        },

        onTimeChange(event, index) {
            this.events[index].time = event.detail.value;
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
        },

        addNewTag() {
            if (this.newTag.trim()) {
                this.availableTags = TaskUtils.addTag(this.newTag.trim());
                console.log('添加了新标签：', this.availableTags);
                this.newTag = '';
            }
        },
        cancel() {
            this.$emit('cancel')
        },
        save() {
            console.log('保存的内容是：', this.cell, this.events);
            const validEvents = this.events
                .filter(event => event.content.trim() !== '')
                .map(({ isEditing, isNew, ...event }) => {
                    isNew = event.id ? false : true;
                    if (isNew) {
                        console.log('新建事件', this.cell, event)
                        return TaskUtils.createEvent(this.cell, event);
                    } else {
                        console.log('更新事件', this.cell, event)
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

.event-content input {
    width: 100%;
    height: 35px;
    border: none;
    padding: 0;
    font-size: 14px;
}

.event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.tag {
    padding: 2px 8px;
    background-color: #F5F5F5;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
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

.event-time {
    font-size: 12px;
    color: #999;
    margin-right: 10px;
    white-space: nowrap;
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
</style>