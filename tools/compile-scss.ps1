param(
  [string]$Entry = "style/main.scss",
  [string]$Output = "style/main.css"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$entryPath = Join-Path $root $Entry
$outputPath = Join-Path $root $Output

if (-not (Test-Path -LiteralPath $entryPath)) {
  throw "No existe el SCSS de entrada: $Entry"
}

function Resolve-ScssUse {
  param(
    [string]$Import,
    [string]$BaseDirectory
  )

  $normalized = $Import -replace "/", [IO.Path]::DirectorySeparatorChar
  $importDirectory = Split-Path $normalized -Parent
  $importName = Split-Path $normalized -Leaf
  $partialName = "_" + $importName
  $partialBase = if ([string]::IsNullOrWhiteSpace($importDirectory)) {
    $partialName
  } else {
    Join-Path $importDirectory $partialName
  }

  $candidates = @(
    (Join-Path $BaseDirectory "$normalized.scss"),
    (Join-Path $BaseDirectory "$normalized.css"),
    (Join-Path $BaseDirectory "$partialBase.scss"),
    (Join-Path $BaseDirectory "$partialBase.css")
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }

  throw "No se pudo resolver @use `"$Import`" desde $BaseDirectory"
}

$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

function Compile-ScssFile {
  param([string]$Path)

  $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
  if (-not $seen.Add($resolvedPath)) {
    return ""
  }

  $baseDirectory = Split-Path -Parent $resolvedPath
  $chunks = [System.Collections.Generic.List[string]]::new()
  $chunks.Add("/* Source: " + ($resolvedPath.Substring($root.Length + 1) -replace "\\", "/") + " */")

  foreach ($line in Get-Content -LiteralPath $resolvedPath) {
    if ($line -match '^\s*@use\s+["'']([^"'']+)["'']\s*;?\s*$') {
      $usePath = Resolve-ScssUse -Import $Matches[1] -BaseDirectory $baseDirectory
      $chunks.Add((Compile-ScssFile -Path $usePath))
    } else {
      $chunks.Add($line)
    }
  }

  return ($chunks -join [Environment]::NewLine)
}

$compiled = Compile-ScssFile -Path $entryPath
$banner = "/* Generated from $Entry. Run: powershell -ExecutionPolicy Bypass -File tools/compile-scss.ps1 */"
$content = $banner + [Environment]::NewLine + $compiled + [Environment]::NewLine
[IO.File]::WriteAllText($outputPath, $content, [Text.UTF8Encoding]::new($false))

Write-Output "Compiled $Entry -> $Output"
