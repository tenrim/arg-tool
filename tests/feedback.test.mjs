import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {errorDiagnostic,diagnostics,rememberAction,captureFailure} from '../public/feedback/model.js';
import {validateReport,reportMail} from '../services/feedback/report.mjs';
import {createFeedbackServer} from '../services/feedback/server.mjs';
const fixture=()=>({schema:1,id:randomUUID(),type:'无法运行',description:'载入图片后发生错误',expected:'显示图片',steps:'选择图片，点击读取',contact:'',diagnostics:{version:'test',task:'native:image',browser:'Chrome/140',viewport:[390,844],actions:[]},attachments:[]});
test('diagnostics whitelist metadata and never include raw errors, inputs, keys or URL queries',()=>{
  const error=new RangeError('offset outside bounds SECRET_KEY');error.stack='RangeError SECRET_KEY\n at https://evil.test/input.js?secret=CLUE:1:2';
  assert.deepEqual(errorDiagnostic(error),{code:'BYTE_BOUNDS',type:'RangeError',frames:[]});captureFailure(error);
  for(let n=0;n<40;n++)rememberAction('action','image-qr');const d=diagnostics({task:'native:image',width:390,height:844,userAgent:'Mozilla Chrome/140.0.1'});
  assert.equal(d.actions.length,30);assert(!JSON.stringify(d).includes('SECRET'));const r=fixture();r.diagnostics={...d,secret:'PRIVATE_INPUT',error:{...d.error,message:'PRIVATE_INPUT'}};
  assert(!reportMail(validateReport(r)).text.includes('PRIVATE_INPUT'));
});
test('mail validation strips attachment paths and enforces schema and decoded limits',()=>{
  const r=fixture();r.attachments=[{name:'../../clue.txt',type:'text/plain',data:Buffer.from('example').toString('base64')}];
  const v=validateReport(r);assert.equal(v.attachments[0].filename,'clue.txt');assert.equal(v.attachments[0].content.toString(),'example');
  assert.throws(()=>validateReport({...r,description:'短'}));assert.throws(()=>validateReport({...r,attachments:[{name:'bad',data:'not base64'}]}));
  assert.throws(()=>validateReport({...r,attachments:[{name:'big',data:Buffer.alloc(4*1024*1024+1).toString('base64')}]}),/4 MB/);
});
test('HTTP receipt only succeeds after delivery; duplicates send once; origin and rate are enforced',async()=>{
  let sent=0;const server=createFeedbackServer({send:async()=>{sent++;},origins:['https://tool.test'],perIP:2});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/api/feedback`,request=(body,origin='https://tool.test')=>fetch(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
  try{const report=fixture();let response=await request(report,'https://evil.test');assert.equal(response.status,403);assert.equal(sent,0);
    const pair=await Promise.all([request(report),request(report)]);assert.deepEqual(pair.map(r=>r.status),[200,200]);assert.equal(sent,1);assert.equal((await pair[0].json()).id,report.id);
    assert.equal((await request({...report,description:'修改内容后使用相同编号'})).status,409);
    assert.equal((await request(fixture())).status,200);assert.equal((await request(fixture())).status,429);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
test('SMTP failure is not success and does not expose secrets or automatically resend',async()=>{
  let sent=0;const server=createFeedbackServer({send:async()=>{sent++;throw Error('password SECRET smtp detail');},origins:['https://tool.test']});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{const report=fixture(),url=`http://127.0.0.1:${server.address().port}/api/feedback`;for(let i=0;i<2;i++){const response=await fetch(url,{method:'POST',headers:{Origin:'https://tool.test','Content-Type':'application/json'},body:JSON.stringify(report)});assert.equal(response.status,503);assert(!(await response.text()).includes('SECRET'));}assert.equal(sent,1);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
test('definite SMTP rejection permits an explicit retry of the unchanged report',async()=>{
  let sent=0;const server=createFeedbackServer({send:async()=>{if(++sent===1)throw Object.assign(Error('Rejected SECRET'),{retrySafe:true});},origins:['https://tool.test']});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{const report=fixture(),url=`http://127.0.0.1:${server.address().port}/api/feedback`,request=()=>fetch(url,{method:'POST',headers:{Origin:'https://tool.test','Content-Type':'application/json'},body:JSON.stringify(report)});
    const failure=await request();assert.equal(failure.status,503);assert(!(await failure.text()).includes('SECRET'));assert.equal((await request()).status,200);assert.equal((await request()).status,200);assert.equal(sent,2);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
