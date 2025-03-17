<template>
  <view class="container">
    <!-- 背景动画 -->
    <canvas canvas-id="animationCanvas" class="animation-canvas"></canvas>
    
    <view class="content">
      <text class="title">人生格子</text>
      <text class="description">记录你的人生旅程，珍藏每一个重要时刻。通过时间格子，见证自己的成长与变化。</text>
      
      <!-- 生命格子主组件 -->
      <life-grid></life-grid>
    </view>
  </view>
</template>

<script>
import LifeGrid from '@/components/life-grid/life-grid.vue'

export default {
  components: {
    LifeGrid
  },
  data() {
    return {
      animationTimer: null,
      particles: []
    }
  },
  onReady() {
    // 初始化背景动画
    this.initBackgroundAnimation()
  },
  onUnload() {
    // 清除动画定时器
    if (this.animationTimer) {
      clearInterval(this.animationTimer)
    }
  },
  methods: {
    initBackgroundAnimation() {
      const ctx = uni.createCanvasContext('animationCanvas', this)
      const canvasWidth = uni.getSystemInfoSync().windowWidth
      const canvasHeight = uni.getSystemInfoSync().windowHeight
      
      // 创建粒子和花瓣
      this.createParticles(canvasWidth, canvasHeight)
      
      // 设置动画循环
      this.animationTimer = setInterval(() => {
        this.drawParticles(ctx, canvasWidth, canvasHeight)
      }, 50)
    },
    
    createParticles(width, height) {
      const particleCount = Math.floor(25 * (width / 1000))
      const particles = []
      
      const petalColors = [
        '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', 
        '#ffccbc', '#ffe0b2', '#fff9c4', '#f0f4c3'
      ]
      
      const particleColors = [
        '#64b5f6', '#81c784', '#ba68c8', '#4fc3f7', 
        '#4dd0e1', '#4db6ac', '#aed581', '#dce775'
      ]
      
      for (let i = 0; i < particleCount; i++) {
        const particleType = Math.random() > 0.5 ? 'petal' : 'particle'
        const colorArray = particleType === 'petal' ? petalColors : particleColors
        
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: particleType === 'petal' ? 
                Math.random() * 10 + 5 : 
                Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: Math.random() * 0.8 + 0.5,
          color: colorArray[Math.floor(Math.random() * colorArray.length)],
          opacity: Math.random() * 0.6 + 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          type: particleType
        })
      }
      
      this.particles = particles
    },
    
    drawParticles(ctx, width, height) {
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      
      // 绘制每个粒子
      this.particles.forEach(particle => {
        // 更新位置
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed
        
        // 如果超出边界则重置
        if (particle.y > height) {
          particle.y = -particle.size
          particle.x = Math.random() * width
        }
        
        if (particle.x < -particle.size) {
          particle.x = width
        } else if (particle.x > width + particle.size) {
          particle.x = -particle.size
        }
        
        // 绘制粒子
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.setGlobalAlpha(particle.opacity)
        
        if (particle.type === 'petal') {
          // 绘制花瓣形状
          ctx.beginPath()
          ctx.setFillStyle(particle.color)
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(
            particle.size / 2, -particle.size / 2,
            particle.size, -particle.size / 4,
            particle.size, 0
          )
          ctx.bezierCurveTo(
            particle.size, particle.size / 4,
            particle.size / 2, particle.size / 2,
            0, 0
          )
          ctx.fill()
        } else {
          // 绘制圆形粒子
          ctx.beginPath()
          ctx.setFillStyle(particle.color)
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()
      })
      
      // 绘制到画布
      ctx.draw()
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(to bottom, rgba(254, 242, 242, 1), rgba(238, 242, 255, 1));
  padding: 20rpx;
  overflow: hidden;
}

.animation-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.4;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  color: #8b5cf6;
}

.description {
  font-size: 28rpx;
  text-align: center;
  margin-bottom: 60rpx;
  color: #6b7280;
  max-width: 600rpx;
  margin-left: auto;
  margin-right: auto;
}
</style>

