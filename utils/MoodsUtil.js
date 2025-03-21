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

    static quotes = [
        "生活就像一盒巧克力，你永远不知道会得到什么",
        "每天都是新的开始",
        "微笑是最好的化妆品",
        "生活是一场旅行，享受每一刻",
        "简单的快乐是最好的快乐",
        '溪水从不抱怨曲折，却能雕刻出千峰万壑',
        '云朵没有目的地飘荡，却为天空写下诗行',
        '星光不问归处，只在黑暗中点亮温柔',
        '雨滴穿透岩石，不是力量而是坚持的勋章',
        '秋叶飘落时最绚烂，因为它已读懂离别的美学',
        '时钟的指针不是在追赶时间，而是在丈量生命的浓度',
        '昨日若是美好的标本，就请封存在记忆的琉璃罐',
        '未来像未拆封的信笺，重要的是写当下的真心',
        '老年人眼角的皱纹，是岁月颁发给勇者的勋章',
        '童年的纸飞机飞不过屋檐，却永远盘旋在记忆的天空',
        '心灵的伤口结痂后，会绽放出比花瓣更坚韧的光泽',
        '愤怒是烧红的铁块，冷静下来才能锻造成有用的工具',
        '自私是心灵的牢笼，打开门窗才能拥抱世界的美好',
        '猜疑是蒙住眼睛的布，掀开它才能看见星辰大海',
        '悔恨是长在心口的刺青，提醒我们如何更好地爱自己',
        '说话像放风筝，线太紧会断，线太松会迷失',
        '听见不同声音时，不妨先给自己的耳朵戴上一朵花',
        '争执时记得：赢家不一定是正确的，但必须是体面的',
        '送人玫瑰时，别忘了给自己留一枝带刺的茎秆',
        '生活不是密室逃脱，钥匙就藏在犯错的密码里',
        '烹饪的香气是家的指纹，即使走遍世界也能被认出',
        '清晨的阳光是免费的拥抱，夜晚的月光是无声的晚安',
        '老旧的书页里藏着时光的密码，翻动时会飘出咖啡香',
        '衣柜里最喜欢的衣服，总在最适合它的季节出现',
        '路边野花的生命力，不在花园的栽培而在自由的生长',
        '窗台上的绿萝在默默计算阳光的利息',
        '沙漏里的每粒砂都是时间银行的小股东',
        '电梯按钮的排列暗合人生的进退哲学',
        '冰箱贴下藏着家庭记忆的温度密码',
        '充电宝的百分比提醒我们爱要及时续航',
        '地铁隧道的风是城市的心跳声',
        '满墙的网红打卡照像未拆封的明信片',
        '外卖骑手的电瓶车划破黄昏的等高线',
        '办公室的绿植在无声抗议996的时差',
        '智能手表的震动是数字化生存的脉搏',
        '书架上的畅销书像等待被翻开的命运之卷',
        '知识付费课程是时代的速溶智慧胶囊',
        '社交媒体点赞数是虚荣心的温度计',
        '电子书阅读器的夜间模式贩卖着孤独',
        '视频网站的自动连播是时间的黑洞漩涡',
        '焦虑是大脑的错误报警系统',
        '孤独是灵魂的4K高清模式',
        '愤怒是烧毁理智的野火，灰烬里藏着珍珠',
        '悲伤是心碎后长出的水晶荆棘',
        '喜悦是灵魂的烟火表演，转瞬即逝却照亮永恒',
        '年龄不是生命的刻度，皱纹才是时光的等高线',
        '病毒隔离期是被迫暂停的哲学课',
        '哺乳期的母亲拥有全世界最温暖的磁场',
        '老年手机的字体放大是时代的温柔妥协',
        '临终关怀病房的灯光是生命最后的亮度调节',
        '蓝牙耳机里的音乐是数字化的灵魂避难所',
        '电子相册用像素囚禁了记忆的鲜活',
        '游戏成就系统在虚拟世界贩卖着存在感',
        '短视频滤镜是现代人的美颜谎言',
        '人工智能客服听不懂人类最深的叹息',
        '泡茶时看茶叶沉浮，如同观照人生的起落',
        '溪边垂钓者钓起的不是鱼，是时间的涟漪',
        '宅家追剧时，遥控器是穿越时空的任意门',
        '公园长椅上看云卷云舒，是免费的哲学治疗',
        '夜跑时的耳机里，播放着自我对话的独白',
        '元宇宙中的虚拟形象在模仿人类的灵魂皱褶',
        '无人机配送的包裹里装着被解构的人际温度',
        '基因编辑技术正在重写生命的原始代码',
        '人工智能作诗是机械在模仿灵魂的颤抖',
        '太空站的晨昏线是人类探索未知的刻度尺',
        '最明亮的星空在光污染最严重的城市上空',
        '最深的海沟里藏着地球最古老的秘密',
        '最快的网络延时着人类的情感共振',
        '最先进的医疗技术治不好现代人的精神感冒',
        '最豪华的酒店房间里住着最孤独的灵魂',
        '旧课桌的刻痕是青春的密码本',
        '火车站票根是人生旅程的邮票收藏',
        '工资条的数字是成年人的温度计',
        '医院CT片的阴影里藏着生命的乐谱',
        '橡皮筋扎头发时，绾住的是流逝的晨光',
        '读书是给大脑安装升级包',
        '冥想是系统的杀毒程序',
        '旅行是给灵魂做CT扫描',
        '写作是记忆的3D打印',
        '跳舞是肢体的自由编程',
        '加班族的眼袋里蓄着未眠的星辰',
        '网红店的排队队伍是现代人的朝圣路线',
        '直播间的打赏是数字化的功德箱',
        '自动贩卖机提供24小时的人生选择',
        '密室逃脱游戏是成年人玩的现实解谜',
        '阳台的多肉植物在计算阳光的利息',
        '晾衣绳上的衬衫在跳着风的芭蕾',
        '厨房油烟机的轰鸣是美食的交响乐前奏',
        '卫生间的镜子每天清晨都重新发明世界',
        '楼道声控灯是夜晚的守夜人',
        '我们用手机拍摄世界，却遗失了凝视的能力',
        '选择困难症是自由意志的甜蜜副作用',
        '完美主义是给自己设定的精神迷宫',
        '社交恐惧症是保持灵魂纯度的免疫系统',
        '存在焦虑是生命意识觉醒的副产品',
    ]

    static getRandomQuote() {
        const index = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[index];
    }

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
        const key = this.getMoodKey(cell);
        console.log('查询某一天/月/年的心情日志列表', cell, key);
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
        console.log('心情对应的key是', key);
        uni.setStorageSync(key, moods);
    }

    static buildCell(mood) {
        let { year, month, day } = DateUtil.parseDateString(mood.moodDate.date)
        return {
            type: mood.type,
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
        console.log('保存心情记录:', cell, JSON.stringify(moods));
    }

    static deleteMoodByDetail(mood) {
        const cell = this.buildCell(mood);
        this.deleteMoodById(cell, mood.id);
    }

    static deleteMoodById(cell, id) {
        const key = this.getMoodKey(cell);
        let records = this.getMoods(cell);
        const filteredEvents = records.filter(e => e.id !== id);
        if (records.length !== filteredEvents.length) {
            // 删除日志
            uni.setStorageSync(key, filteredEvents);
            return true;
        }
        return false;
    }
}