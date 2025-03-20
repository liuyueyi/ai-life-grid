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
}