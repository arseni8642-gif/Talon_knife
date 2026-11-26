$root = $args[0]
if (-not $root) { throw 'Root path is required' }
$prefix = 'http://127.0.0.1:8765/'

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Serving $root at $prefix"

function Get-Mime([string]$name) {
  switch ($name.ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'text/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.toml' { 'text/plain; charset=utf-8' }
    '.md'   { 'text/markdown; charset=utf-8' }
    '.mp4'  { 'video/mp4' }
    '.glb'  { 'model/gltf-binary' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.png'  { 'image/png' }
    '.webp' { 'image/webp' }
    '.svg'  { 'image/svg+xml' }
    default { 'application/octet-stream' }
  }
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $rel = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
      $full = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $rel))
      if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
      }
      if ([IO.Directory]::Exists($full)) { $full = [IO.Path]::Combine($full, 'index.html') }
      if (-not [IO.File]::Exists($full)) {
        $context.Response.StatusCode = 404
        $context.Response.Close()
        continue
      }
      $bytes = [IO.File]::ReadAllBytes($full)
      $context.Response.ContentType = Get-Mime ([IO.Path]::GetExtension($full))
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      try { $context.Response.StatusCode = 500 } catch {}
    } finally {
      try { $context.Response.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
