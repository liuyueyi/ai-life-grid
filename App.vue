<script>
export default {
  globalData: {
    bgm: null,
    themeMode: 'light',
    particleEffect: '无'
  },
  onLaunch: function () {
    console.log('App Launch');

    // 初始化全局数据
    this.globalData = {
      bgm: null,
      themeMode: 'light',
      particleEffect: '无'
    };

    // 加载设置
    const settings = uni.getStorageSync('lifeGridSettings');
    if (settings) {
      // 设置主题模式
      if (settings.themeMode) {
        this.globalData.themeMode = settings.themeMode;
        // 应用主题样式
        document.documentElement.setAttribute('data-theme', settings.themeMode);
      }

      // 设置粒子特效
      if (settings.particleEffect) {
        this.globalData.particleEffect = settings.particleEffect;
      }

      // 设置背景音乐
      if (settings.backgroundMusic) {
        // 创建背景音乐
        const bgm = uni.createInnerAudioContext();
        bgm.autoplay = true;
        bgm.loop = true;
        bgm.src = settings.backgroundMusic;

        // 保存到全局
        this.globalData.bgm = bgm;
      }
    }
  },
  onShow: function () {
    console.log('App Show');

    // 恢复背景音乐播放
    if (this.globalData.bgm) {
      this.globalData.bgm.play();
    }
  },
  onHide: function () {
    console.log('App Hide');
  }
};
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f8f8f8;
}

/* 通用样式 */
.container {
  width: 100%;
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
