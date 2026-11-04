> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 迷雾工具箱 V1.7 Android 打包记录

日期：2026-10-31。本次将当前工作区的 V1.7 工具箱重新构建为正式 APK，不涉及网站部署、应用商店发布或 Git 提交。

## 交付文件

- 安装包：`outputs/android-release/V1.7/迷雾工具箱-V1.7.apk`
- 安装说明：同目录 `安装说明.md`
- SHA-256：同目录 `SHA256.txt`
- 本记录副本：同目录 `本轮打包记录.md`
- 文件长度：286,080,830 字节，约 273 MiB。
- APK SHA-256：`2376D90B2791059E3C838E1188B5DB025B3755279879EC788761E6758C6773D6`

## 构建内容与身份

- 版本来自 `public/site-version.js`：V1.7；Android versionName 为 `1.7`，versionCode 为 `1070001`。
- 使用当前工作区内容构建，包含尚未提交的更新，不代表仅使用 Git HEAD。
- 应用 ID：`cn.mistarg.toolbox`；显示名称：迷雾工具箱；关闭调试。
- 沿用已有发行密钥；证书 SHA-256：`0d9719e69ee8605f24bb03a1e77be8dd078d734ce3a5e6d2067cdb257c2520fd`。
- 已重新验证旧 V1.4 正式版证书，确认与本包相同；可覆盖安装旧正式版。
- 最低 Android 9（API 28），target SDK 35，使用 Android 36 平台编译。
- Android 桌面图标同步为 `public/branding/20261028-toolbox/logo.svg` 的琥珀色「[A]」图案及背景色，增加自适应图标安全留白。
- 构建前清理专用资源暂存目录 `outputs/apk-build/assets/site` 与 `outputs/apk-build/res`，避免旧版已删除资源残留；旧 APK 与签名资料保留。

## 本轮实际验证

1. `npm run build` 成功，生成当前 `dist/`。
2. `android-test/build.ps1 -Variant Release -AndroidRevision 1` 成功，APK 签名验证通过。
3. `android-test/verify-package.ps1` 通过：APK 内全部 25,299 个静态文件的路径、长度及 SHA-256 与 `dist/` 完全一致，无额外静态文件或重复 ZIP 路径；Android 入口存在。
4. 网络、生命周期、偏好适配器的随包字节与源码完全一致。
5. 生成的 Android 配置为正式应用 ID、V1.7、关闭调试，图标资源成功编译。

当前未连接手机，未执行本轮安装、启动、工具运行、在线查询或反馈邮件真机验收。2026-10-24 的 V1.4 真机及邮件验收是历史记录，不能代替 V1.7 的运行验证。本轮通过的是构建、签名及包内一致性检查。

## 更新方式

将新版 APK 传至手机，在三星“我的文件”中打开并按提示更新现有正式版。不要先卸载；更新前可导出笔记与设置备份。卸载或清除应用数据会删除本机数据。测试版是另一应用，数据不会自动迁移到正式版，须通过原有导出和导入功能迁移。

交付目录不含发行私钥、签名密码或 SMTP 凭据。
