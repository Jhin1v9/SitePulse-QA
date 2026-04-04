$runs = @(
  @{ id = 'example'; url = 'https://example.com' },
  @{ id = 'superclim'; url = 'https://superclim.es' },
  @{ id = 'openai'; url = 'https://www.openai.com' }
)
$base = 'C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check'
$results = @()
foreach ($run in $runs) {
  $cfg = Join-Path $base ($run.id + '.json')
  $stdoutPath = Join-Path $base ($run.id + '.stdout.log')
  $stderrPath = Join-Path $base ($run.id + '.stderr.log')
  if (Test-Path $stdoutPath) { Remove-Item $stdoutPath -Force }
  if (Test-Path $stderrPath) { Remove-Item $stderrPath -Force }
  & npm --prefix qa run audit:cmd -- --config $cfg --no-server --scope full --fresh --human-log 1> $stdoutPath 2> $stderrPath
  $exitCode = $LASTEXITCODE
  $reportDir = Join-Path $base ($run.id + '\reports')
  $jsonReport = Get-ChildItem -Path $reportDir -Filter '*sitepulse-report-final.json' -ErrorAction SilentlyContinue | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
  $issueLog = Get-ChildItem -Path $reportDir -Filter '*sitepulse-issues-final.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
  $summary = $null
  if ($jsonReport) {
    try {
      $summary = Get-Content $jsonReport.FullName -Raw | ConvertFrom-Json
    } catch {}
  }
  $stderrTail = if (Test-Path $stderrPath) { (Get-Content $stderrPath -Tail 12) -join "`n" } else { '' }
  $stdoutTail = if (Test-Path $stdoutPath) { (Get-Content $stdoutPath -Tail 20) -join "`n" } else { '' }
  $results += [pscustomobject]@{
    id = $run.id
    url = $run.url
    exitCode = $exitCode
    ok = if ($summary) { [bool]$summary.ok } else { $false }
    totalIssues = if ($summary) { [int]$summary.summary.totalIssues } else { -1 }
    routesChecked = if ($summary) { [int]$summary.summary.routesChecked } else { -1 }
    actionsMapped = if ($summary) { [int]$summary.summary.actionsMapped } else { -1 }
    seoScore = if ($summary) { [int]$summary.summary.seoScore } else { -1 }
    issueLog = if ($issueLog) { $issueLog.FullName } else { '' }
    jsonReport = if ($jsonReport) { $jsonReport.FullName } else { '' }
    stderrTail = $stderrTail
    stdoutTail = $stdoutTail
  }
}
$results | ConvertTo-Json -Depth 6
