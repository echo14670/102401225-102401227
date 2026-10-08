param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$HBuilderX = "C:\HBuilderX526\HBuilderX\HBuilderX.exe",
    [string]$HBuilderXCli = "C:\HBuilderX526\HBuilderX\cli.exe",
    [string]$JavaHome = "C:\AndroidTools\jdk21\jdk-21.0.12.1",
    [string]$AndroidHome = "C:\AndroidTools\android-sdk",
    [string]$GradleHome = "C:\AndroidTools\gradle-home-fresh",
    [string]$GradleCommand = "C:\AndroidTools\gradle-8.11.1\gradle-8.11.1\bin\gradle.bat",
    [string]$SigningFile = "C:\AndroidSigning\campus-lostfound\signing.properties",
    [string]$AppId = "__UNI__C30611F",
    [switch]$AllowPlaceholderAppKey
)

$ErrorActionPreference = "Stop"

$required = @($HBuilderX, $HBuilderXCli, $GradleCommand, "$JavaHome\bin\java.exe", "$AndroidHome\platform-tools\adb.exe", $SigningFile)
foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing build dependency: $path"
    }
}

$signingText = Get-Content -Raw -Encoding UTF8 -LiteralPath $SigningFile
$hasDCloudAppKey = $signingText -match '(?m)^dcloudAppkey=(?!REPLACE_WITH_DCLOUD_APPKEY).+$'
if (-not $hasDCloudAppKey -and -not $AllowPlaceholderAppKey) {
    throw "signing.properties has no valid dcloudAppkey. Obtain it from the DCloud developer center, or pass -AllowPlaceholderAppKey for a build-only check."
}

$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $AndroidHome
$env:ANDROID_SDK_ROOT = $AndroidHome
$env:GRADLE_USER_HOME = $GradleHome
$env:CAMPUS_SIGNING_FILE = $SigningFile
$env:Path = "$JavaHome\bin;$AndroidHome\platform-tools;$AndroidHome\build-tools\36.0.0;$env:Path"

$projectPath = (Resolve-Path -LiteralPath $ProjectRoot).Path
$androidPath = (Resolve-Path (Join-Path $projectPath "android-local")).Path
$releasePath = Join-Path $projectPath "release"
New-Item -ItemType Directory -Path $releasePath -Force | Out-Null

if (-not (Get-Process -Name "HBuilderX" -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $HBuilderX -WindowStyle Hidden
    Start-Sleep -Seconds 12
}

& $HBuilderXCli project open --path $projectPath
& $HBuilderXCli publish app-android --type appResource --project $projectPath

& (Join-Path $PSScriptRoot "sync-app-resource.ps1") -AppId $AppId -ProjectRoot $projectPath

Push-Location $androidPath
try {
    & $GradleCommand --no-daemon :app:assembleRelease
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle assembleRelease failed"
    }
} finally {
    Pop-Location
}

$builtApk = Join-Path $androidPath "app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path -LiteralPath $builtApk)) {
    throw "Release APK not found: $builtApk"
}

$finalApk = Join-Path $releasePath "campus-lost-found-1.0.0-release.apk"
Copy-Item -LiteralPath $builtApk -Destination $finalApk -Force

$apksigner = Join-Path $AndroidHome "build-tools\36.0.0\apksigner.bat"
$aapt = Join-Path $AndroidHome "build-tools\36.0.0\aapt.exe"
& $apksigner verify --verbose --print-certs $finalApk
& $aapt dump badging $finalApk | Select-Object -First 12

$hash = (Get-FileHash -LiteralPath $finalApk -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath "$finalApk.sha256" -Value "$hash  campus-lost-found-1.0.0-release.apk" -Encoding ASCII
Write-Host "Release APK: $finalApk"
Write-Host "SHA-256: $hash"
