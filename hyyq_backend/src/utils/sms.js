import axios from 'axios';
import crypto from 'crypto';

// 短信配置 - 请根据选择的服务商配置
const SMS_CONFIG = {
  // 阿里云短信配置
  aliyun: {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || 'your_access_key_id',
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || 'your_access_key_secret',
    signName: process.env.ALIYUN_SIGN_NAME || '好友约球',
    templateCode: process.env.ALIYUN_TEMPLATE_CODE || 'SMS_XXXXXX'
  },
  
  // 腾讯云短信配置
  tencent: {
    secretId: process.env.TENCENT_SECRET_ID || 'your_secret_id',
    secretKey: process.env.TENCENT_SECRET_KEY || 'your_secret_key',
    sdkAppId: process.env.TENCENT_SDK_APP_ID || 'your_sdk_app_id',
    signName: process.env.TENCENT_SIGN_NAME || '好友约球',
    templateId: process.env.TENCENT_TEMPLATE_ID || 'your_template_id'
  },
  
  // 当前使用的服务商
  provider: process.env.SMS_PROVIDER || 'mock' // aliyun, tencent, mock
};

/**
 * 生成6位数字验证码
 */
export const generateVerifyCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 发送短信验证码 - 阿里云
 */
const sendAliyunSms = async (phone, code) => {
  try {
    // 阿里云短信API实现
    // 这里需要安装 @alicloud/dysmsapi20170525 包
    console.log(`[阿里云短信] 发送验证码到 ${phone}: ${code}`);
    
    // 实际集成时的代码示例：
    /*
    const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525').default;
    const { Config } = require('@alicloud/tea-util');
    
    const config = new Config({
      accessKeyId: SMS_CONFIG.aliyun.accessKeyId,
      accessKeySecret: SMS_CONFIG.aliyun.accessKeySecret,
    });
    
    config.endpoint = 'dysmsapi.aliyuncs.com';
    const client = new Dysmsapi20170525(config);
    
    const sendSmsRequest = {
      phoneNumbers: phone,
      signName: SMS_CONFIG.aliyun.signName,
      templateCode: SMS_CONFIG.aliyun.templateCode,
      templateParam: JSON.stringify({ code: code })
    };
    
    const response = await client.sendSms(sendSmsRequest);
    return { success: true, data: response };
    */
    
    return { success: true, message: '短信发送成功（模拟）' };
  } catch (error) {
    console.error('阿里云短信发送失败:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 发送短信验证码 - 腾讯云
 */
const sendTencentSms = async (phone, code) => {
  try {
    console.log(`[腾讯云短信] 发送验证码到 ${phone}: ${code}`);
    
    // 腾讯云短信API实现
    // 这里需要安装 tencentcloud-sdk-nodejs 包
    
    // 实际集成时的代码示例：
    /*
    const tencentcloud = require('tencentcloud-sdk-nodejs');
    const SmsClient = tencentcloud.sms.v20210111.Client;
    
    const clientConfig = {
      credential: {
        secretId: SMS_CONFIG.tencent.secretId,
        secretKey: SMS_CONFIG.tencent.secretKey,
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    };
    
    const client = new SmsClient(clientConfig);
    const params = {
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: SMS_CONFIG.tencent.sdkAppId,
      SignName: SMS_CONFIG.tencent.signName,
      TemplateId: SMS_CONFIG.tencent.templateId,
      TemplateParamSet: [code]
    };
    
    const response = await client.SendSms(params);
    return { success: true, data: response };
    */
    
    return { success: true, message: '短信发送成功（模拟）' };
  } catch (error) {
    console.error('腾讯云短信发送失败:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 模拟发送短信（开发环境使用）
 */
const sendMockSms = async (phone, code) => {
  console.log(`[模拟短信] 发送验证码到 ${phone}: ${code}`);
  console.log(`验证码内容: 【你的应用】您的验证码是${code}，10分钟内有效，请勿泄露。`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, message: '短信发送成功（模拟）' };
};

/**
 * 统一的短信发送接口
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} type - 短信类型 (register/login/reset)
 */
export const sendSms = async (phone, code, type = 'register') => {
  try {
    let result;
    
    switch (SMS_CONFIG.provider) {
      case 'aliyun':
        result = await sendAliyunSms(phone, code);
        break;
      case 'tencent':
        result = await sendTencentSms(phone, code);
        break;
      case 'mock':
      default:
        result = await sendMockSms(phone, code);
        break;
    }
    
    return result;
  } catch (error) {
    console.error('短信发送异常:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 */
export const validatePhone = (phone) => {
  const phoneReg = /^1[3-9]\d{9}$/;
  return phoneReg.test(phone);
};

/**
 * 检查发送频率限制
 * @param {string} phone - 手机号
 * @param {Object} lastSendTime - 上次发送时间记录
 */
export const checkSendFrequency = (phone, lastSendTime) => {
  const now = Date.now();
  const last = lastSendTime[phone] || 0;
  const interval = 60 * 1000; // 60秒间隔
  
  if (now - last < interval) {
    const remainTime = Math.ceil((interval - (now - last)) / 1000);
    return { 
      allowed: false, 
      message: `请等待${remainTime}秒后再发送`,
      remainTime 
    };
  }
  
  return { allowed: true };
}; 