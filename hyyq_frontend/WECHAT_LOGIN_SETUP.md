# 微信登录配置说明

本文档说明如何在约约球球应用中配置微信登录功能。

## 支持的平台

- ✅ 微信小程序
- ✅ APP端（Android/iOS）
- ❌ H5端（不支持微信登录）

## 微信小程序配置

### 1. 小程序后台配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序管理后台
3. 在"开发"→"开发管理"→"开发设置"中获取：
   - AppID（小程序ID）
   - AppSecret（小程序密钥）

### 2. 项目配置

在 `manifest.json` 文件中配置小程序信息：

```json
{
  "mp-weixin": {
    "appid": "你的小程序AppID",
    "setting": {
      "urlCheck": false
    },
    "permission": {
      "scope.userInfo": {
        "desc": "用于完善用户资料"
      }
    }
  }
}
```

### 3. 后端接口要求

后端需要实现微信登录接口：

```javascript
// POST /api/wechat/login
{
  "code": "微信登录凭证",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "country": "国家",
    "province": "省份",
    "city": "城市"
  },
  "platform": "mp-weixin"
}
```

后端处理流程：
1. 使用 `code` 调用微信API获取 `openid` 和 `session_key`
2. 根据 `openid` 查找或创建用户
3. 返回用户token和信息

## APP端配置

### 1. 微信开放平台配置

1. 登录 [微信开放平台](https://open.weixin.qq.com/)
2. 创建移动应用
3. 获取：
   - AppID
   - AppSecret
   - Universal Links（iOS）

### 2. 项目配置

在 `manifest.json` 文件中配置APP信息：

```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\"/>"
        ]
      },
      "ios": {
        "capabilities": {
          "entitlements": {
            "com.apple.developer.associated-domains": [
              "applinks:你的域名"
            ]
          }
        }
      }
    }
  }
}
```

### 3. 微信SDK集成

#### Android配置

1. 下载微信Android SDK
2. 将SDK文件放入项目的 `nativeplugins/weixin` 目录
3. 在 `AndroidManifest.xml` 中注册微信Activity

#### iOS配置

1. 下载微信iOS SDK
2. 将SDK文件添加到Xcode项目
3. 配置URL Schemes和Universal Links

### 4. 后端接口

APP端微信登录接口参数：

```javascript
// POST /api/wechat/login
{
  "code": "微信登录凭证",
  "userInfo": null, // APP端无法直接获取用户信息
  "platform": "app-plus"
}
```

## 测试流程

### 小程序端测试

1. 在微信开发者工具中打开项目
2. 点击"微信一键登录"按钮
3. 授权获取用户信息
4. 检查登录是否成功

### APP端测试

1. 在真机上运行APP
2. 确保设备已安装微信
3. 点击"微信一键登录"按钮
4. 跳转到微信授权页面
5. 授权后返回APP，检查登录状态

## 常见问题

### 1. 小程序端获取用户信息失败

**问题**: 用户拒绝授权或授权失败

**解决方案**:
- 检查小程序权限配置
- 引导用户手动授权
- 提供其他登录方式作为备选

### 2. APP端无法跳转微信

**问题**: 微信未安装或版本过低

**解决方案**:
- 检查设备是否安装微信
- 提示用户安装或更新微信
- 提供其他登录方式

### 3. 后端接口调用失败

**问题**: 微信API调用失败

**解决方案**:
- 检查AppID和AppSecret是否正确
- 确认微信开放平台配置
- 检查网络连接和防火墙设置

### 4. 用户信息不完整

**问题**: 获取到的用户信息字段缺失

**解决方案**:
- 检查微信API返回的数据格式
- 在后端处理时设置默认值
- 引导用户完善个人信息

## 安全注意事项

1. **AppSecret保密**: 不要在客户端代码中暴露AppSecret
2. **Token验证**: 后端需要验证微信返回的登录凭证
3. **用户数据**: 妥善处理用户隐私信息
4. **接口安全**: 使用HTTPS协议，防止数据泄露

## 相关文档

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [微信开放平台文档](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419317851&token=&lang=zh_CN)
- [UniApp微信登录文档](https://uniapp.dcloud.io/api/plugins/login.html) 