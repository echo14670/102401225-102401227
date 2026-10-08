# Android 本地打包工程

本目录由 DCloud Android SDK 5.26 的 `HBuilder-Integrate-AS` 模板生成。

## 构建前提

- `JAVA_HOME=C:\AndroidTools\jdk21\jdk-21.0.12.1`
- `ANDROID_HOME=C:\AndroidTools\android-sdk`
- `CAMPUS_SIGNING_FILE=C:\AndroidSigning\campus-lostfound\signing.properties`
- HBuilderX 5.26 已生成 `appResource` 并复制到：
  `app/src/main/assets/apps/__UNI__C30611F/www`

Android 离线 SDK 还要求配置 `dcloud_appkey`。请在
<https://dev.dcloud.net.cn> 的“应用管理 -> 各平台信息”中，为以下信息申请：

- AppID：`__UNI__C30611F`
- 包名：`com.lin.campuslostfound`
- 证书 SHA1：使用 `keytool` 或 `apksigner` 从项目 Release keystore/APK 获取

把结果写入仓库外文件：
`C:\AndroidSigning\campus-lostfound\signing.properties`

```properties
dcloudAppkey=你的AppKey
```

## 构建

```powershell
.\gradlew.bat :app:assembleRelease
```

产物位于 `app/build/outputs/apk/release/app-release.apk`。
