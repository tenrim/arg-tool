// Static discovery scopes only; the full runtime unit inventory remains in Qalculate.
export const UNIT_DISCIPLINES=Object.freeze([
 {id:'everyday',title:'几何与日常单位',aliases:['长度','面积','体积','容积','时间','频率','平面角','立体角'],prefixes:['Length','Area','Volume','Time','Angle/Plane Angle','Angle/Solid Angle']},
 {id:'mechanics',title:'力学单位',aliases:['质量','密度','速度','加速度','力','压强','黏度','流量','角速度','角加速度'],prefixes:['Mass','Speed','Force','Angle/Angular Velocity','Angle/Angular Acceleration','Volume/']},
 {id:'thermal',title:'热学与能量单位',aliases:['温度','摄氏度','华氏度','热量','能量','功率','熵','导热系数'],prefixes:['Temperature','Energy']},
 {id:'electromagnetic',title:'电磁学单位',aliases:['电压','电流','电荷','电阻','电容','电感','磁场','磁通量'],prefixes:['Electricity','Magnetism']},
 {id:'light',title:'光学与辐射单位',aliases:['光强','照度','亮度','光通量','辐射','放射性','吸收剂量'],prefixes:['Light','Radioactivity']},
 {id:'chemistry',title:'化学单位',aliases:['摩尔','物质的量','浓度','摩尔质量','催化活性'],prefixes:['Substance','Mass/Atomic Mass','Mass/Mass Fraction','Energy/Molar Energy','Energy/Molar Entropy']},
 {id:'information',title:'信息与印刷单位',aliases:['数据容量','字节','比特','KiB','kB','分贝','印刷','磅','字号'],prefixes:['Information','Typography','Ratio']},
 {id:'currency',title:'货币单位',aliases:['汇率','欧元','美元','人民币','欧分'],prefixes:['Currency']},
].map(item=>Object.freeze({...item,aliases:Object.freeze(item.aliases),prefixes:Object.freeze(item.prefixes)})));
export function unitDiscipline(category){
 const matches=UNIT_DISCIPLINES.flatMap(d=>d.prefixes.filter(prefix=>category===prefix||category.startsWith(prefix.endsWith('/')?prefix:prefix+'/')).map(prefix=>({id:d.id,length:prefix.length})));
 return matches.sort((a,b)=>b.length-a.length)[0]?.id;
}
