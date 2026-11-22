param(
 [string]$Tools = "$PSScriptRoot/../outputs/apk-build/tools",
 [ValidateSet('Test','Validation','Release')][string]$Variant='Release',
 [ValidateRange(1,99)][int]$AndroidRevision=1,
 [string]$SigningDirectory
)
$ErrorActionPreference='Stop'
$root=(Resolve-Path "$PSScriptRoot/..").Path
$toolsPath=(Resolve-Path $Tools).Path
$jdk=(Get-ChildItem "$toolsPath/jdk" -Directory | Select-Object -First 1).FullName
$buildTools=(Get-ChildItem "$toolsPath/buildtools" -Directory | Select-Object -First 1).FullName
$platform=(Get-ChildItem "$toolsPath/platform" -Directory | Select-Object -First 1).FullName
$env:JAVA_HOME=$jdk
$env:PATH="$jdk/bin;$env:PATH"
$out="$root/outputs/apk-build"
New-Item -ItemType Directory -Force $out | Out-Null
function Run([string]$File,[string[]]$Arguments){ & $File @Arguments; if($LASTEXITCODE -ne 0){throw "命令失败: $File ($LASTEXITCODE)"} }
$versionText=Get-Content -LiteralPath "$root/public/site-version.js" -Raw
if($versionText -notmatch "APP_VERSION\s*=\s*'V(\d+)\.(\d+)(?:\.(\d+))?'"){throw '无法读取网站版本'}
$version=$Matches[0].Split("'")[1]
$versionCode=([int]$Matches[1]*1000000)+([int]$Matches[2]*10000)+([int]$Matches[3]*100)+$AndroidRevision
$manifest=Get-Content -LiteralPath "$PSScriptRoot/AndroidManifest.xml" -Raw
$manifest=$manifest -replace 'android:versionCode="[^"]+"',"android:versionCode=`"$versionCode`""
$suffix=if($Variant -eq 'Release'){''}elseif($Variant -eq 'Validation'){'-validation'}else{'-test'}
$manifest=$manifest -replace 'android:versionName="[^"]+"',"android:versionName=`"$($version.TrimStart('V'))$suffix`""
if($Variant -ne 'Release'){
 $manifest=$manifest.Replace('android:debuggable="false"','android:debuggable="true"')
 $label=if($Variant -eq 'Validation'){'迷雾工具箱（验收）'}else{'迷雾工具箱（测试）'}
 $manifest=$manifest.Replace('android:label="迷雾工具箱"',"android:label=`"$label`"")
}
if($Variant -eq 'Test'){$manifest=$manifest.Replace('package="cn.mistarg.toolbox"','package="cn.mistarg.toolbox.test"')}
[IO.File]::WriteAllText("$out/AndroidManifest.xml",$manifest)
# Only these two script-owned staging directories may be removed.
foreach($folder in @('classes','dex')){
 $target=[IO.Path]::GetFullPath("$out/$folder")
 if(!$target.StartsWith([IO.Path]::GetFullPath($out)+[IO.Path]::DirectorySeparatorChar)){throw '非法暂存路径'}
 if(Test-Path -LiteralPath $target){Remove-Item -LiteralPath $target -Recurse -Force}
 New-Item -ItemType Directory -Force $target | Out-Null
}
if(!(Test-Path "$root/dist/index.html")){throw '请先执行 npm run build'}
$javaFiles=@(Get-ChildItem "$PSScriptRoot/src" -Filter '*.java' -Recurse | ForEach-Object FullName)
Run "$jdk/bin/javac.exe" (@('-encoding','UTF-8','--release','8','-classpath',"$platform/android.jar",'-d',"$out/classes")+$javaFiles)
Run "$jdk/bin/jar.exe" @('cf',"$out/classes.jar",'-C',"$out/classes",'.')
Run "$buildTools/d8.bat" @('--lib',"$platform/android.jar",'--min-api','28','--output',"$out/dex","$out/classes.jar")
New-Item -ItemType Directory -Force "$out/assets/site" | Out-Null
& robocopy.exe "$root/dist" "$out/assets/site" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1
if($LASTEXITCODE -ge 8){throw '资源复制失败'}
Copy-Item -LiteralPath "$PSScriptRoot/network.js" -Destination "$out/assets/android-network.js" -Force
Copy-Item -LiteralPath "$PSScriptRoot/runtime.js" -Destination "$out/assets/android-runtime.js" -Force
Copy-Item -LiteralPath "$PSScriptRoot/storage.js" -Destination "$out/assets/android-storage.js" -Force
Copy-Item -LiteralPath "$root/LICENSE","$root/THIRD_PARTY.md","$root/upstream-manifest.json" -Destination "$out/assets" -Force
Copy-Item -LiteralPath "$platform/android.jar" -Destination "$out/platform.jar" -Force
New-Item -ItemType Directory -Force "$out/res" | Out-Null
Copy-Item "$PSScriptRoot/res/*" "$out/res" -Recurse -Force
Push-Location $out
try{Run "$buildTools/aapt.exe" @('package','-f','-M','AndroidManifest.xml','-S','res','-I','platform.jar','-F','unsigned.apk')}finally{Pop-Location}
Run "$jdk/bin/jar.exe" @('uf',"$out/unsigned.apk",'-C',$out,'assets')
Push-Location "$out/dex"
try{Run "$buildTools/aapt.exe" @('add','../unsigned.apk','classes.dex')}finally{Pop-Location}
Push-Location $out
try{Run "$buildTools/zipalign.exe" @('-f','4','unsigned.apk','aligned.apk')}finally{Pop-Location}
if($Variant -eq 'Test'){
 $key="$out/test.keystore";$alias='androiddebugkey';$env:MIST_SIGN_PASS='android'
 if(!(Test-Path $key)){Run "$jdk/bin/keytool.exe" @('-genkeypair','-keystore',$key,'-storepass:env','MIST_SIGN_PASS','-keypass:env','MIST_SIGN_PASS','-alias',$alias,'-dname','CN=Mist Toolbox Test','-keyalg','RSA','-keysize','2048','-validity','3650')}
}else{
 $signing=if($SigningDirectory){(Resolve-Path -LiteralPath $SigningDirectory).Path}else{"$root/outputs/android-signing"}
 if(!$SigningDirectory){New-Item -ItemType Directory -Force $signing | Out-Null}
 $key="$signing/mist-toolbox-release.p12";$passwordFile="$signing/signing-password.txt";$alias='misttoolbox'
 if((Test-Path $key) -ne (Test-Path $passwordFile)){throw '发行密钥或密码文件缺失，请从备份恢复；不会生成替代密钥'}
 if($SigningDirectory -and !(Test-Path -LiteralPath $key)){throw '指定的发行密钥不存在'}
 if(!(Test-Path $key)){
  $env:MIST_SIGN_PASS=[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  [IO.File]::WriteAllText($passwordFile,$env:MIST_SIGN_PASS)
  Run "$jdk/bin/keytool.exe" @('-genkeypair','-storetype','PKCS12','-keystore',$key,'-storepass:env','MIST_SIGN_PASS','-keypass:env','MIST_SIGN_PASS','-alias',$alias,'-dname','CN=Mist Toolbox, O=mistarg.cn','-keyalg','RSA','-keysize','3072','-validity','10000')
 }else{$env:MIST_SIGN_PASS=[IO.File]::ReadAllText($passwordFile)}
 if(!$SigningDirectory){
  $backup="$root/outputs/android-signing-backup";New-Item -ItemType Directory -Force $backup | Out-Null
  Copy-Item -LiteralPath $key,$passwordFile -Destination $backup -Force
 }
}
try{
 $label=if($Variant -eq 'Release'){'正式版'}elseif($Variant -eq 'Validation'){'验收版'}else{'安卓测试'}
 $apk="$out/迷雾工具箱-$version-$label.apk"
 Run "$buildTools/apksigner.bat" @('sign','--ks',$key,'--ks-key-alias',$alias,'--ks-pass','env:MIST_SIGN_PASS','--out',$apk,"$out/aligned.apk")
 Run "$buildTools/apksigner.bat" @('verify','--verbose','--print-certs',$apk)
 Copy-Item -LiteralPath $apk -Destination "$out/signed.apk" -Force
 Push-Location $out
 try{Run "$buildTools/aapt.exe" @('dump','badging','signed.apk')}finally{Pop-Location}
 (Get-FileHash -LiteralPath $apk -Algorithm SHA256).Hash | Set-Content -LiteralPath "$apk.sha256" -Encoding utf8
 Get-Item -LiteralPath $apk | Select-Object FullName,Length
}finally{Remove-Item Env:MIST_SIGN_PASS -ErrorAction SilentlyContinue}
