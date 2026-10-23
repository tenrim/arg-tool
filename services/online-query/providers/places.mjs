// Seven read-only endpoints documented by the Ministry of Civil Affairs.
// Coordinates remain CGCS2000 longitude/latitude; no map or media is fetched.
const HOST='dmfw.mca.gov.cn',BASE=`https://${HOST}/9095/`;
const modes={search:'stname/listPub',detail:'stname/detailsPub',divisions:'xzqh/getList','same-name-region':'datastatis/GroupCountNameByCode','same-name-type':'datastatis/GroupCountNameByType','same-pinyin-region':'datastatis/GroupCountPinyinByCode','same-pinyin-type':'datastatis/GroupCountPinyinByType'};
const modeTitles={search:'地名搜索',detail:'地名详情',divisions:'行政区划搜索','same-name-region':'同名区划统计','same-name-type':'同名类别统计','same-pinyin-region':'同音区划统计','same-pinyin-type':'同音类别统计'};
const attribution={name:'中国·国家地名信息库',credit:'中华人民共和国民政部',license:'官方公开数据查询服务；未声明整库开放再分发许可，坐标采用 CGCS2000。',termsURL:`https://${HOST}/baseHtmls/docfile/_1.htm`};
const fail=(status,code,message)=>Object.assign(new Error(message),{status,code});
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function text(value,name,{required=false,max=100,pattern}={}){if(value===undefined||value===''){if(required)throw fail(400,'INVALID_QUERY',`请填写${name}。`);return undefined;}if(typeof value!=='string'||!value.trim()||value.length>max||/\p{Cc}/u.test(value)||pattern&&!pattern.test(value))throw fail(400,'INVALID_QUERY',`${name}格式不正确。`);return value.trim();}
function integer(value,name,min,max,fallback){const v=value===undefined||value===''?fallback:value;if(v===undefined)return undefined;if(!Number.isInteger(v)||v<min||v>max)throw fail(400,'INVALID_QUERY',`${name}须为 ${min}–${max} 的整数。`);return v;}
function validate(input){
 if(!object(input))throw fail(400,'INVALID_QUERY','查询条件不正确。');
 const mode=input.mode??'search';if(!Object.hasOwn(modes,mode))throw fail(400,'INVALID_MODE','请选择已登记的地名查询方式。');
 const allowed=mode==='search'?['mode','stName','placeTypeCode','year','searchType','code','page','size']:mode==='detail'?['mode','id']:mode==='divisions'?['mode','year','code','maxLevel']:['mode','name','distCode'];
 if(Object.keys(input).some(key=>!allowed.includes(key)))throw fail(400,'INVALID_QUERY','查询包含该方式不支持的条件。');
 const p={mode},code=v=>text(v,'行政区划代码',{max:12,pattern:/^\d{2,12}$/});
 if(mode==='search'){
  p.stName=text(input.stName,'地名',{required:true});p.searchType=input.searchType??'模糊';if(!['精确','模糊'].includes(p.searchType))throw fail(400,'INVALID_QUERY','匹配方式须为精确或模糊。');
  p.page=integer(input.page,'页码',1,10000,1);p.size=integer(input.size,'每页条数',1,50,10);p.code=code(input.code);p.placeTypeCode=text(input.placeTypeCode,'地名类别代码',{max:12,pattern:/^\d{1,12}$/});p.year=integer(input.year,'年版',1000,9999);
 }else if(mode==='detail')p.id=text(input.id,'地名 ID',{required:true,max:64,pattern:/^[A-Za-z0-9_-]{1,64}$/});
 else if(mode==='divisions'){p.code=code(input.code);p.year=integer(input.year,'年版',1000,9999);p.maxLevel=integer(input.maxLevel,'查询深度',0,2,0);}
 else{p.name=text(input.name,mode.includes('pinyin')?'罗马字母拼写':'地名',{required:true});p.distCode=code(input.distCode);if(mode.endsWith('-type')&&!p.distCode)throw fail(400,'INVALID_QUERY','按类别统计须填写行政区划代码。');}
 return Object.fromEntries(Object.entries(p).filter(([,v])=>v!==undefined));
}
function parse(textBody){let body;try{body=JSON.parse(textBody);}catch{throw fail(502,'INVALID_UPSTREAM_RESPONSE','国家地名信息库未返回有效数据。');}if(!object(body)||Object.hasOwn(body,'status')&&body.status!==200)throw fail(502,'UPSTREAM_REJECTED','国家地名信息库未能完成本次查询，请检查条件或前往原站。');return body;}
async function execute(parameters,ctx){
 const p=validate(parameters),url=new URL(modes[p.mode],BASE),values=Object.fromEntries(Object.entries(p).filter(([key])=>key!=='mode'));
 let options;
 if(p.mode==='detail')options={method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams(values).toString()};
 else for(const [key,value]of Object.entries(values))url.searchParams.set(key,String(value));
 const {response,text:textBody}=await ctx.request(url,options);if(response.status!==200)throw fail(502,'UPSTREAM_UNAVAILABLE','国家地名信息库暂时无法查询，请稍后重试或前往原站。');
 const body=parse(textBody),sourceURL=url.href;
 let rows;
 if(p.mode==='search'){if(!Array.isArray(body.records)||!Number.isSafeInteger(body.total)||body.total<0)throw fail(502,'INVALID_UPSTREAM_RESPONSE','国家地名信息库分页数据格式已变更。');rows=body.records;}
 else if(p.mode==='detail')rows=body.id?[body]:[];
 else if(Array.isArray(body.data))rows=body.data;
 else if(object(body.data)&&p.mode==='divisions')rows=[body.data];
 else if(body.data===null)rows=[];
 else throw fail(502,'INVALID_UPSTREAM_RESPONSE','国家地名信息库返回格式已变更。');
 if(rows.some(row=>!object(row)))throw fail(502,'INVALID_UPSTREAM_RESPONSE','国家地名信息库记录格式已变更。');
 const total=Number.isSafeInteger(body.total)&&body.total>=0?body.total:p.mode==='detail'?rows.length:null;
 const records=rows.map((row,i)=>({id:String(row.id??row.code??row.typeCode??i),title:String(row.standard_name??row.name??row.type??`记录 ${i+1}`),summary:p.mode==='search'||p.mode==='detail'?[row.province_name,row.city_name,row.area_name,row.place_type].filter(Boolean).join(' · '):row.count===undefined?'行政区划层级；包含接口返回的全部子级':`数量：${row.count}`,fields:row,sourceURL,...(p.mode==='search'&&typeof row.id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(row.id)?{actions:[{label:'查询该地名详情',parameters:{mode:'detail',id:row.id}}]}:{})}));
 return {provider:'placenames',query:`${modeTitles[p.mode]}：${p.stName??p.name??p.id??p.code??'全国'}`,parameters:p,records,total,next:p.mode==='search'&&p.page*p.size<total&&p.page<10000?{...p,page:p.page+1}:null,raw:body,attribution,fetchedAt:new Date(ctx.now()).toISOString(),sourceURL};
}
export const PLACE_PROVIDERS=[{id:'placenames',title:'国家地名在线查询',allowedHosts:[HOST],minimumIntervalMs:10000,validate,execute}];
