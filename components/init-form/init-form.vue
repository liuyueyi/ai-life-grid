<template>
  <view class="setup-container">
    <view class="setup-title">人生格子</view>
    <view class="setup-form">
      <view class="form-item">
        <text class="label">出生日期</text>
        <picker mode="date" :value="birthDate" @change="onBirthDateChange">
          <view class="picker-value">{{ birthDate || '请选择出生日期' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">上学开始时间</text>
        <picker mode="date" fields="month" :value="schoolStartDate" @change="onSchoolStartChange">
          <view class="picker-value">{{ schoolStartDate || '请选择上学开始时间' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">学历范围</text>
        <picker :range="educationLevels" :value="educationLevelIndex" @change="onEducationLevelChange">
          <view class="picker-value">{{ educationLevels[educationLevelIndex] || '请选择学历范围' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">工作开始时间</text>
        <picker mode="date" fields="month" :value="workStartDate" @change="onWorkStartChange">
          <view class="picker-value">{{ workStartDate || '请选择工作开始时间' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">预计退休时间</text>
        <picker mode="date" fields="month" :value="retirementDate" @change="onRetirementChange">
          <view class="picker-value">{{ retirementDate || '请选择预计退休时间' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">预计寿命</text>
        <picker mode="selector" :range="lifeExpectancyOptions" :value="lifeExpectancyIndex"
          @change="onLifeExpectancyChange">
          <view class="picker-value">{{ lifeExpectancyOptions[lifeExpectancyIndex] || '请选择预计寿命' }}</view>
        </picker>
      </view>

      <button class="submit-btn" @click="initializeLifeGrid">开始我的人生格子</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'InitForm',
  data() {
    return {
      birthDate: '',
      schoolStartDate: '',
      educationLevels: ['小学', '初中', '高中', '职高', '大专', '大学', '硕士', '博士'],
      educationLevelIndex: 5, // 默认大学
      workStartDate: '',
      retirementDate: '',
      lifeExpectancyOptions: ['70岁', '75岁', '80岁', '85岁', '90岁', '95岁', '100岁'],
      lifeExpectancyIndex: 2, // 默认80岁
    };
  },
  methods: {
    // 表单相关方法
    onBirthDateChange(e) {
      this.birthDate = e.detail.value;
    },
    onSchoolStartChange(e) {
      this.schoolStartDate = e.detail.value;
    },
    onEducationLevelChange(e) {
      this.educationLevelIndex = e.detail.value;
    },
    onWorkStartChange(e) {
      this.workStartDate = e.detail.value;
    },
    onRetirementChange(e) {
      this.retirementDate = e.detail.value;
    },
    onLifeExpectancyChange(e) {
      this.lifeExpectancyIndex = e.detail.value;
    },

    initializeLifeGrid() {
      // 验证所有必填项
      if (!this.birthDate || !this.schoolStartDate || !this.workStartDate || !this.retirementDate) {
        uni.showToast({
          title: '请填写所有必要信息',
          icon: 'none'
        });
        return;
      }

      // 保存用户数据
      const userData = {
        birthDate: this.birthDate,
        schoolStartDate: this.schoolStartDate,
        educationLevel: this.educationLevels[this.educationLevelIndex],
        workStartDate: this.workStartDate,
        retirementDate: this.retirementDate,
        lifeExpectancy: this.lifeExpectancyOptions[this.lifeExpectancyIndex]
      };

      // 触发事件通知父组件
      this.$emit('initialize', userData);
    }
  }
};
</script>

<style>
/* 初始化表单样式 */
.setup-container {
  width: 90%;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.setup-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 35px;
  color: #333;
  letter-spacing: 2px;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-size: 16px;
  color: #444;
  font-weight: 500;
  margin-left: 4px;
}

.picker-value {
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
  background-color: #f8f8f8;
  border-radius: 12px;
  color: #333;
  font-size: 15px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.submit-btn {
  margin-top: 30px;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(142, 68, 173, 0.2);
}
</style>