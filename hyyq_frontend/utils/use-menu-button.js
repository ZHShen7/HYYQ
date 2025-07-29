import { ref } from 'vue'

/**
 * 微信小程序胶囊按钮适配组合式函数
 * 用于获取胶囊按钮的位置信息，让自定义按钮与胶囊按钮对齐
 */
export function useMenuButton() {
  const buttonTop = ref(54) // 默认值
  const searchHeight = ref(32) // 默认值

  // 初始化胶囊按钮信息
  const initMenuButton = () => {
    try {
      // 获取设备像素比
      const pixelRatio = 750 / wx.getSystemInfoSync().windowWidth
      
      // 获取胶囊按钮信息（仅在微信小程序中可用）
      if (uni.getMenuButtonBoundingClientRect) {
        const btnInfo = uni.getMenuButtonBoundingClientRect()
        searchHeight.value = btnInfo.height
        buttonTop.value = btnInfo.top * pixelRatio
      }
    } catch (error) {
      console.log('获取胶囊按钮信息失败，使用默认值:', error)
      // 保持默认值
    }
  }

  // 初始化
  initMenuButton()

  return {
    buttonTop,
    searchHeight
  }
} 