<template>
  <view class="container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <view class="header">
      <view class="back-btn" @click="goBack">返回</view>
      <view class="title">设置</view>
    </view>
    
    <view class="settings-content">
      <view class="settings-section">
        <view class="section-title">背景设置</view>
        
        <view class="setting-item">
          <text class="setting-label">背景图片</text>
          <view class="setting-value">
            <view class="bg-preview" :style="{ backgroundImage: `url(${backgroundImage})` }"></view>
            <button class="upload-btn" @click="chooseBackgroundImage">更换背景</button>
          </view>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">背景音乐</text>
          <view class="setting-value">
            <view v-if="backgroundMusic" class="music-player" @click="toggleMusic">
              <text class="music-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
              <text class="music-name">{{ getMusicName(backgroundMusic) }}</text>
            </view>
            <button v-else class="upload-btn" @click="chooseBackgroundMusic">选择音乐</button>
          </view>
        </view>
      </view>
      
      <view class="settings-section">
        <view class="section-title">特效设置</view>
        
        <view class="setting-item">
          <text class="setting-label">粒子特效</text>
          <view class="setting-value">
            <picker :range="particleEffects" :value="particleEffectIndex" @change="onParticleEffectChange">
              <view class="picker-value">{{ particleEffects[particleEffectIndex] }}</view>
            </picker>
          </view>
        </view>
      </view>
      
      <view class="settings-section">
        <view class="section-title">数据管理</view>
        
        <view class="setting-item">
          <text class="setting-label">导出数据</text>
          <view class="setting-value">
            <button class="action-btn" @click="exportData">导出</button>
          </view>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">导入数据</text>
          <view class="setting-value">
            <button class="action-btn" @click="importData">导入</button>
          </view>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">清除所有数据</text>
          <view class="setting-value">
            <button class="danger-btn" @click="confirmClearData">清除</button>
          </view>
        </view>
      </view>
      
      <view class="settings-section">
        <view class="section-title">关于</view>
        
        <view class="about-content">
          <text class="app-name">人生格子</text>
          <text class="app-version">版本 1.0.0</text>
          <text class="app-description">记录你的人生每一刻</text>
        </view>
      </view>
    </view>
    
    <!-- 预览粒子特效 -->
    <view v-if="particleEffectIndex > 0" class="particle-container">
      <view v-for="i in 30" :key="i" 
            :class="['particle', `particle-${particleEffects[particleEffectIndex].toLowerCase()}`]"
            :style="getRandomParticleStyle()">
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      backgroundImage: '/static/images/default-bg.jpg',
      backgroundMusic: '',
      isPlaying: false,
      audioContext: null,
      
      particleEffects: ['无', '雪花', '花瓣', '爱心', '流星', '火焰', '下雨'],
      particleEffectIndex: 0
    };
  },
  onLoad() {
    // 加载设置
    const settings = uni.getStorageSync('lifeGridSettings');
    if (settings) {
      this.backgroundImage = settings.backgroundImage || this.backgroundImage;
      this.backgroundMusic = settings.backgroundMusic || '';
      this.particleEffectIndex = this.particleEffects.indexOf(settings.particleEffect) > 0 ? 
                                this.particleEffects.indexOf(settings.particleEffect) : 0;
    }
    
    // 检查背景音乐是否正在播放
    const app = getApp();
    if (app.globalData && app.globalData.bgm) {
      this.audioContext = app.globalData.bgm;
      this.isPlaying = !this.audioContext.paused;
    }
  },
  methods: {
    goBack() {
      // 保存设置
      this.saveSettings();
      
      // 返回上一页
      uni.navigateBack();
    },
    
    saveSettings() {
      const settings = {
        backgroundImage: this.backgroundImage,
        backgroundMusic: this.backgroundMusic,
        particleEffect: this.particleEffects[this.particleEffectIndex]
      };
      
      uni.setStorageSync('lifeGridSettings', settings);
    },
    
    chooseBackgroundImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.backgroundImage = res.tempFilePaths[0];
        }
      });
    },
    
    chooseBackgroundMusic() {
      // 在小程序中，可能需要使用云开发或其他方式选择音乐
      // 这里简化为从几个预设音乐中选择
      uni.showActionSheet({
        itemList: ['轻松音乐1', '轻松音乐2', '怀旧音乐', '清除背景音乐'],
        success: (res) => {
          if (res.tapIndex === 3) {
            // 清除背景音乐
            this.backgroundMusic = '';
            if (this.audioContext) {
              this.audioContext.stop();
              this.isPlaying = false;
            }
          } else {
            // 设置背景音乐
            const musicPaths = [
              '/static/music/relaxing1.mp3',
              '/static/music/relaxing2.mp3',
              '/static/music/nostalgic.mp3'
            ];
            this.backgroundMusic = musicPaths[res.tapIndex];
            
            // 播放预览
            this.playMusic();
          }
        }
      });
    },
    
    getMusicName(path) {
      if (!path) return '';
      
      const musicNames = {
        '/static/music/relaxing1.mp3': '轻松音乐1',
        '/static/music/relaxing2.mp3': '轻松音乐2',
        '/static/music/nostalgic.mp3': '怀旧音乐'
      };
      
      return musicNames[path] || '自定义音乐';
    },
    
    toggleMusic() {
      if (!this.backgroundMusic) return;
      
      if (!this.audioContext) {
        this.playMusic();
      } else {
        if (this.isPlaying) {
          this.audioContext.pause();
          this.isPlaying = false;
        } else {
          this.audioContext.play();
          this.isPlaying = true;
        }
      }
    },
    
    playMusic() {
      if (!this.backgroundMusic) return;
      
      if (!this.audioContext) {
        this.audioContext = uni.createInnerAudioContext();
        this.audioContext.src = this.backgroundMusic;
        this.audioContext.loop = true;
        
        // 保存到全局
        getApp().globalData.bgm = this.audioContext;
      } else {
        this.audioContext.src = this.backgroundMusic;
      }
      
      this.audioContext.play();
      this.isPlaying = true;
    },
    
    onParticleEffectChange(e) {
      this.particleEffectIndex = e.detail.value;
    },
    
    getRandomParticleStyle() {
      const size = Math.floor(Math.random() * 20) + 10; // 10-30px
      const left = Math.floor(Math.random() * 100); // 0-100%
      const animationDuration = Math.floor(Math.random() * 10) + 5; // 5-15s
      const animationDelay = Math.random() * 5; // 0-5s
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${animationDelay}s`
      };
    },
    
    exportData() {
      // 收集所有数据
      const userData = uni.getStorageSync('lifeGridUserData');
      const settings = uni.getStorageSync('lifeGridSettings');
      
      // 收集所有格子数据
      const allData = {};
      
      // 获取所有存储的键
      const keys = [];
      try {
        const res = uni.getStorageInfoSync();
        keys.push(...res.keys);
      } catch (e) {
        console.error(e);
      }
      
      // 过滤出与格子相关的键
      const gridKeys = keys.filter(key => 
        key.startsWith('events_') || 
        key.startsWith('detail_')
      );
      
      // 收集所有格子数据
      gridKeys.forEach(key => {
        allData[key] = uni.getStorageSync(key);
      });
      
      // 创建导出数据
      const exportData = {
        userData,
        settings,
        gridData: allData,
        exportDate: new Date().toISOString()
      };
      
      // 转换为JSON字符串
      const dataStr = JSON.stringify(exportData);
      
      // 在真实环境中，这里可以使用uni.saveFile或其他方式保存文件
      // 在这个示例中，我们简单地显示一个成功消息
      uni.showModal({
        title: '导出成功',
        content: '数据已成功导出。在真实环境中，这里会保存一个文件。',
        showCancel: false
      });
    },
    
    importData() {
      // 在真实环境中，这里会使用uni.chooseFile选择文件
      // 然后读取文件内容并解析
      uni.showModal({
        title: '导入数据',
        content: '这个功能在真实环境中会允许你选择一个之前导出的数据文件。',
        showCancel: false
      });
    },
    
    confirmClearData() {
      uni.showModal({
        title: '确认清除',
        content: '这将清除所有数据，包括格子记录、设置等。此操作不可撤销！',
        success: (res) => {
          if (res.confirm) {
            this.clearAllData();
          }
        }
      });
    },
    
    clearAllData() {
      try {
        uni.clearStorageSync();
        
        // 重置当前设置
        this.  {
      try {
        uni.clearStorageSync();
        
        // 重置当前设置
        this.backgroundImage = '/static/images/default-bg.jpg';
        this.backgroundMusic = '';
        this.particleEffectIndex = 0;
        
        // 停止音乐播放
        if (this.audioContext) {
          this.audioContext.stop();
          this.isPlaying = false;
        }
        
        uni.showToast({
          title: '数据已清除',
          icon: 'success'
        });
      } catch (e) {
        console.error(e);
        uni.showToast({
          title: '清除失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style>
.container {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  position: relative;
}

.back-btn {
  position: absolute;
  left: 15px;
  font-size: 16px;
  color: #8e44ad;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.settings-content {
  flex: 1;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
}

.settings-section {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #8e44ad;
}

.setting-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.setting-value {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.bg-preview {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  background-size: cover;
  background-position: center;
  margin-right: 10px;
  border: 1px solid #ddd;
}

.upload-btn, .action-btn, .danger-btn {
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
}

.upload-btn {
  background-color: #f0f0f0;
  color: #333;
}

.action-btn {
  background-color: #8e44ad;
  color: white;
}

.danger-btn {
  background-color: #f44336;
  color: white;
}

.music-player {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.music-icon {
  margin-right: 10px;
  font-size: 18px;
}

.picker-value {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 5px;
  min-width: 100px;
  text-align: center;
}

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #8e44ad;
}

.app-version {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.app-description {
  font-size: 14px;
  color: #999;
}

/* 粒子特效样式 */
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.particle {
  position: absolute;
  top: -50px;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(calc(100vh + 50px)) rotate(360deg);
  }
}

/* 雪花特效 */
.particle-雪花 {
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

/* 花瓣特效 */
.particle-花瓣 {
  background-color: #ffb7c5;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.8;
}

/* 爱心特效 */
.particle-爱心 {
  background-color: #ff4d6d;
  clip-path: path('M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z');
  opacity: 0.8;
}

/* 流星特效 */
.particle-流星 {
  background: linear-gradient(to bottom right, #fff, transparent);
  transform: rotate(45deg);
  opacity: 0.8;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* 火焰特效 */
.particle-火焰 {
  background: radial-gradient(circle, #ff7b00, #ff0000);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0.8;
}

/* 下雨特效 */
.particle-下雨 {
  background-color: rgba(30, 144, 255, 0.8);
  border-radius: 0 0 5px 5px;
  width: 2px !important;
  height: 15px !important;
  box-shadow: 0 0 5px rgba(30, 144, 255, 0.5);
}
</style>

