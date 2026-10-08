param(
    [string]$AppId = "__UNI__C30611F",
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

$candidates = @(
    (Join-Path $ProjectRoot "unpackage\resources\$AppId\www"),
    (Join-Path $ProjectRoot "unpackage\dist\build\app-plus")
)

$source = $candidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ "app-config.js") } | Select-Object -First 1
if (-not $source) {
    throw "HBuilderX appResource not found. Run publish app-android --type appResource first."
}

$androidApp = (Resolve-Path (Join-Path $ProjectRoot "android-local\app")).Path
$targetRoot = Join-Path $androidApp "src\main\assets\apps\$AppId"
$target = Join-Path $targetRoot "www"

if (-not $targetRoot.StartsWith($androidApp, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Target path escaped android-local: $targetRoot"
}

if (Test-Path -LiteralPath $targetRoot) {
    Remove-Item -LiteralPath $targetRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $target -Force | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $target -Recurse -Force

$control = Join-Path $androidApp "src\main\assets\data\dcloud_control.xml"
$controlContent = @"
<hbuilder>
<apps>
    <app appid="$AppId" appver=""/>
</apps>
</hbuilder>
"@
Set-Content -LiteralPath $control -Value $controlContent -Encoding ASCII

Write-Host "appResource synchronized: $source -> $target"
