<template>
  <view class="custom-popup" :class="{ 'popup-show': visible }" @tap.stop="handleMaskClick">
    <view class="popup-mask"></view>
    <view class="popup-container" :class="{ 'popup-center': type === 'center' }">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomPopup',
  props: {
    type: {
      type: String,
      default: 'center'
    },
    maskClosable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    close() {
      this.visible = false
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.close()
      }
    }
  }
}
</script>

<style>
.custom-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s;
}

.popup-show {
  visibility: visible;
  opacity: 1;
}

.popup-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4rpx);
}

.popup-container {
  position: absolute;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s;
}

.popup-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
}

.popup-show .popup-container {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>