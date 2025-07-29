export default {
  phone: {
    required: true,
    type: String,
    trim: true
  },
  code: {
    required: true,
    type: String,
    trim: true
  },
  // 验证码类型：register-注册，login-登录，reset-重置密码
  type: {
    required: true,
    type: String,
    enum: ['register', 'login', 'reset']
  },
  // 是否已使用
  used: {
    type: Boolean,
    default: false
  },
  // 过期时间（10分钟）
  expiredAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
  },
  // 发送时间
  sentAt: {
    type: Date,
    default: Date.now
  }
}; 