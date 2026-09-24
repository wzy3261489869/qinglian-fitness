# qinglian-deploy: push + wait Actions deploy + public verification
# Usage: .\.trae\skills\qinglian-deploy\scripts\deploy.ps1
param(
    [string]$Repo = "wzy3261489869/qinglian-fitness",
    [string]$SiteUrl = "https://qinglian-fitness-wzy.netlify.app"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")
$tokenFile = Join-Path $repoRoot ".auth\gh_token.txt"

# Run a native command (git/gh/curl) without its stderr being treated as a PowerShell error.
function Invoke-Native($cmd, [array]$argList) {
    $oldEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $out = & $cmd @argList 2>&1
        return @{ ExitCode = $LASTEXITCODE; Output = ($out -join "`n") }
    } finally {
        $ErrorActionPreference = $oldEAP
    }
}

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; exit 1 }

# 0. Check pending commits
Step "Check push status"
Set-Location $repoRoot
$behindRes = Invoke-Native "git" @("rev-list", "origin/master..HEAD", "--count")
$behind = if ($behindRes.ExitCode -eq 0) { [int]$behindRes.Output.Trim() } else { 0 }
if ($behind -eq 0) {
    Write-Host "  (nothing to push, local == origin/master)" -ForegroundColor DarkYellow
} else {
    Write-Host "  $behind commit(s) to push"
}

# 1. Push
Step "Push to GitHub"
if (-not (Test-Path $tokenFile)) { Fail ".auth\gh_token.txt not found" }
$env:GH_TOKEN = (Get-Content $tokenFile -Raw).Trim()
$pushRes = Invoke-Native "git" @("push", "origin", "master")
Write-Host $pushRes.Output
if ($pushRes.ExitCode -ne 0) { Fail "git push failed (exit $($pushRes.ExitCode))" }
Ok "pushed"

# 2. Wait for Actions deploy
Step "Wait for GitHub Actions deploy (max 180s)"
$shaRes = Invoke-Native "git" @("rev-parse", "HEAD")
if ($shaRes.ExitCode -ne 0) { Fail "git rev-parse HEAD failed" }
$headSha = $shaRes.Output.Trim()
$waited = 0
$runId = $null
$runStatus = $null
while ($waited -lt 180) {
    $ghRes = Invoke-Native "gh" @("run","list","--repo",$Repo,"--branch","master","--limit","5","--json","databaseId,headSha,status,conclusion")
    if ($ghRes.ExitCode -ne 0) { Fail "gh run list failed: $($ghRes.Output)" }
    $runs = $ghRes.Output | ConvertFrom-Json
    $run = $runs | Where-Object { $_.headSha -eq $headSha } | Select-Object -First 1
    if ($run) {
        $runId = $run.databaseId
        if ($run.status -eq "completed") {
            $runStatus = $run.conclusion
            break
        }
    }
    Start-Sleep -Seconds 10
    $waited += 10
    Write-Host "  ...waited ${waited}s" -ForegroundColor DarkGray
}
if (-not $runId) { Fail "no Actions run found for current HEAD SHA" }
if ($runStatus -ne "success") { Fail "Actions not successful (conclusion=$runStatus). See https://github.com/$Repo/actions/runs/$runId" }
Ok "Actions deploy succeeded (run #$runId)"

# 3. Public verification
Step "Public site verification"
# 3a. API health
try {
    $h = Invoke-RestMethod -Uri "$SiteUrl/api/health" -TimeoutSec 15
    if (-not $h.ok) { Fail "/api/health returned ok=false" }
    Ok "API health: $($h.mode)"
} catch { Fail "/api/health failed: $($_.Exception.Message)" }

# 3b. app.js version
$tmpJs = Join-Path $env:TEMP "ql_app_$([guid]::NewGuid().ToString('N')).js"
$curlRes = Invoke-Native "curl.exe" @("-s", "$SiteUrl/app.js", "-o", $tmpJs)
if ($curlRes.ExitCode -ne 0) { Fail "curl app.js failed (exit $($curlRes.ExitCode))" }
$js = Get-Content $tmpJs -Raw
$verMatch = [regex]::Match($js, 'v(\d+\.\d+\.\d+)')
if ($verMatch.Success) { Ok "app.js version: $($verMatch.Value)" } else { Fail "version not found in app.js" }
Remove-Item $tmpJs -ErrorAction SilentlyContinue

# 3c. sw.js cache version
$tmpSw = Join-Path $env:TEMP "ql_sw_$([guid]::NewGuid().ToString('N')).js"
$curlRes = Invoke-Native "curl.exe" @("-s", "$SiteUrl/sw.js", "-o", $tmpSw)
if ($curlRes.ExitCode -ne 0) { Fail "curl sw.js failed (exit $($curlRes.ExitCode))" }
$sw = Get-Content $tmpSw -Raw
if ($sw -match "qinglian-v(\d+)") { Ok "sw.js cache: qinglian-v$($Matches[1])" } else { Fail "cache version not found in sw.js" }
Remove-Item $tmpSw -ErrorAction SilentlyContinue

# 3d. index.html no-cache header
$curlRes = Invoke-Native "curl.exe" @("-sI", "$SiteUrl/")
if ($curlRes.ExitCode -ne 0) { Fail "curl index.html headers failed (exit $($curlRes.ExitCode))" }
$headers = $curlRes.Output
$ccLine = ($headers -split "`n" | Where-Object { $_ -match "cache-control" }) -join ""
if ($ccLine -match "no-store") { Ok "HTML cache: no-store" } else { Fail "HTML missing no-store cache header" }

Write-Host "`nAll checks passed. Site live at $SiteUrl" -ForegroundColor Green
