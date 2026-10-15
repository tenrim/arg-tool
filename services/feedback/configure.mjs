// Explicit local import only. Never log credentials or bundle .env with a release.
import {readFile,writeFile,chmod} from 'node:fs/promises';
const path=process.argv[2];if(!path)throw Error('请提供邮箱配置文本路径。');
const text=await readFile(path,'utf8'),addresses=[...text.matchAll(/[A-Za-z\d._%+-]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}/g)].map(m=>m[0]);
const password=text.match(/授权码\s*[:：=]\s*([^\s]+)/)?.[1];
if(addresses.length!==2||!password)throw Error('需要发送邮箱、授权码和接收邮箱。');
if(!addresses[0].endsWith('@qq.com'))throw Error('该导入器当前只识别 QQ 邮箱。');
const config={SMTP_HOST:'smtp.qq.com',SMTP_PORT:'465',SMTP_USER:addresses[0],SMTP_PASS:password,REPORT_TO:addresses[1],HOST:'127.0.0.1',PORT:'6143',ALLOWED_ORIGINS:'http://localhost:3000',TRUST_PROXY:'false'};
const target=new URL('./.env',import.meta.url);await writeFile(target,Object.entries(config).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n',{mode:0o600});await chmod(target,0o600);console.log('Private SMTP configuration imported; values not displayed.');
