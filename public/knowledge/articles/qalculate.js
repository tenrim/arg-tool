import {UNIT_DISCIPLINES} from '../../capabilities/unit-catalog.js';
export const articles=[{
 id:'function-native:qalculate',capabilityIds:['native:qalculate'],relatedIds:['native:qalculate'],topicGroup:'maths',title:'综合计算器',
 summary:'用普通与科学按键编辑算式，保留精确数学、历史和完整结果。',aliases:['Qalculate','科学计算器','任意精度','符号计算','RPN'],
 sources:[
  {id:'expressions',title:'Expressions',publisher:'Qalculate!',url:'https://qalculate.github.io/manual/qalculate-expressions.html',language:'英文',kind:'official-doc'},
  {id:'functions',title:'Functions',publisher:'Qalculate!',url:'https://qalculate.github.io/manual/qalculate-functions.html',language:'英文',kind:'official-doc'},
  {id:'manual',title:'Qalculate Manual 5.13.0',publisher:'Qalculate!',url:'https://qalculate.github.io/manual/singlepage.html',language:'英文',kind:'official-doc'},
  {id:'core',title:'libqalculate API',publisher:'Qalculate!',url:'https://qalculate.github.io/reference/',language:'英文',kind:'official-doc'},
 ],
 sections:[
  {title:'按键、角度与内存',sourceIds:['expressions','manual'],paragraphs:['按键和键盘都编辑同一条表达式，括号决定运算顺序。科学模式的角度设置影响三角函数：角度模式 sin(30) 为 1/2，弧度模式的同一数字代表 30 弧度。选中算式后点函数，将整个选区作为参数。','MS 保存当前完整结果，MR 插回表达式，M+ 和 M− 让同一内核计算内存与当前结果之和或差；MC 清空内存。百分号表示百分之一，50% 等于 0.5；它不自动实现商业计算器的加价百分比规则。'],examples:[{label:'先加后乘',input:'(7 + 8) * 2',output:'30',explanation:'括号内先得到 15，再乘 2；科学函数和内存操作也交给同一数学内核。'}]},
  {title:'表达式与精确数',sourceIds:['expressions','manual'],paragraphs:[
   '内核将表达式解析成数学结构后计算，而不是交给 JavaScript 浮点表达式执行。有理数可以保留分数形式；近似数及函数计算使用任意精度数值库。精度表示十进制有效数字位数，不是固定小数位数。',
   '工作表按行依次计算。标准、自适应、链式和 RPN 语法的解析规则不同；RPN 表达式先写操作数再写运算符，例如 2 3 +。界面不展示完整定义目录，但快捷键数量不限制数学内核的可用函数。保留内核显示的已解析输入和错误信息，以便检查隐式乘法或单位误识别。',
  ],examples:[{label:'精确分数与括号',input:'(1/3 + 1/6) * 2',output:'1',explanation:'先把分数相加为 1/2，再乘以 2；无需先将 1/3 转成有限精度小数。'}]},
  {title:'符号、矩阵和绘图',sourceIds:['functions','manual'],paragraphs:[
   'solve、integrate、diff、矩阵及统计函数均由同一原生函数库执行，参数、默认值和条件以原作者函数文档为准。不同函数的第二个参数不一定是变量，必须以函数签名为准，例如定积分第二、第三参数是上下限。',
   'plot 将内核生成的完整数据和绘图命令交给独立 Gnuplot WASM，输出可下载的 SVG。显示图形不替代精确表达式；函数奇点、定义域及采样设置仍影响图形。原生数据集仍随完整内核保留，玩家界面不另设数据集浏览目录。',
  ],examples:[{label:'定积分',input:'integrate(x^2, 0, 1)',output:'1/3',explanation:'积分原函数是 x^3/3，在 1 与 0 处相减得到 1/3。'},{label:'矩阵行列式',input:'det([1,2;3,4])',output:'−2',explanation:'2×2 行列式为 1×4 − 2×3。'},{label:'函数图形',input:'plot(sin(x), 0, 6)',output:'区间 [0,6] 上的正弦曲线',explanation:'默认角度单位为弧度；曲线由真实 Qalculate 采样与 Gnuplot 绘制。'}]},
  {title:'计算历史与结果归属',sourceIds:['manual','core'],paragraphs:[
   '计算历史保留本次已执行的算式与完整结果，侧边历史面板点选记录只恢复算式，不把旧结果当成重新执行。原内核仍支持变量等定义，但本站不提供 XML 编辑、文件导入或完整工作表备份表单。',
   '浏览器运算运行在独立 Worker 和虚拟文件系统。当前页面不提供本地数据导入；内存文件系统不允许访问宿主电脑其他文件、启动桌面程序或自动联网。取消会终止整个 Worker，旧结果不能在新输入下继续保存到笔记。错误与资源上限明确报告，不返回伪造或删减结果。',
  ],examples:[{label:'自定义变量',input:'save(1/3, "clue")\nclue * 3',output:'第一行保存精确值 1/3；第二行得到 1。',explanation:'保存内核定义，而不是从显示的小数文本重新推算变量。'}]},
 ],
}];

const lessons={
 everyday:{summary:'长度、面积、体积、时间、频率和角度的换算。',mechanism:'长度的一次倍率不能直接用在面积或体积上：平方米包含两个长度因子，立方米包含三个。角度有弧度与角度制，时间可包含分钟、小时等混合显示；表单按物理量分开列出可选单位。',boundary:'体积中的美制、英制和烹饪单位不是同一数值；查看所选单位的完整名称。频率与时间选择各自的物理量，不能把周期数直接当成时长。',example:{label:'千米换米',input:'1 km to m',output:'1000 m',explanation:'千米的千前缀表示 1000，1 × 1000 = 1000 米。'}},
 mechanics:{summary:'质量、密度、速度、加速度、力、压强、流量和黏度。',mechanism:'复合单位分别包含分子、分母和幂次。例如速度是长度除以时间；密度是质量除以体积；压强是力除以面积。换算保留这些量纲关系，再由内核使用所选单位的定义计算。',boundary:'先选择物理量，再选择同一物理量下的两种单位。质量与力不能直接互换，密度和比容也不是同一输入含义；流量和体积需要分别选择。',example:{label:'速度',input:'72 km/h to m/s',output:'20 m/s',explanation:'一千米为 1000 米，一小时为 3600 秒，72 × 1000 ÷ 3600 = 20。'}},
 thermal:{summary:'温度、能量、功率、熵和导热系数。',mechanism:'摄氏与华氏等绝对温标包含偏移，不能只乘统一倍率。能量按单位定义换算；功率包含每单位时间的能量。表单将温度、能量、功率和其他热学量分别列出。',boundary:'当前温度换算按绝对温度理解；温差与绝对温度的语义不同。卡路里有不同定义，选择时核对完整名称；不能把功率直接当成能量。',example:{label:'绝对温度',input:'20 celsius to fahrenheit',output:'68 °F',explanation:'20 × 9/5 + 32 = 68，偏移量也由原内核处理。'}},
 electromagnetic:{summary:'电流、电荷、电势、电阻、电容、电感及磁学量。',mechanism:'电学和磁学的派生单位通过电流、时间、能量等关系定义，例如电势可写作功率除以电流。相同物理量的单位使用完整定义换算；单位名称中的大小写和前缀属于输入语义。',boundary:'电势、电流、电场强度和电荷密度不能只因符号相近而互换。先选择对应物理量；复合单位使用内核可执行记号，而不是目录内部编号。',example:{label:'毫伏',input:'1 V to mV',output:'1000 mV',explanation:'毫前缀表示千分之一；1 伏包含 1000 个毫伏。'}},
 light:{summary:'光强、光通量、照度、亮度、辐射和剂量单位。',mechanism:'光度学量与辐射量有不同含义。照度是单位面积上的光通量，亮度还包含方向条件；放射性、吸收剂量和剂量当量也分别列在不同物理量中。',boundary:'本工具只按所选单位定义做换算，不从照度推断光源总能量，也不从一个剂量数字推断实际影响。选择完整物理量与单位名称，不能仅凭数值判断两种量相同。',example:{label:'照度',input:'1 lx to ph',output:'0.0001 ph',explanation:'phot 的定义为每平方厘米 1 流明，而 lux 为每平方米 1 流明；平方米是 10000 平方厘米，所以 1 lux 是 0.0001 phot。'}},
 chemistry:{summary:'物质的量、物质浓度、摩尔质量、摩尔能与催化量。',mechanism:'物质的量以摩尔表示；物质浓度将摩尔数除以体积，摩尔质量则将质量除以摩尔数。选择不同物理量会改变分母与量纲，不能仅按单位中出现的 mol 合并。',boundary:'单位换算不自动知道样品的化学组成。克与摩尔之间的物质转换需要实际摩尔质量；此表单不新增带单位数量的公式计算。催化活性和催化浓度也分别选择。',example:{label:'物质浓度',input:'1 mol/L to mol/m^3',output:'1000 mol/m³',explanation:'1 立方米包含 1000 升；每升 1 摩尔对应每立方米 1000 摩尔。'}},
 information:{summary:'比特、字节、进制信息量、比值与印刷尺寸。',mechanism:'数据容量区分十进制与二进制前缀，字节还包含 8 个比特。印刷尺寸保留各自的 point 定义；比值下的贝尔、分贝等属于对数量，不能当作普通长度或直接套线性倍率。',boundary:'kB 代表 1000 字节，KiB 代表 1024 字节，bit 与 byte 也不同。PostScript point 和 TeX point 不是同一定义；先选物理量和完整名称。',example:{label:'二进制容量',input:'1 KiB to byte',output:'1024 byte',explanation:'Ki 表示 2 的 10 次方，等于 1024；这里的单位是字节，不是比特。'}},
 currency:{summary:'使用随包固定汇率与原货币定义换算。',mechanism:'货币使用内核随包的固定定义与汇率快照，不进入页面自动联网更新。不同货币按对应固定关系换算；欧分与欧元等子单位可按固定倍率换算。',boundary:'结果不是实时行情。完整目录保留上游停用标识，停用项不能在表单中选为当前换算单位；单位定义不会因更换页面而刷新。',example:{label:'欧分',input:'100 eurocent to EUR',output:'1 EUR',explanation:'1 欧分等于 0.01 欧元，100 × 0.01 = 1。此例不依赖实时汇率。'}},
};
for(const d of UNIT_DISCIPLINES){const lesson=lessons[d.id];articles.push({
 id:'function-native:units-'+d.id,capabilityIds:['native:units-'+d.id],relatedIds:['native:units-'+d.id],topicGroup:'unit-conversion',title:d.title,summary:lesson.summary,aliases:['单位换算',...d.aliases],
 sources:[{id:'units',title:'Units and Conversion',publisher:'Qalculate!',url:'https://qalculate.github.io/manual/qalculate-units.html',language:'英文',kind:'official-doc'},{id:'definitions',title:'Unit List',publisher:'Qalculate!',url:'https://qalculate.github.io/manual/qalculate-definitions-units.html',language:'英文',kind:'official-doc'}],
 sections:[{title:'换算规则',sourceIds:['units','definitions'],paragraphs:[lesson.mechanism],examples:[lesson.example]},{title:'选择与边界',sourceIds:['units','definitions'],paragraphs:[lesson.boundary,'从单位换算菜单进入当前学科，选择物理量、原单位和目标单位，填写数值后结果实时更新。数值与单位选择改变会立即作废旧结果再进行新计算；交换单位不自动把结果作为新的输入。完整文本和 JSON 记录由本次真实计算生成。']}]
});}
