import { DateUtil } from './DateUtil.js';

export class FinanceUtil {
    static getFinanceKey(year, month, day) {
        return `finance_${year}_${month}_${day}`;
    }

    static loadData(year, month, day) {
        if (!month && !day) {
            // 加载整年的记录
            let records = [];
            for (let month = 12; month >= 0; month--) {
                for (let day = DateUtil.getDays(year, month); day > 0; day--) {
                    let r = FinanceUtil.getFinanceRecords(year, month, day);
                    if (r && r.length > 0) {
                        records = records.concat(r);
                    }
                }
            }
            return records;
        } else if (!day) {
            // 加载本月每一天的记录
            let records = [];
            for (let day = DateUtil.getDays(year, month); day > 0; day--) {
                let r = this.getFinanceRecords(year, month, day);
                if (r && r.length > 0) {
                    records = records.concat(r);
                }
            }
            return records;
        } else {
            // 日维度记录
            return this.getFinanceRecords(year, month, day);
        }
    }

    // 具体查询某一天的收支记录
    static getFinanceRecords(year, month, day) {
        const key = this.getFinanceKey(year, month, day);
        return uni.getStorageSync(key) || []
    }

    static deleteDayRecord(record) {
        // 删除记录
        const { year, month, day } = DateUtil.parseDateString(record.date);
        const financeKey = this.getFinanceKey(year, month, day);
        let records = uni.getStorageSync(financeKey) || []
        const filteredEvents = records.filter(e => e.id !== record.id);
        if (filteredEvents.length != records.length) {
            uni.setStorageSync(financeKey, filteredEvents);
            return true;
        }
    }

    static saveDayRecord(record) {
        // 添加记录
        const { year, month, day } = DateUtil.parseDateString(record.date);
        const financeKey = this.getFinanceKey(year, month, day);
        let records = uni.getStorageSync(financeKey) || []
        const index = records.findIndex(e => e.id === record.id);
        if (index !== -1) {
            // 做更新逻辑
            records[index] = record;
            uni.setStorageSync(financeKey, records);
            return true;
        } else {
            // 做新增逻辑
            records.push(record);
            uni.setStorageSync(financeKey, records);
            return true;
        }
    }

    // 对financeRecords进行排序的方法
    static sortFinanceRecords(financeRecords) {
        // 按照日期倒序排列，如果日期相同则按照id倒序排列
        financeRecords.sort((a, b) => {
            // 先转换日期为时间戳进行比较
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (dateA === dateB) {
                // 日期相同时，按照id倒序排列
                return b.id - a.id;
            }
            // 日期不同时，按照日期倒序排列
            return dateB - dateA;
        });
    }


    static getCategoryIcon(category) {
        const icons = {
            // 收入类
            '工资': '💰',
            '奖金': '🎁',
            '投资': '📈',
            '礼金': '🧧',
            '兼职': '💼',
            '理财': '🏦',
            '其他': '🔄',
            // 支出类
            '购物': '🛒',
            '食物': '🍴',
            '手机': '📱',
            '娱乐': '🎮',
            '教育': '📚',
            '美容': '💄',
            '运动': '⚽',
            '社交': '🤝',
            '交通': '🚗',
            '衣服': '👔',
            '汽车': '🚘',
            '酒': '🍺',
            '烟': '🚬',
            '电子': '💻',
            '旅行': '✈️',
            '医疗': '🏥',
            '宠物': '🐱',
            '维修': '🔧',
            '住房': '🏠',
            '厨房': '🍳',
            '礼物': '🎀',
            '捐款': '❤️',
            '彩票': '🎰',
            '零食': '🍪'
        };
        return icons[category] || '⚪';
    }

}