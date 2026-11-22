param([Parameter(Mandatory=$true)][string]$Apk)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root=(Resolve-Path "$PSScriptRoot/..").Path
$zip=[IO.Compression.ZipFile]::OpenRead((Resolve-Path $Apk).Path)
try{
 $entries=@{}
 foreach($entry in $zip.Entries){if($entries.ContainsKey($entry.FullName)){throw "ZIP 路径重复: $($entry.FullName)"};$entries[$entry.FullName]=$entry}
 $files=@(Get-ChildItem "$root/dist" -Recurse -File -Force)
 $count=0
 foreach($file in $files){
  $relative=[IO.Path]::GetRelativePath("$root/dist",$file.FullName).Replace('\','/')
  $entry=$entries["assets/site/$relative"]
  if(!$entry -or $entry.Length -ne $file.Length){throw "缺失或长度错误: $relative"}
  $source=[IO.File]::OpenRead($file.FullName);$packed=$entry.Open()
  try{
   $a=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($source))
   $b=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($packed))
   if($a -ne $b){throw "字节错误: $relative"}
  }finally{$source.Dispose();$packed.Dispose()}
  $count++
 }
 $actual=@($zip.Entries | Where-Object {$_.FullName.StartsWith('assets/site/') -and !$_.FullName.EndsWith('/')}).Count
 if($actual -ne $count){throw "资源数量错误: $actual / $count"}
 if(!$entries['classes.dex'] -or !$entries['AndroidManifest.xml']){throw '缺少 Android 入口'}
 foreach($name in @('network','runtime','storage')){
  $adapter=$entries["assets/android-$name.js"]
  if(!$adapter){throw "缺少 Android 适配器: $name"}
  $source=[IO.File]::OpenRead("$PSScriptRoot/$name.js");$packed=$adapter.Open()
  try{if([Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($source)) -ne [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($packed))){throw "Android 适配器字节不一致: $name"}}finally{$source.Dispose();$packed.Dispose()}
 }
 Write-Output "PASS: APK 内 $count 个静态文件路径、长度及 SHA-256 与 dist 完全一致。"
 Write-Output 'PASS: Android 网络、生命周期及偏好适配器与源码字节一致。'
}finally{$zip.Dispose()}
