<#
.SYNOPSIS
    Register (or remove) the Windows Scheduled Task that appends one Belentani
    UI asset per day.

.DESCRIPTION
    The task runs generator\run-daily.cmd once a day. The generator is
    append-only: it never deletes or rewrites data\generated.jsonl.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File generator\install-task.ps1
    powershell -ExecutionPolicy Bypass -File generator\install-task.ps1 -Time 08:30
    powershell -ExecutionPolicy Bypass -File generator\install-task.ps1 -Uninstall
#>

param(
    [string]$Time = "09:00",
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$taskName = "BelentaniDailyAsset"

if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Removed scheduled task '$taskName'."
    return
}

$root = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot "run-daily.cmd"

if (-not (Test-Path -LiteralPath $runner)) {
    throw "Runner not found: $runner"
}

$action = New-ScheduledTaskAction -Execute $runner -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Append one Belentani UI asset per day (append-only, no API)." `
    -Force | Out-Null

Write-Host "Registered '$taskName' to run daily at $Time."
Write-Host "Runner: $runner"
