param(
  [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Join-Path $packageRoot "source"
$resolvedRepo = (Resolve-Path -LiteralPath $RepoRoot).Path
$resolvedSource = (Resolve-Path -LiteralPath $sourceRoot).Path

if (-not (Test-Path -LiteralPath (Join-Path $resolvedRepo "package.json"))) {
  throw "RepoRoot does not look like the uni-app repository: $resolvedRepo"
}

Get-ChildItem -LiteralPath $resolvedSource -Recurse -File | ForEach-Object {
  $relativePath = $_.FullName.Substring($resolvedSource.Length).TrimStart("\", "/")
  $target = Join-Path $resolvedRepo $relativePath
  $targetDirectory = Split-Path -Parent $target
  New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
  Copy-Item -LiteralPath $_.FullName -Destination $target -Force
}

Write-Host "Wang search module files copied into $resolvedRepo"
