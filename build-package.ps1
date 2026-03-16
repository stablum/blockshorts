param(
  [string]$OutputPath = (Join-Path $PSScriptRoot "blockshorts-firefox.xpi")
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$stagingPath = [System.IO.Path]::ChangeExtension($OutputPath, ".zip")
$files = @(
  @{ Source = "manifest.json"; Entry = "manifest.json" },
  @{ Source = "content.js"; Entry = "content.js" },
  @{ Source = "README.md"; Entry = "README.md" },
  @{ Source = "LICENSE"; Entry = "LICENSE" },
  @{ Source = "icons\\blockshorts.svg"; Entry = "icons/blockshorts.svg" }
)

foreach ($path in @($OutputPath, $stagingPath)) {
  if (Test-Path $path) {
    Remove-Item $path -Force
  }
}

$archive = [System.IO.Compression.ZipFile]::Open($stagingPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $sourcePath = Join-Path $root $file.Source
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $sourcePath, $file.Entry) | Out-Null
  }
}
finally {
  $archive.Dispose()
}

Move-Item $stagingPath $OutputPath -Force
