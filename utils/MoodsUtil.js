import { DateUtil } from "./DateUtil";

export class MoodsUtil {
    static activities = [
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
    ]

    static getActivityById(id) {
        return this.activities.find(activity => activity.id === id)
    }

    static loadAllActivity() {
        const key = 'mood_activities'
        return uni.getStorageSync(key) || this.activities;
    }

    static saveActivity(records) {
        uni.setStorageSync('mood_activities', records);
    }

    static addActivity(icon, name) {
        let totals = this.loadAllActivity()
        // 判断是否存在重复的
        let findIndex = totals.findIndex(e => e.icon == icon && e.name == name);
        if (findIndex !== -1) {
            // 出现了重复
            uni.showToast({
                title: '活动已存在',
                icon: 'none',
                duration: 2000
            });
            return totals;
        }

        totals.push({
            id: Date.now(),
            icon: icon,
            name: name
        })
        this.saveActivity(totals);
        return totals;
    }


    /**
     *  删除标签
     * @param {标签id} id 
     * @returns 
     */
    static deleteActivity(id) {
        let totals = this.loadAllActivity();
        const filteredEvents = totals.filter(e => e.id !== id);
        if (events.length !== filteredEvents.length) {
            this.saveActivity(filteredEvents);
            return true;
        }
        return false;
    }

    static updateActivity(activity) {
        if (!activity.id) {
            return this.addActivity(activity.icon, activity.name);
        }

        let totals = this.loadAllActivity();
        const index = totals.findIndex(e => e.id === activity.id);
        if (index !== -1) {
            // 做更新逻辑
            totals[index] = activity;
            this.saveActivity(totals);
            return true;
        } else {
            // 做新增逻辑
            totals.push(activity);
            this.saveActivity(totals);
            return true;
        }
    }

    static getMoodKey(cell) {
        let { type, year, month, day } = cell;
        if (!type) {
            if (day) type = 'day';
            else if (month) type = 'month';
            else type = 'year';
        }
        let key = `moods_${type}_${year}`;
        if (type == 'year') return key;
        if (month !== undefined && month != null) key += `_${month}`;
        if (type == 'month') return key;
        if (day !== undefined && day != null) key += `_${day}`;
        return key;
    }

    /**
     * 查询某一天/月/年的心情日志列表
     * @param {年月日-类型} cell 
     * @returns 
     */
    static getMoods(cell) {
        console.log('查询某一天/月/年的心情日志列表', cell)
        const key = this.getMoodKey(cell);
        return uni.getStorageSync(key) || []
    }

    /**
     * 查询某一个具体的心情日志
     * @param {年月日-类型} cell 
     * @param {心情日志id} id 
     * @returns 
     */
    static getMood(cell, id) {
        const moods = this.getMoods(cell);
        if (moods.length === 0) return null;
        return moods.find(e => e.id == id)
    }

    static insertMood(cell, moods) {
        const key = this.getMoodKey(cell);
        uni.setStorageSync(key, moods);
    }

    static buildCell(mood) {
        let { year, month, day } = DateUtil.parseDateString(mood.moodDate.date)
        let { type } = mood.type;
        return {
            type: type,
            year: year,
            month: month,
            day: day
        };
    }

    /**
  * 根据moodDate中的time进行倒排
  * @param {Array} moods - 心情数组
  * @returns {Array} 排序后的心情数组
  */
    static sortMoodsByTime(moods) {
        return moods.sort((a, b) => {
            const timeA = a.moodDate.time.split(':').map(Number);
            const timeB = b.moodDate.time.split(':').map(Number);
            const dateA = new Date(0, 0, 0, timeA[0], timeA[1]);
            const dateB = new Date(0, 0, 0, timeB[0], timeB[1]);
            return dateB - dateA; // 倒序排序
        });
    }


    static saveMood(mood) {
        const cell = this.buildCell(mood);
        const moods = this.getMoods(cell);
        // 判断是否存在重复的
        let findIndex = moods.findIndex(e => e.id === mood.id);
        if (findIndex !== -1) {
            // 采用更新逻辑
            moods[findIndex] = mood;
        } else {
            // 新增
            moods.push(mood);
        }
        this.sortMoodsByTime(moods);
        this.insertMood(cell, moods);
    }

    static deleteMoodByDetail(mood) {
        const cell = this.buildCell(mood);
        this.deleteMoodById(cell, mood.id);
    }

    static deleteMoodById(cell, id) {
        let records = this.getMoods(cell);
        const filteredEvents = records.filter(e => e.id !== id);
        if (events.length !== filteredEvents.length) {
            // 删除日志
            uni.setStorageSync(key, filteredEvents);
            return true;
        }
        return false;
    }
}