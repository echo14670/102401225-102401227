# Release APK

正式安装包生成后放在本目录：

```text
campus-lost-found-1.0.0-release.apk
campus-lost-found-1.0.0-release.apk.sha256
```

APK 由 `scripts/build-apk.ps1` 使用本机 DCloud Android SDK、Gradle 和仓库外的 Release keystore 构建。

当前 APK 的 DCloud AppKey 仍为占位值。获得
`C:\AndroidSigning\campus-lostfound\signing.properties` 对应的
`dcloudAppkey` 后必须重新构建，再进行真机验收。
