const field=(id,label,value)=>({id,label,value:String(value)});
export const SHAPES=Object.freeze([
 {id:'rectangle',title:'长方形',fields:[field('a','长',4),field('b','宽',3)],formulas:['面积 = 长 × 宽','周长 = 2 × (长 + 宽)'],calc:({a,b})=>[['面积',`rect(${a},${b})`,2],['周长',`rect_perimeter(${a},${b})`,1],['对角线',`hypot(${a},${b})`,1]]},
 {id:'square',title:'正方形',fields:[field('a','边长',3)],formulas:['面积 = 边长²','周长 = 4 × 边长'],calc:({a})=>[['面积',`square(${a})`,2],['周长',`square_perimeter(${a})`,1],['对角线',`${a}*sqrt(2)`,1]]},
 {id:'triangle',title:'三角形（三边）',fields:[field('a','边 a',3),field('b','边 b',4),field('c','边 c',5)],formulas:['半周长 s = (a + b + c) ÷ 2','面积 = √[s(s − a)(s − b)(s − c)]','周长 = a + b + c'],calc:({a,b,c})=>{if(a+b<=c||a+c<=b||b+c<=a)throw Error('任意两边之和须大于第三边。');const s=`((${a}+${b}+${c})/2)`;return [['面积',`sqrt(${s}*(${s}-${a})*(${s}-${b})*(${s}-${c}))`,2],['周长',`triangle_perimeter(${a},${b},${c})`,1]];}},
 {id:'triangle-height',title:'三角形（底与高）',fields:[field('a','底边',4),field('h','对应的高',3)],formulas:['面积 = 底边 × 对应高 ÷ 2','底与高不能唯一确定周长'],calc:({a,h})=>[['面积',`triangle(${a},${h})`,2]]},
 {id:'right-triangle',title:'直角三角形',fields:[field('a','直角边 a',3),field('b','直角边 b',4)],formulas:['面积 = a × b ÷ 2','斜边 c = √(a² + b²)','周长 = a + b + c'],calc:({a,b})=>[['面积',`triangle(${a},${b})`,2],['周长',`${a}+${b}+hypot(${a},${b})`,1],['斜边',`hypot(${a},${b})`,1]]},
 {id:'parallelogram',title:'平行四边形',fields:[field('a','底边',4),field('b','另一边',3),field('h','对应底边的高',2)],formulas:['面积 = 底边 × 对应高','周长 = 2 × (底边 + 另一边)'],calc:({a,b,h})=>{if(h>b)throw Error('对应底边的高不能大于另一边。');return [['面积',`parallelogram(${a},${h})`,2],['周长',`parallelogram_perimeter(${a},${b})`,1]];}},
 {id:'trapezoid',title:'等腰梯形',fields:[field('a','上底',2),field('b','下底',4),field('h','高',3)],formulas:['面积 = (上底 + 下底) × 高 ÷ 2','腰 = √[高² + ((下底 − 上底) ÷ 2)²]'],calc:({a,b,h})=>[['面积',`trapezoid(${a},${b},${h})`,2],['周长',`${a}+${b}+2*sqrt(${h}^2+((${b}-${a})/2)^2)`,1]]},
 {id:'trapezoid-area',title:'梯形（两底与高）',fields:[field('a','上底',2),field('b','下底',4),field('h','高',3)],formulas:['面积 = (上底 + 下底) × 高 ÷ 2','两底与高不能唯一确定一般梯形的周长'],calc:({a,b,h})=>[['面积',`trapezoid(${a},${b},${h})`,2]]},
 {id:'circle',title:'圆',fields:[field('r','半径',3)],formulas:['面积 = πr²','周长 = 2πr'],calc:({r})=>[['面积',`circle(${r})`,2],['周长',`circumference(${r})`,1],['直径',`2*${r}`,1]]},
 {id:'annulus',title:'圆环',fields:[field('r','外半径',5),field('i','内半径',3)],formulas:['面积 = π(外半径² − 内半径²)','边界总长 = 2π(外半径 + 内半径)'],calc:({r,i})=>{if(i>=r)throw Error('内半径须小于外半径。');return [['面积',`pi*(${r}^2-${i}^2)`,2],['边界总长',`2*pi*(${r}+${i})`,1]];}},
 {id:'sector',title:'扇形',fields:[field('r','半径',3),field('angle','圆心角（度）',90)],formulas:['面积 = πr² × 角度 ÷ 360','弧长 = 2πr × 角度 ÷ 360','周长 = 弧长 + 2r（整圆除外）'],calc:({r,angle})=>{if(angle>360)throw Error('圆心角须大于 0 且不超过 360°。');const arc=`2*pi*${r}*${angle}/360`;return [['面积',`pi*${r}^2*${angle}/360`,2],['弧长',arc,1],['周长',angle===360?arc:`${arc}+2*${r}`,1]];}},
 {id:'polygon',title:'正多边形',fields:[field('n','边数',6),field('a','边长',2)],formulas:['周长 = 边数 × 边长','面积 = 边数 × 边长² ÷ [4tan(π ÷ 边数)]'],calc:({n,a})=>{if(!Number.isInteger(n)||n<3||n>10000)throw Error('边数须为 3 至 10000 的整数。');return [['面积',`${n}*${a}^2/(4*tan(pi/${n}))`,2],['周长',`${n}*${a}`,1]];}},
 {id:'cuboid',title:'长方体',fields:[field('a','长',4),field('b','宽',3),field('h','高',2)],formulas:['体积 = 长 × 宽 × 高','表面积 = 2 × (长×宽 + 长×高 + 宽×高)'],calc:({a,b,h})=>[['体积',`rectprism(${a},${b},${h})`,3],['表面积',`rectprism_sa(${a},${b},${h})`,2],['体对角线',`sqrt(${a}^2+${b}^2+${h}^2)`,1]]},
 {id:'cube',title:'正方体',fields:[field('a','棱长',3)],formulas:['体积 = 棱长³','表面积 = 6 × 棱长²'],calc:({a})=>[['体积',`cube(${a})`,3],['表面积',`cube_sa(${a})`,2]]},
 {id:'cylinder',title:'圆柱',fields:[field('r','底面半径',3),field('h','高',4)],formulas:['体积 = πr²h','表面积 = 2πr(r + h)','侧面积 = 2πrh'],calc:({r,h})=>[['体积',`cylinder(${r},${h})`,3],['表面积',`cylinder_sa(${r},${h})`,2],['侧面积',`2*pi*${r}*${h}`,2]]},
 {id:'cone',title:'圆锥',fields:[field('r','底面半径',3),field('h','高',4)],formulas:['母线 l = √(r² + h²)','体积 = πr²h ÷ 3','表面积 = πr(r + l)'],calc:({r,h})=>[['体积',`cone(${r},${h})`,3],['表面积',`cone_sa(${r},${h})`,2],['母线',`hypot(${r},${h})`,1]]},
 {id:'sphere',title:'球',fields:[field('r','半径',3)],formulas:['体积 = 4πr³ ÷ 3','表面积 = 4πr²'],calc:({r})=>[['体积',`sphere(${r})`,3],['表面积',`sphere_sa(${r})`,2]]},
 {id:'hemisphere',title:'半球（含底面）',fields:[field('r','半径',3)],formulas:['体积 = 2πr³ ÷ 3','曲面面积 = 2πr²','含底面表面积 = 3πr²'],calc:({r})=>[['体积',`2*pi*${r}^3/3`,3],['表面积（含底面）',`3*pi*${r}^2`,2],['曲面面积',`2*pi*${r}^2`,2]]},
 {id:'pyramid',title:'正四棱锥',fields:[field('a','正方形底边',6),field('h','高',4)],formulas:['体积 = 底边² × 高 ÷ 3','表面积 = 底边² + 2 × 底边 × √(高² + 底边² ÷ 4)'],calc:({a,h})=>[['体积',`${a}^2*${h}/3`,3],['表面积',`${a}^2+2*${a}*sqrt(${h}^2+${a}^2/4)`,2]]},
]);
export function geometryExpressions(id,input){const shape=SHAPES.find(s=>s.id===id);if(!shape)throw Error('请选择图形。');const values={};for(const f of shape.fields){const n=Number(input[f.id]);if(String(input[f.id]).trim()===''||!Number.isFinite(n)||n<=0||n>1e12)throw Error(f.label+'须大于 0 且不超过 10¹²。');values[f.id]=n;}return shape.calc(values);}
export function bmiExpression(weight,height,weightUnit='kg',heightUnit='cm'){
 if(!['kg','lb'].includes(weightUnit)||!['cm','m','in','ft'].includes(heightUnit))throw Error('请选择有效单位。');
 const w=Number(weight),h=Number(height);if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0||w>100000||h>100000)throw Error('身高和体重须为大于 0 的有效数值。');
 return `bmi((${w}) ${weightUnit},(${h}) ${heightUnit})`;
}
