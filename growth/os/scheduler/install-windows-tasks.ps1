# Đăng ký job script của Mira Growth OS vào Windows Task Scheduler.
# Dùng: powershell -ExecutionPolicy Bypass -File growth/os/scheduler/install-windows-tasks.ps1 [-Uninstall]
param([switch]$Uninstall)

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$node = (Get-Command node).Source
$jobs = @(
  @{ name = 'collect-metrics'; time = '07:00'; days = $null },
  @{ name = 'verify-tasks';    time = '18:00'; days = $null },
  @{ name = 'daily-report';    time = '20:00'; days = $null },
  @{ name = 'weekly-report';   time = '17:00'; days = 'Friday' },
  @{ name = 'healthcheck';     time = '06:50'; days = $null }
)

foreach ($j in $jobs) {
  $taskName = "MiraGrowth-$($j.name)"
  if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "gỡ $taskName"
    continue
  }
  $action = New-ScheduledTaskAction -Execute $node -Argument "growth/os/bin/os.mjs run $($j.name)" -WorkingDirectory $repo
  if ($j.days) { $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $j.days -At $j.time }
  else { $trigger = New-ScheduledTaskTrigger -Daily -At $j.time }
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Host "đăng ký $taskName lúc $($j.time) $($j.days)"
}
if (-not $Uninstall) { Write-Host "Xong. Kiểm: Get-ScheduledTask -TaskName 'MiraGrowth-*'" }
