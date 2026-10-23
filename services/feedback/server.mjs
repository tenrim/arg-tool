import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {validateReport,reportMail} from './report.mjs';
import {ensureFeedbackDependencies} from './dependencies.mjs';
import {createFeedbackIngress} from './ingress.mjs';

export function createFeedbackServer({send,origins,trustProxy=false,now=Date.now,perIP=5,perHour=60,ingressOptions}){
  const ingress=createFeedbackIngress(ingressOptions);
  const reports=new Map(),rates=new Map();let globalStart=now(),globalCount=0;
  const reply=(res,status,body)=>{if(res.destroyed||res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  const server=createServer(async(req,res)=>{
    if(req.url!=='/api/feedback')return reply(res,404,{message:'Not found'});
    if(req.method!=='POST')return reply(res,405,{message:'Method not allowed'});
    if(!origins.includes(req.headers.origin))return reply(res,403,{message:'请求来源不正确。'});
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(res,415,{message:'需要 JSON 报告。'});
    const t=now();for(const [key,value]of reports)if(value.expires<t&&!value.pending)reports.delete(key);for(const [key,value]of rates)if(t-value.at>600000)rates.delete(key);
    if(t-globalStart>3600000){globalStart=t;globalCount=0;}
    const peer=req.socket.remoteAddress||'unknown',local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(peer);
    const forwarded=req.headers['x-real-ip'];const ip=trustProxy&&local&&typeof forwarded==='string'&&/^[a-f\d:.]{3,64}$/i.test(forwarded)?forwarded:peer;
    let admission;
    try{
      admission=ingress.acquire(req,res);
      const bytes=await admission.read();
      let input;try{input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw Object.assign(Error('报告格式不正确。'),{status:400});}
      const report=validateReport(input),mail=reportMail(report),prior=reports.get(report.id);
      if(prior){
        if(prior.digest!==mail.digest)return reply(res,409,{message:'报告内容已变化，请重新提交。'});
        if(prior.pending){await prior.pending;return reply(res,prior.ok?200:503,prior.ok?{id:report.id,accepted:true}:{message:prior.retrySafe?'邮件服务未接收报告，可以稍后重试。':'上次发送未能确认，请复制报告联系维护者。'});}
        if(prior.ok)return reply(res,200,{id:report.id,accepted:true});
        if(!prior.retrySafe)return reply(res,503,{message:'上次发送未能确认，请复制报告联系维护者。'});
        reports.delete(report.id);
      }
      const rate=rates.get(ip)||{at:t,count:0};if(rate.count>=perIP||globalCount>=perHour||reports.size>=1000||rates.size>=10000)return reply(res,429,{message:'提交较频繁，请稍后再试或复制报告联系维护者。'});
      rate.count++;rates.set(ip,rate);globalCount++;
      const record={digest:mail.digest,expires:t+86400000,ok:false,retrySafe:false,pending:null};reports.set(report.id,record);
      record.pending=(async()=>{try{await send(mail,report.id);record.ok=true;}catch(error){record.retrySafe=error?.retrySafe===true;/* Never expose SMTP responses, addresses or credentials. */}finally{record.pending=null;}})();
      await record.pending;
      reply(res,record.ok?200:503,record.ok?{id:report.id,accepted:true}:{message:record.retrySafe?'邮件服务未接收报告，可以稍后重试。':'邮件服务暂时不可用，报告尚未确认发送。请复制或下载报告。'});
    }catch(error){if(!res.headersSent)reply(res,error.status||400,{message:error.status?error.message:'无法读取报告，请重试。'});}finally{admission?.release();}
  });
  server.once('close',()=>ingress.close());server.requestTimeout=30000;server.headersTimeout=15000;return server;
}

export async function mailTransport(env=process.env,{signal}={}){
  const email=/^[A-Za-z\d._%+-]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$/;
  if(!email.test(env.SMTP_USER||'')||!email.test(env.REPORT_TO||'')||!env.SMTP_PASS)throw Error('请配置 SMTP_USER、SMTP_PASS 和 REPORT_TO。');
  const port=Number(env.SMTP_PORT||465);if(![465,587].includes(port))throw Error('SMTP 必须使用 TLS 端口 465 或 587。');
  await ensureFeedbackDependencies({signal});
  const {default:nodemailer}=await import('nodemailer');
  const transport=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.qq.com',port,secure:port===465,requireTLS:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true});
  return {verify:()=>transport.verify(),close:()=>transport.close(),async send(mail,id){
    try{
      const response=await transport.sendMail({from:{name:'迷雾工具箱',address:env.SMTP_USER},to:env.REPORT_TO,subject:mail.subject,text:mail.text,attachments:mail.attachments,messageId:`<${id}@${env.SMTP_USER.split('@')[1]}>`,disableFileAccess:true,disableUrlAccess:true});
      if(!response.accepted?.includes(env.REPORT_TO)||response.rejected?.length)throw Error('邮件服务器未接收报告。');
    }catch(error){
      // A protocol rejection is definitive; a disconnect after DATA may have
      // delivered the mail already, so never infer retry safety from a timeout.
      throw Object.assign(Error('SMTP submission failed'),{retrySafe:error.code==='EAUTH'||Number(error.responseCode)>=400&&Number(error.responseCode)<600});
    }
  }};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{const transport=await mailTransport();
    if(process.argv.includes('--verify')){await transport.verify();console.log('SMTP connection and authentication verified; no message sent.');}
    else{const origins=(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);if(!origins.length||origins.some(s=>new URL(s).origin!==s))throw Error('请配置精确的 ALLOWED_ORIGINS。');
      const server=createFeedbackServer({send:transport.send,origins,trustProxy:process.env.TRUST_PROXY==='true'});server.listen(Number(process.env.PORT||6143),process.env.HOST||'127.0.0.1',()=>console.log('Feedback service ready.'));}
  }catch(error){console.error('Feedback service failed:',error.code||'CONFIG_OR_CONNECTION_ERROR');process.exitCode=1;}
}
