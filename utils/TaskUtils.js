// TaskUtils.js - 事件管理工具类

export class TaskUtils {
    // 生成存储键名
    static generateStorageKey(params) {
        const { type, year, month, week, day } = params;
        let key = `events_${type}_${year}`;
        if (month !== undefined && month != null) key += `_${month}`;
        if (week !== undefined && week != null) key += `_w${week}`;
        if (day !== undefined && day != null) key += `_${day}`;
        return key;
    }

    static hasEvents(params) {
        return this.getEvents(params).length > 0;
    }

    // 获取事件列表
    static getEvents(params) {
        const key = this.generateStorageKey(params);
        console.log('获取时间列表的key = ', key);
        return uni.getStorageSync(key) || [];
    }

    // 创建新事件
    static createEvent(params, eventData) {
        const events = this.getEvents(params);
        const newEvent = {
            id: Date.now(),
            ...eventData,
            tags: eventData.tags || [],
            autoRemind: eventData.autoRemind || false,
            completed: eventData.completed || false
        };
        events.push(newEvent);
        this.saveEvents(params, events);
        return newEvent;
    }

    // 更新事件
    static updateEvent(params, eventId, eventData) {
        const events = this.getEvents(params);
        const index = events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            const updatedEvent = {
                ...events[index],
                ...eventData,
                tags: eventData.tags || events[index].tags
            };
            events[index] = updatedEvent;
            this.saveEvents(params, events);
            return updatedEvent;
        } else {
            // 没找到，则走save逻辑
            console.error(`Event with ID ${eventId} not found.`);
            events.push(eventData);
            this.saveEvents(params, events);
            return eventData;
        }
    }

    // 删除事件
    static deleteEvent(params, eventId) {
        const events = this.getEvents(params);
        const filteredEvents = events.filter(e => e.id !== eventId);
        if (events.length !== filteredEvents.length) {
            this.saveEvents(params, filteredEvents);
            return true;
        }
        return false;
    }

    // 批量保存事件
    static saveEvents(params, events) {
        const key = this.generateStorageKey(params);
        uni.setStorageSync(key, events);
    }

    // 标签管理
    static initDefaultTags() {
        const defaultTags = ['紧急', '提醒', '日常', '备注'];
        const existingTags = this.getAvailableTags();
        if (existingTags.length === 0) {
            this.saveAvailableTags(defaultTags);
        }
        return this.getAvailableTags();
    }

    static getAvailableTags() {
        return uni.getStorageSync('availableTags') || [];
    }

    static saveAvailableTags(tags) {
        uni.setStorageSync('availableTags', tags);
    }

    static addTag(tag) {
        const tags = this.getAvailableTags();
        if (!tags.includes(tag)) {
            tags.push(tag);
            this.saveAvailableTags(tags);
        }
        return tags;
    }
}

export default TaskUtils;