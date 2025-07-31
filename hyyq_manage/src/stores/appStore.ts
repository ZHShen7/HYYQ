import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // 侧边栏状态
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // 主题
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 页面加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 当前选中的菜单
  selectedMenuKey: string;
  setSelectedMenuKey: (key: string) => void;
  
  // 面包屑
  breadcrumbs: Array<{
    title: string;
    path?: string;
  }>;
  setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => void;
  
  // 页面标题
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      sidebarCollapsed: false,
      theme: 'light',
      loading: false,
      selectedMenuKey: '',
      breadcrumbs: [],
      pageTitle: '约球系统管理后台',
      
      // 操作
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },
      
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      
      setSelectedMenuKey: (key: string) => {
        set({ selectedMenuKey: key });
      },
      
      setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => {
        set({ breadcrumbs });
      },
      
      setPageTitle: (title: string) => {
        set({ pageTitle: title });
        // 更新页面标题
        document.title = `${title} - 约球系统管理后台`;
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
); 