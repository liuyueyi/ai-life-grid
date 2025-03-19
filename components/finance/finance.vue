<template>
    <view class="finance-tab" @scroll="handleScroll">
        <!-- 悬浮按钮 -->
        <view class="float-button" @click="showRecorder" v-if="!isRecorderVisible" :style="{ opacity: buttonOpacity }">
            <text class="plus-icon">+</text>
        </view>

        <!-- 总资产卡片 -->
        <view class="finance-summary">
            <view class="total-assets">
                <text class="assets-label">总资产</text>
                <text class="assets-value">¥{{ getBalance() }}</text>
            </view>
            <view class="assets-details">
                <view class="detail-item">
                    <text class="detail-label">总收入</text>
                    <text class="detail-value income">{{ getTotalIncome() }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-label">总支出</text>
                    <text class="detail-value expense">{{ getTotalExpense() }}</text>
                </view>
            </view>
        </view>

        <!-- 记账面板 -->
        <view class="finance-recoder" v-if="isRecorderVisible">

            <view class="finance-type-switch">
                <view class="switch-wrapper">
                    <view :class="['switch-item', currentType === 'expense' ? 'active' : '']"
                        @click="switchType('expense')">支出
                    </view>
                    <view :class="['switch-item', currentType === 'income' ? 'active' : '']"
                        @click="switchType('income')">收入
                    </view>
                </view>
                <view class="close-btn" @click="hideRecorder">
                    <text class="iconfont">×</text>
                </view>
            </view>
            <!-- 分类图标网格 -->
            <view class="category-grid">
                <view v-for="(category, index) in currentCategories" :key="index"
                    :class="['category-item', selectedCategory === category ? 'selected' : '']"
                    @click="selectCategory(category)">
                    <view class="category-icon">
                        <text class="iconfont">{{ getCategoryIcon(category) }}</text>
                    </view>
                    <text class="category-name">{{ category }}</text>
                </view>
            </view>

            <!-- 计算器区域 -->
            <view class="calculator" v-if="selectedCategory">
                <view class="calc-display">
                    <input class="remark-input" v-model="remark" placeholder="添加备注..." :adjust-position="false" />
                    <text class="calc-process">{{ calcProcess }}</text>
                    <text class="calc-result">{{ currentAmount || '0' }}</text>
                </view>
                <view class="calc-keypad">
                    <view class="keypad-row">
                        <view class="keypad-key" @click="appendNumber('7')">7</view>
                        <view class="keypad-key" @click="appendNumber('8')">8</view>
                        <view class="keypad-key" @click="appendNumber('9')">9</view>
                        <view class="keypad-key operator" @click="resetRecord">重置</view>
                    </view>
                    <view class="keypad-row">
                        <view class="keypad-key" @click="appendNumber('4')">4</view>
                        <view class="keypad-key" @click="appendNumber('5')">5</view>
                        <view class="keypad-key" @click="appendNumber('6')">6</view>
                        <view class="keypad-key operator" @click="addRecord">+</view>
                    </view>
                    <view class="keypad-row">
                        <view class="keypad-key" @click="appendNumber('1')">1</view>
                        <view class="keypad-key" @click="appendNumber('2')">2</view>
                        <view class="keypad-key" @click="appendNumber('3')">3</view>
                        <view class="keypad-key operator" @click="subRecorder">-</view>
                    </view>
                    <view class="keypad-row">
                        <view class="keypad-key" @click="appendNumber('.')">.</view>
                        <view class="keypad-key" @click="appendNumber('0')">0</view>
                        <view class="keypad-key" @click="deleteNumber">⌫</view>
                        <view class="keypad-key equal" @click="saveRecord">保存</view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 记录列表 -->
        <view class="finance-list">
            <view v-for="(record, index) in financeRecords" :key="index" class="finance-item"
                @click="editRecord(record)" @longpress="showDeleteConfirm(record)">
                <view :class="['record-icon', record.type === 'income' ? 'income-bg' : 'expense-bg']">
                    <text class="iconfont">{{ getCategoryIcon(record.category) }}</text>
                </view>
                <view class="record-info">
                    <text class="record-category">{{ record.category }}</text>
                    <text class="record-date" style="padding-left: 1rem;">{{ formatDate(record.date) }}</text>
                    <text v-if="record.remark" class="record-remark">{{ record.remark }}</text>
                </view>
                <text :class="['record-amount', record.type === 'income' ? 'income' : 'expense']">
                    {{ record.type === 'income' ? '+' : '-' }}{{ record.amount }}
                </text>
            </view>
            <view v-if="!financeRecords || financeRecords.length == 0" class="empty-tips">
                <view class="empty-icon"></view>
                <view class="empty-title">💡 使用小贴士</view>
                <view class="empty-desc">
                    <text>• 点击右下角"+"按钮新增记录</text>
                    <text>• 点击记录查看/编辑详情</text>
                    <text>• 长按记录可以删除</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'Finance',
    props: {
        storageKey: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isRecorderVisible: false,
            currentType: 'expense',
            currentAmount: '',
            selectedCategory: '',
            remark: '',
            financeRecords: [],
            buttonOpacity: 0.3,
            scrollTimeout: null,
            incomeCategories: ['工资', '奖金', '投资', '礼金', '兼职', '理财', '其他'],
            expenseCategories: ['购物', '食物', '手机', '娱乐', '教育', '美容', '运动', '社交', '交通', '衣服', '汽车', '酒', '烟', '电子', '旅行', '医疗', '宠物', '维修', '住房', '厨房', '礼物', '捐款', '彩票', '零食'],
            tempAmount: '',
            operator: '',
            calcProcess: '',
            calRes: false,
            editingRecordId: null,
        };
    },
    computed: {
        currentCategories() {
            return this.currentType === 'income' ? this.incomeCategories : this.expenseCategories;
        }
    },
    created() {
        this.loadData();
    },
    methods: {
        handleScroll() {
            this.buttonOpacity = 1;
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            this.scrollTimeout = setTimeout(() => {
                this.buttonOpacity = 0.3;
            }, 1500);
        },
        loadData() {
            const financeKey = `${this.storageKey}_finance`;
            this.financeRecords = uni.getStorageSync(financeKey) || [];
        },
        saveData() {
            const financeKey = `${this.storageKey}_finance`;
            uni.setStorageSync(financeKey, this.financeRecords);
            this.$emit('save', this.financeRecords);
        },
        showDeleteConfirm(record) {
            uni.showModal({
                title: '删除确认',
                content: `确定要删除这条${record.type === 'income' ? '收入' : '支出'}记录吗？`,
                success: (res) => {
                    if (res.confirm) {
                        this.deleteRecord(record);
                    }
                }
            });
        },

        deleteRecord(record) {
            const index = this.financeRecords.findIndex(item => item.id === record.id);
            if (index !== -1) {
                this.financeRecords.splice(index, 1);
                this.saveData();
                uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                });
            }
        },
        showRecorder() {
            this.isRecorderVisible = true;
        },
        editRecord(record) {
            this.currentType = record.type;
            this.selectedCategory = record.category;
            this.currentAmount = record.amount;
            this.remark = record.remark || '';
            this.editingRecordId = record.id;
            this.calcProcess = record.calcProcess || '';
            this.showRecorder();
        },
        hideRecorder() {
            this.isRecorderVisible = false;
            this.resetForm();
            this.resetRecord();
            this.editingRecordId = null;
        },
        resetForm() {
            this.currentType = 'expense';
            this.selectedCategory = '';
            this.currentAmount = '';
            this.remark = '';
            this.resetRecord();
        },
        switchType(type) {
            this.currentType = type;
            this.selectedCategory = '';
            this.currentAmount = '';
            this.remark = '';
        },
        selectCategory(category) {
            this.selectedCategory = category;
        },
        appendNumber(num) {
            if (this.calRes) {
                // 表示当前显示的金额为上次计算的结果，此时我们需要清空当前输入的金额,显示当前输入的数据
                this.currentAmount = '';
                this.calRes = false;
            }
            if (num === '.' && this.currentAmount.includes('.')) return;
            if (this.currentAmount.includes('.') && this.currentAmount.split('.')[1].length >= 2) return;
            this.currentAmount = this.currentAmount + num;
            if (!this.operator) {
                this.calcProcess = this.currentAmount;
            }
        },
        deleteNumber() {
            if (this.calRes) {
                this.currentAmount = '';
                return;
            }
            this.currentAmount = this.currentAmount.slice(0, -1);
        },
        resetRecord() {
            this.currentAmount = '';
            this.tempAmount = '';
            this.operator = '';
            this.calcProcess = '';
            this.calRes = false;
        },
        formatNumber(num) {
            if (!num) return '0';
            const str = parseFloat(num).toFixed(2);
            if (str.endsWith('.00')) {
                return parseInt(str);
            } else if (str.endsWith('0')) {
                return parseFloat(str).toFixed(1);
            }
            return str;
        },
        addRecord() {
            if (this.calRes) {
                if (this.operator === '-') {
                    // 如果已有运算符且为减号，切换为加号
                    this.operator = '+';
                    this.calcProcess = this.calcProcess.slice(0, -2) + '+ ';
                }
                return;
            }
            if (!this.currentAmount) return;
            if (!this.operator) {
                this.tempAmount = this.currentAmount;
                this.operator = '+';
                this.currentAmount = '';
                this.calcProcess = this.tempAmount + ' + ';
            } else {
                const prevAmount = parseFloat(this.tempAmount || 0);
                const currAmount = parseFloat(this.currentAmount);
                let result;

                if (this.operator === '+') {
                    result = prevAmount + currAmount;
                } else if (this.operator === '-') {
                    result = prevAmount - currAmount;
                }

                this.tempAmount = this.formatNumber(result.toFixed(2));
                this.operator = '+';
                this.calcProcess = this.calcProcess + this.currentAmount + ' + ';
                this.currentAmount = result;
                this.calRes = true;
            }
        },
        subRecorder() {
            if (this.calRes) {
                if (this.operator === '+') {
                    // 如果已有运算符且为加号，切换为减号
                    this.operator = '-';
                    this.calcProcess = this.calcProcess.slice(0, -2) + '- ';
                }
                return;
            }
            if (!this.currentAmount) return;
            if (!this.operator) {
                this.tempAmount = this.currentAmount;
                this.operator = '-';
                this.currentAmount = '';
                this.calcProcess = this.tempAmount + ' - ';
            } else {
                const prevAmount = parseFloat(this.tempAmount || 0);
                const currAmount = parseFloat(this.currentAmount);
                let result;

                if (this.operator === '+') {
                    result = prevAmount + currAmount;
                } else if (this.operator === '-') {
                    result = prevAmount - currAmount;
                }

                this.tempAmount = this.formatNumber(result.toFixed(2));
                this.operator = '-';
                this.calcProcess = this.calcProcess + this.currentAmount + ' - ';
                this.currentAmount = result;
                this.calRes = true;
            }
        },
        saveRecord() {
            // 先进行一次计算，再保存结果
            if (this.operator) {
                if (this.operator === '+') {
                    this.addRecord();
                } else if (this.operator === '-') {
                    this.subRecorder();
                }
            }

            if (!this.selectedCategory || !this.currentAmount) {
                uni.showToast({
                    title: '请选择分类和输入金额',
                    icon: 'none'
                });
                return;
            }

            const recordData = {
                type: this.currentType,
                category: this.selectedCategory,
                calcProcess: this.calcProcess,
                amount: parseFloat(this.currentAmount).toFixed(2),
                remark: this.remark
            };

            if (this.editingRecordId) {
                // 更新已有记录
                const index = this.financeRecords.findIndex(record => record.id === this.editingRecordId);
                if (index !== -1) {
                    this.financeRecords[index] = {
                        ...this.financeRecords[index],
                        ...recordData,
                        date: new Date()
                    };
                }
            } else {
                // 添加新记录
                this.financeRecords.unshift({
                    ...recordData,
                    id: Date.now(),
                    date: new Date()
                });
            }

            this.hideRecorder();
            this.saveData();
            this.resetForm();
        },
        formatDate(date) {
            if (!date) return '';
            if (typeof date === 'string') {
                date = new Date(date);
            }
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        },
        getTotalIncome() {
            return this.financeRecords
                .filter(record => record.type === 'income')
                .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0)
                .toFixed(2);
        },
        getTotalExpense() {
            return this.financeRecords
                .filter(record => record.type === 'expense')
                .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0)
                .toFixed(2);
        },
        getBalance() {
            return (parseFloat(this.getTotalIncome()) - parseFloat(this.getTotalExpense())).toFixed(2);
        },
        getCategoryIcon(category) {
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
};
</script>

<style>
@import './finance.css';
</style>