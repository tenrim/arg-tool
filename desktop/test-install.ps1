param(
  [Parameter(Mandatory = $true)][string]$Installer,
  [switch]$Online
)

$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskBuild = (Resolve-Path -LiteralPath (Join-Path $taskRoot 'outputs/windows-offline')).Path
$taskInstaller = (Resolve-Path -LiteralPath $Installer).Path
if (!(Split-Path -Parent $taskInstaller).Equals($taskBuild, [StringComparison]::OrdinalIgnoreCase)) {
  throw '验收对象必须位于 outputs/windows-offline。'
}
$taskUninstallKeys = @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
)
$taskExisting = Get-ChildItem $taskUninstallKeys -ErrorAction SilentlyContinue |
  Get-ItemProperty | Where-Object { $_.DisplayName -in '迷雾工具箱', '迷雾工具箱（离线测试版）' }
if ($taskExisting) { throw '本机已有迷雾工具箱安装。为保留已有安装，停止本次安装验收。' }

$taskId = [Guid]::NewGuid().ToString('N')
$taskOutput = Join-Path $taskBuild "verify-$taskId"
$taskInstallDir = Join-Path $taskOutput 'installed'
$taskApp = Join-Path $taskInstallDir 'MistToolboxOffline.exe'
$taskProfile = Join-Path $taskOutput 'profile'
$taskProbe = Join-Path $taskOutput 'network-probe.exe'
$taskRuleNames = @()
New-Item -ItemType Directory -Path $taskOutput | Out-Null
Copy-Item -LiteralPath (Get-Command curl.exe).Source -Destination $taskProbe

# 仅保留自动化所需的回环，阻断测试程序的外部 IPv4 / IPv6 连接。
$taskRemote = @(
  '0.0.0.0-126.255.255.255',
  '128.0.0.0-255.255.255.255',
  '::2-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
)
$taskProbeArgs = @('-sS', '-I', '--connect-timeout', '4', '--max-time', '8', 'https://registry.npmjs.org/')
& $taskProbe @taskProbeArgs 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw '外网基线探针失败，无法核实阻断前后的差异。' }

try {
  foreach ($taskProgram in @($taskInstaller, $taskApp, $taskProbe)) {
    $taskRule = "MistToolboxOffline-$taskId-$($taskRuleNames.Count)"
    New-NetFirewallRule -Name $taskRule -DisplayName $taskRule -Direction Outbound -Action Block -Program $taskProgram -RemoteAddress $taskRemote -Profile Any | Out-Null
    $taskRuleNames += $taskRule
  }
  & $taskProbe @taskProbeArgs 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { throw '添加规则后外网探针仍能连接。' }
  Write-Output '外网探针确认：系统防火墙应用出站阻断前可连接，应用出站阻断后连接失败。'
  Get-NetFirewallRule -Name $taskRuleNames | Select-Object Name, Enabled, Direction, Action |
    ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $taskOutput 'firewall.json')

  $taskSetup = Start-Process -FilePath $taskInstaller -ArgumentList @('/S', "/D=$taskInstallDir") -WindowStyle Hidden -PassThru -Wait
  if ($taskSetup.ExitCode -ne 0 -or !(Test-Path -LiteralPath $taskApp)) {
    throw "离线安装失败，退出码 $($taskSetup.ExitCode)。"
  }
  Write-Output '已在系统出站阻断下运行正式安装器，安装退出码为 0。'
  try {
    & node (Join-Path $PSScriptRoot 'smoke.mjs') $taskApp $taskProfile '--blocked' |
      Tee-Object -FilePath (Join-Path $taskOutput 'smoke.json')
    if ($LASTEXITCODE -ne 0) { throw "已安装软件验收失败，退出码 $LASTEXITCODE。" }
    if ($Online) {
      $taskAppRule = $taskRuleNames[1]
      Remove-NetFirewallRule -Name $taskAppRule
      $taskRuleNames = @($taskRuleNames | Where-Object { $_ -ne $taskAppRule })
      Write-Output '已恢复测试应用的出站连接，使用同一安装和配置开始联网验收。'
      & node (Join-Path $PSScriptRoot 'live.mjs') $taskApp $taskProfile '--quick' |
        Tee-Object -FilePath (Join-Path $taskOutput 'live.json')
      if ($LASTEXITCODE -ne 0) { throw "联网验收有未通过项目，见 $taskOutput/live.json。" }
    }
  } finally {
    $taskUninstall = @(Get-ChildItem -LiteralPath $taskInstallDir -File -Filter 'Uninstall *.exe')
    if ($taskUninstall.Count -ne 1) { throw "未找到本次测试的唯一卸载器：$taskInstallDir" }
    $taskRemove = Start-Process -FilePath $taskUninstall[0].FullName -ArgumentList '/S' -WindowStyle Hidden -PassThru -Wait
    if ($taskRemove.ExitCode -ne 0) { throw "测试安装卸载失败，退出码 $($taskRemove.ExitCode)。" }
  }
} finally {
  if ($taskRuleNames.Count) { Remove-NetFirewallRule -Name $taskRuleNames }
}
Write-Output "验证记录：$taskOutput"
