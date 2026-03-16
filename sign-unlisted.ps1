param(
  [string]$SourceDir = $PSScriptRoot,
  [string]$ArtifactsDir = (Join-Path $PSScriptRoot "web-ext-artifacts"),
  [switch]$SkipLint
)

$webExt = Get-Command web-ext -ErrorAction SilentlyContinue
if (-not $webExt) {
  throw "web-ext is not installed. Install Node.js and run: npm install --global web-ext"
}

if (-not $env:WEB_EXT_API_KEY) {
  throw "Set WEB_EXT_API_KEY before running this script."
}

if (-not $env:WEB_EXT_API_SECRET) {
  throw "Set WEB_EXT_API_SECRET before running this script."
}

New-Item -ItemType Directory -Path $ArtifactsDir -Force | Out-Null

$ignoreArgs = @(
  "--ignore-files",
  "README.md",
  "SIGNING.md",
  "sign-unlisted.ps1",
  ".gitignore",
  "blockshorts-firefox.zip",
  "blockshorts-firefox.xpi",
  "web-ext-artifacts/**"
)

if (-not $SkipLint) {
  & $webExt.Source lint --source-dir $SourceDir @ignoreArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

& $webExt.Source sign `
  --channel unlisted `
  --source-dir $SourceDir `
  --artifacts-dir $ArtifactsDir `
  --api-key $env:WEB_EXT_API_KEY `
  --api-secret $env:WEB_EXT_API_SECRET `
  @ignoreArgs

exit $LASTEXITCODE
