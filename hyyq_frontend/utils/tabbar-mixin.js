// tabBar 混入，用于在页面中管理 tabBar 状态
import { ref, onMounted } from 'vue'

export function useTabBar(selectedIndex = 0) {
  const currentTab = ref(selectedIndex)
  
  // 获取当前页面路径对应的tab索引
  const getTabIndexByRoute = (route) => {
    const tabRoutes = {
      'pages/home/index': 0,
      'pages/orders/orders': 1,
      'pages/club/club': 2,
      'pages/profile/profile': 3
    }
    return tabRoutes[route] !== undefined ? tabRoutes[route] : -1
  }
  
  // 检查当前页面是否应该显示tabBar
  const shouldShowTabBar = () => {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const route = currentPage.route
      return getTabIndexByRoute(route) !== -1
    }
    return false
  }
  
  // 更新当前tab索引
  const updateCurrentTab = () => {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const route = currentPage.route
      const tabIndex = getTabIndexByRoute(route)
      if (tabIndex !== -1) {
        currentTab.value = tabIndex
      }
    }
  }
  
  onMounted(() => {
    updateCurrentTab()
  })
  
  return {
    currentTab,
    shouldShowTabBar,
    updateCurrentTab
  }
} 