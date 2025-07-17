# Vue3 模板指南

## 组件模板

### 基础组件模板
```vue
<template>
  <view class="component-name">
    <!-- 模板内容 -->
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'

// Props 定义
const props = defineProps({
  // 定义 props
})

// Emits 定义
const emit = defineEmits(['event-name'])

// 响应式数据
const data = ref('')
const objectData = reactive({
  key: 'value'
})

// 计算属性
const computedValue = computed(() => {
  return data.value
})

// 方法
const handleEvent = () => {
  // 处理逻辑
}

// 生命周期
onMounted(() => {
  // 组件挂载后执行
})

onUnmounted(() => {
  // 组件卸载前执行
})

// uni-app 生命周期
onLoad(() => {
  // 页面加载时执行
})

onShow(() => {
  // 页面显示时执行
})

onHide(() => {
  // 页面隐藏时执行
})
</script>

<style scoped>
/* 样式 */
</style>
```

### 页面模板
```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'

// 导入组件
import MyComponent from '@/components/MyComponent.vue'

// 导入工具函数
import { someUtil } from '@/utils/someUtil.js'

// 响应式数据
const loading = ref(false)
const formData = reactive({
  field1: '',
  field2: ''
})

// 计算属性
const isValid = computed(() => {
  return formData.field1 && formData.field2
})

// 方法
const handleSubmit = async () => {
  loading.value = true
  try {
    // 异步操作
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 页面跳转
const goToPage = () => {
  uni.navigateTo({
    url: '/pages/other/other'
  })
}

// 生命周期
onLoad(() => {
  // 页面加载时初始化
})

onShow(() => {
  // 页面显示时刷新数据
})
</script>

<style scoped>
/* 页面样式 */
</style>
```

## 主要变化

### 1. 语法变化
- `export default` → `<script setup>`
- `data()` → `ref()` 或 `reactive()`
- `computed` → `computed()`
- `methods` → 普通函数
- `mounted` → `onMounted()`
- `this.$emit` → `emit()`

### 2. 响应式数据
```javascript
// Vue2
data() {
  return {
    count: 0,
    user: { name: 'John' }
  }
}

// Vue3
const count = ref(0)
const user = reactive({ name: 'John' })
```

### 3. 计算属性
```javascript
// Vue2
computed: {
  doubleCount() {
    return this.count * 2
  }
}

// Vue3
const doubleCount = computed(() => {
  return count.value * 2
})
```

### 4. 方法
```javascript
// Vue2
methods: {
  increment() {
    this.count++
  }
}

// Vue3
const increment = () => {
  count.value++
}
```

### 5. 生命周期
```javascript
// Vue2
mounted() {
  // 逻辑
}

// Vue3
onMounted(() => {
  // 逻辑
})
```

### 6. Props 和 Emits
```javascript
// Vue2
props: ['title'],
methods: {
  handleClick() {
    this.$emit('click')
  }
}

// Vue3
const props = defineProps(['title'])
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
```

## 注意事项

1. **响应式数据访问**：使用 `ref()` 创建的数据需要通过 `.value` 访问
2. **reactive 对象**：直接访问属性，不需要 `.value`
3. **模板中的响应式数据**：自动解包，不需要 `.value`
4. **组件导入**：在 `<script setup>` 中导入的组件自动注册
5. **uni-app 生命周期**：使用 `@dcloudio/uni-app` 中的生命周期钩子

## 最佳实践

1. 使用 `ref()` 存储简单值（字符串、数字、布尔值）
2. 使用 `reactive()` 存储对象
3. 使用 `computed()` 创建计算属性
4. 使用 `defineProps()` 和 `defineEmits()` 定义组件接口
5. 使用 `onMounted()` 等生命周期钩子
6. 保持代码结构清晰，按功能分组 