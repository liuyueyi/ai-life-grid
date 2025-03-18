<template>
    <view class="event-manager">
        <view class="key-events-section">
            <text class="section-title">一点一滴</text>
            <view v-for="(event, index) in events" :key="index" class="event-item">
                <input type="text" v-model="events[index].content" placeholder="记录点滴事件..."
                    @input="onEventContentChange" />
                <text class="delete-event" @click="deleteEvent(index)">×</text>
            </view>
            <button class="add-event-btn" @click="addNewEvent">添加点滴事件</button>
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
            events: []
        }
    },
    watch: {
        cell: {
            immediate: true,
            handler(newEvents) {
                console.log('cell发生了变更 = ', this.newEvents)
                this.events = TaskUtils.getEvents(this.cell);
                console.log('cell发生了变更，读取的内容是：', this.cell, this.events);
            }
        },

    },
    data() {
        return {
            visible: false,
            events: []
        }
    },
    methods: {
        addNewEvent() {
            const newEvent = {
                content: '',
                tags: [],
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
    align-items: center;
    margin-bottom: 10px;
}

.event-item input {
    flex: 1;
    height: 35px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 10px;
    margin-right: 10px;
}

.delete-event {
    font-size: 20px;
    color: #999;
    padding: 0 5px;
    cursor: pointer;
}

.add-event-btn {
    width: 100%;
    height: 35px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
    margin-top: 10px;
    color: #666;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.cancel-btn,
.save-btn {
    padding: 8px 20px;
    border-radius: 4px;
    border: none;
}

.cancel-btn {
    background-color: #f0f0f0;
    color: #666;
}

.save-btn {
    background-color: #007AFF;
    color: white;
}
</style>