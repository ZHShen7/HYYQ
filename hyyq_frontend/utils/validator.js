// 表单验证工具

// 验证手机号
export const validatePhone = (phone) => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

// 验证邮箱
export const validateEmail = (email) => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(email)
}

// 验证密码强度
export const validatePassword = (password) => {
  // 至少8位，包含字母和数字
  const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return passwordReg.test(password)
}

// 验证用户名
export const validateUsername = (username) => {
  // 3-20位字母、数字、下划线
  const usernameReg = /^[a-zA-Z0-9_]{3,20}$/
  return usernameReg.test(username)
}

// 验证验证码
export const validateCode = (code) => {
  // 6位数字验证码
  const codeReg = /^\d{6}$/
  return codeReg.test(code)
}

// 通用验证函数
export const validate = {
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
  },
  minLength: (value, min) => {
    return value && value.toString().length >= min
  },
  maxLength: (value, max) => {
    return value && value.toString().length <= max
  }
} 