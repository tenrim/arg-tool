param(
  [ValidateSet('Start','Status','IndexProject','IndexReferences','SearchProject','SearchReference')]
  [string]$Action='Status',
  [string]$Repo,
  [string]$Query
)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskConfig=Get-Content (Join-Path $taskRoot 'tools/reference-code.json') -Raw | ConvertFrom-Json
$taskXerj=Join-Path $env:LOCALAPPDATA 'Programs/xerj/xerj.exe'
$taskData=Join-Path $env:LOCALAPPDATA 'XERJ/arg-tool'
$env:XERJ_DISABLE_FEEDBACK='true'
if(!(Test-Path -LiteralPath $taskXerj)){throw '尚未安装 XERJ，请先按 docs/REFERENCE_CODING.md 安装。'}
function Invoke-TaskXerj([string[]]$Arguments){
  & $taskXerj @Arguments
  if($LASTEXITCODE -notin @(0,3)){throw "XERJ 执行失败（$LASTEXITCODE）。请检查实际错误，不删除已有索引。"}
  if($LASTEXITCODE -eq 3){Write-Warning '本次有跳过项；查看输出确认 code_files_junked 与 datasets_refused，不能把源码拒收当作完成。'}
}
if($Action -eq 'Start'){
  try{$taskHealth=Invoke-RestMethod ($taskConfig.endpoint+'/') -TimeoutSec 2}catch{$taskHealth=$null}
  if($taskHealth){Write-Output '19200 已有服务；未创建或替换进程。请用 Status 核对。';return}
  New-Item -ItemType Directory -Force $taskData | Out-Null
  $taskProcess=Start-Process -FilePath $taskXerj -ArgumentList @('--disable-feedback','--insecure','--bind','127.0.0.1','--port','19200','--embed-mode','lexical','--data-dir',$taskData) -WindowStyle Hidden -PassThru -RedirectStandardOutput "$taskData/server.stdout.log" -RedirectStandardError "$taskData/server.stderr.log"
  $taskProcess.Id | Set-Content "$taskData/server.pid"
  for($attempt=0;$attempt -lt 30;$attempt++){
    try{Invoke-RestMethod ($taskConfig.endpoint+'/') -TimeoutSec 1 | Out-Null;Write-Output "本地 XERJ 已启动，PID $($taskProcess.Id)";return}catch{Start-Sleep -Milliseconds 200}
  }
  throw "启动未就绪，请查看 $taskData/server.stderr.log"
}
if($Action -eq 'Status'){
  Invoke-RestMethod ($taskConfig.endpoint+'/_cluster/health') -TimeoutSec 5 | Select-Object status,number_of_nodes,active_primary_shards
  $taskIndices=Invoke-RestMethod ($taskConfig.endpoint+'/_cat/indices?format=json') -TimeoutSec 10
  $taskIndices | ForEach-Object { $_ } | Where-Object { $_.index -like 'mist*' } | Select-Object index,'docs.count','store.size'
  return
}
if($Action -like 'Search*'){
  if(!$Query){throw '请用 -Query 提供具体符号或问题关键词。'}
  $taskPrefix=$taskConfig.projectPrefix
  if($Action -eq 'SearchReference'){
    $taskRef=$taskConfig.references | Where-Object id -eq $Repo
    if(!$taskRef){throw '用 -Repo 选择 ittools、cyberchef、omnitools、animateui 或 qalculate。'}
    $taskPrefix=$taskRef.prefix
  }
  Invoke-TaskXerj @('search','--url',$taskConfig.endpoint,'--prefix',$taskPrefix,'-k','4','--full','900',$Query)
  return
}
$taskTargets=@(@{folder=$taskRoot;prefix=$taskConfig.projectPrefix;id='project'})
if($Action -eq 'IndexReferences'){
  $taskTargets=@($taskConfig.references | Where-Object { !$Repo -or $_.id -eq $Repo } | ForEach-Object { @{folder=(Join-Path $taskRoot ".reference-code/repos/$($_.folder)");prefix=$_.prefix;id=$_.id;commit=$_.commit} })
  if(!$taskTargets.Count){throw '未找到指定参考库。'}
}
foreach($taskTarget in $taskTargets){
  if($taskTarget.commit){
    $taskActual=(& git -C $taskTarget.folder rev-parse HEAD)
    if($LASTEXITCODE -ne 0 -or $taskActual -ne $taskTarget.commit){throw "参考库 $($taskTarget.id) 与固定提交不符；先核对清单，不能自动升级。"}
  }
  if($taskTarget.id -in @('ittools','animateui')){
    # rc.98 can mistake Vue SFCs for XML and drop script/template content.
    # A local text view preserves the complete source, without changing upstream.
    $taskViewSources=@(Get-ChildItem $taskTarget.folder -Recurse -File -Filter '*.vue')
    if($taskTarget.id -eq 'animateui'){
      $taskRegistry=Join-Path $taskTarget.folder 'apps/v1/apps/www/__registry__/index.tsx'
      if(Test-Path -LiteralPath $taskRegistry){$taskViewSources+=Get-Item -LiteralPath $taskRegistry}
    }
    foreach($taskVue in $taskViewSources){
      $taskRelative=[IO.Path]::GetRelativePath($taskTarget.folder,$taskVue.FullName).Replace('\','/')
      if($taskRelative.Split('/') | Where-Object { $_.StartsWith('.') -or $_ -in @('fixtures','snapshots','testdata','public','node_modules','coverage','dist','build') }){continue}
      $taskView=Join-Path $taskTarget.folder "xerj-plain-source/$taskRelative.txt"
      New-Item -ItemType Directory -Force (Split-Path $taskView -Parent) | Out-Null
      [IO.File]::WriteAllText($taskView,"Source: $taskRelative`nOriginal line 1 is line 4 below.`n`n"+[IO.File]::ReadAllText($taskVue.FullName),[Text.UTF8Encoding]::new($false))
    }
  }
  $taskStateId=$taskTarget.id
  if($taskTarget.id -eq 'project' -and $taskConfig.projectStateId){$taskStateId=$taskConfig.projectStateId}
  Invoke-TaskXerj @('autoindex',$taskTarget.folder,'--url',$taskConfig.endpoint,'--prefix',$taskTarget.prefix,'--no-graph','--no-semantic','--code-analyzer','code','--workers','2','--state-dir',(Join-Path $taskData "state/$taskStateId"),'--progress','plain')
}
