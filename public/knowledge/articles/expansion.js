// Individually authored lessons. Helpers compose metadata, never substitute a
// generic group explanation for the mechanism of a registered capability.
const source = (id, title, publisher, url, kind = 'official-doc', locator = '', language = 'en') => ({ id, title, publisher, url, kind, locator, language });
const worked = (input, output, explanation, label = '逐步核算') => ({ label, input, output, explanation });
const section = (title, paragraphs, sourceIds, examples = []) => ({ title, paragraphs, sourceIds, examples });
const article = (capability, title, topicGroup, summary, aliases, sources, sections, misconceptions = []) => ({
  id: 'function-' + capability, capabilityIds: [capability], relatedIds: [capability], title, topicGroup, summary, aliases, sources, sections, misconceptions,
});
const aca = file => source('aca', file.replace('.pdf', ''), 'American Cryptogram Association', 'https://www.cryptogram.org/downloads/aca.info/ciphers/' + file, 'author-spec', 'Cipher Types 原始算法规范');
const classicalParameters = source('parameters', '本站古典密码固定参数定义', '迷雾工具箱', '/expansion/classical-catalog.js', 'implementation', '对应算法的字母表、填充、分组及方向');
const pycipher = anchor => source('pycipher', 'ADFGX／ADFGVX 参数与互操作说明', 'James Lyons / pycipher', 'https://pycipher.readthedocs.io/en/master/#' + anchor, 'author-spec', 'The Ciphers / ADFGX、ADFGVX');
const numberSource = (name, page) => source('alpertron', name + ' 官方原理与表达式说明', 'Dario Alpern / Alpertron', 'https://www.alpertron.com.ar/' + page, 'author-spec', 'Help / Method / Expressions');
const numberParameters = source('parameters', '本站数论计算器的动作、参数和限额', '迷雾工具箱', '/expansion/alpertron-catalog.js', 'implementation', '对应 calculator 的 fields、actions、limits');
const constraints = source('rules', '焖肉面中文规则脚本规范', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/wiki/%E7%84%96%E8%82%89%E9%9D%A2%E8%84%9A%E6%9C%AC%E6%96%87%E6%A1%A3', 'author-spec', '格子范围、互异、和、连续段、排列、条件、回路与桥连', 'zh-CN');
const constraintImplementation = source('parser', '固定版本的中文规则解析器', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/sudoku/solverParser.js', 'implementation', 'SolverParser 的规则转换', 'zh-CN');
const wordImplementation = source('words', '固定版本查词核心', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/one-word/one-word.js', 'implementation', 'contains、stringInclude、findByCode');
const keyboardImplementation = source('mapping', '固定版本的键盘与手机九键映射', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/index.html', 'implementation', '替换编码表与解码入口', 'zh-CN');
const iupac = source('iupac', 'Periodic Table of Elements', 'IUPAC 国际纯粹与应用化学联合会', 'https://iupac.org/what-we-do/periodic-table-of-elements/', 'standard', '118 个正式元素名称、符号与原子序数');
const elementImplementation = source('implementation', '元素符号分词与完整候选计数', '迷雾工具箱', '/expansion/element-core.js', 'implementation', 'elementDecompositions / elementWords', 'zh-CN');

export const articles = [
  article('native:classical-playfair', 'Playfair 密码', 'classical', '以二字母为单位在 5×5 方阵中作同行、同列或矩形替换。', ['Playfair', '双字母密码'], [aca('Playfair.pdf'), classicalParameters], [
    section('二字母的三种位置关系', ['方阵关键词去重后接上未使用字母。按顺序取明文的两个字母：同一行各向右移动一格，同一列各向下移动一格，遇到边界回绕；不同行列时，取同一矩形的另两个顶点，分别保留各自所在的行。', '同一对出现重复字母时要插入填充字符后重新取对；最后单剩一个字母也要补齐。解密把同行与同列移动方向反过来，矩形规则不变。'], ['aca'], [worked('方阵按 ABCDE / FGHIK / LMNOP / QRSTU / VWXYZ 排列；明文 AB', 'BC', 'A、B 同处第一行，各右移一格得到 B、C。若是 EA，E 在行末回到 A，A 移到 B，结果为 AB。')]),
    section('方阵、填充和信息损失', ['本站默认把 J 并入 I，空白不参与分组；可设置方阵关键词、完整字母表、填充字符和备用填充。填充与重复字母相同时使用备用字符。', '解密保留真实填充，不能自动删除所有 X，也不能还原被合并的 J 或原有分词。未知字符是报错还是移除必须显式选择。'], ['parameters']),
  ]),
  article('native:classical-adfgx', 'ADFGX 密码', 'classical', '先把 5×5 方阵字符变成行列坐标，再按关键词作列换位。', ['ADFGX', '五符号坐标密码'], [pycipher('adfgx-cipher'), classicalParameters], [
    section('坐标替换后再换位', ['将 25 个字母放进方阵，用 A、D、F、G、X 同时标记行和列。每个明文字母先输出行标，再输出列标；长度因此变为两倍。', '坐标串按密钥宽度逐行放置，再按密钥字母的排序读出整列。解密须先恢复各列长度和原坐标串，随后每两个坐标查回一个字母。'], ['pycipher'], [worked('默认顺序方阵；明文 AB；列密钥 BA', 'ADAA', 'A→AA、B→AD，坐标串 AAAD 分成两行 AA / AD。密钥 A 对应第二列，先读 AD，再读第一列 AA。')]),
    section('重复密钥与不完整末行', ['本站用稳定排序处理重复密钥：同一字符仍保持从左到右的列序。最后一行不自动补齐；恢复时较长列属于原矩形靠左的列，不能一律平分密文。', '默认 I/J 合并。必须同时掌握方阵排列与列密钥，只有 ADFGX 五个符号这一外观不足以唯一解密。'], ['parameters']),
  ]),
  article('native:classical-adfgvx', 'ADFGVX 密码', 'classical', '用六种坐标符号对字母和数字分拆，再进行列换位。', ['ADFGVX', '六符号坐标密码'], [pycipher('adfgvx-cipher'), classicalParameters], [
    section('6×6 方阵的两级处理', ['方阵容纳 36 个字符，默认依次为 A–Z 和 0–9。行列坐标均使用 A、D、F、G、V、X，每个原字符对应两个坐标符号。', '把整个坐标串逐行写入列密钥矩形，按稳定排序后的列序读出。解密先逆列换位，再合并坐标；不能直接把收到的密文每两位查方阵。'], ['pycipher'], [worked('默认 A–Z、0–9 方阵；明文 A9；单列密钥 K', 'AAXX', 'A 在首行首列，坐标 AA；9 在第六行第六列，坐标 XX。单列换位保持顺序，因此得到 AAXX。')]),
    section('字符集和末行的区别', ['ADFGVX 不采用 ADFGX 的 I/J 合并规则。调整方阵关键词或完整排列会改变全部坐标；密钥的重复字符按左到右排序，不随机交换。', '本站不补齐最后一行。未知字符处理、方阵排列和密钥必须与发信方一致；找不到明文不等于字符一定不是这种密码。'], ['parameters']),
  ]),
  article('native:classical-trifid', 'Trifid 密码', 'classical', '把字符拆成三维坐标，在一个周期内按坐标层重新排列。', ['Trifid', '三分密码'], [aca('Trifid.pdf'), classicalParameters], [
    section('三坐标的分拆和重组', ['使用 27 个不同符号组成 3×3×3 方阵。每个符号取得层、行、列三个坐标；对一个周期中的所有字符，先连续写第一坐标，再写第二坐标和第三坐标。', '把这段数字每三位重新分组，按同一方阵查回字符。解密把三位坐标串分成等长三段，再竖向合成原坐标。'], ['aca'], [worked('字母表 ABCDEFGHIJKLMNOPQRSTUVWXYZ#；周期 3；明文 ABC', 'AAF', 'A、B、C 分别为 111、112、113。三行坐标为 111 / 111 / 123，顺读再分组得到 111、111、123，即 A、A、F。')]),
    section('周期如何影响结果', ['每个周期独立混排；最后不足周期的一组按实际长度分三段，不增加填充符。周期为 1 时不发生跨字符混排。', '本站可调整方阵关键词、27 字符完整排列与周期。默认第 27 个符号为 #，它是方阵中的实际字符，不是任意字符通配符。'], ['parameters']),
  ]),
  article('native:classical-autokey', 'Autokey 自密钥密码', 'classical', '短密钥用尽后，以已经处理的明文或密文继续构成密钥流。', ['Autokey', '明文自密钥', '密文自密钥'], [aca('Autokey.pdf'), classicalParameters], [
    section('密钥流不作简单重复', ['把字母按字母表编号。以 Vigenère 规则为例，加密为 C=(P+K) mod N。起始密钥用尽后，明文自密钥追加已经出现的明文；密文自密钥则追加已经输出的密文。', '明文自密钥解密必须先还原一个明文字母，再将它追加到后续密钥流，不能把还未解出的密文直接当作明文。其他运算变体沿用各自的加减公式。'], ['aca'], [worked('A=0；明文 ABCDEF；起始密钥 KEY；明文自密钥、Vigenère', 'KFADFH', '前六位密钥流为 KEYABC：0+10=10(K)，1+4=5(F)，2+24≡0(A)，再以 A、B、C 得到 D、F、H。')]),
    section('运算变体与推进单位', ['本站区分 Vigenère、Beaufort 和 Variant Beaufort，并明确选择追加明文或密文。只用实际参与处理的字母推进密钥；忽略的空白不消耗密钥。', '字母表和大小写处理影响编号。短密钥不是现代安全保证；一次输入的未知字符策略和起始密钥选错，会使之后整段密钥流都偏离。'], ['parameters']),
  ]),
  article('native:classical-beaufort', 'Beaufort 密码', 'classical', '按重复密钥计算“密钥减明文”的模字母表替换。', ['Beaufort', 'Variant Beaufort'], [aca('Beaufort.pdf'), classicalParameters], [
    section('减法的方向决定变体', ['标准 Beaufort 采用 C=(K−P) mod N。解密仍计算 P=(K−C) mod N，因此同一运算具有自反性。', 'Variant Beaufort 改为 C=(P−K) mod N，解密必须改用 P=(C+K) mod N。它与标准 Beaufort 不能共用一个未区分方向的减法操作。'], ['aca'], [worked('A=0；明文 ABC；重复密钥 KEY；标准 Beaufort', 'KDW', '10−0=10(K)，4−1=3(D)，24−2=22(W)。再用 KEY 处理 KDW，得到 ABC。')]),
    section('重复周期和字符表', ['本站保留标准与 Variant 两种明确规则以及自定义字母表。密钥按已经处理的字母循环，字母表顺序决定每个值，模运算把负数规范到 0–N−1。', '这是一种古典密码，重复密钥仍会产生统计结构；本文介绍按已知密钥转换，不把它描述成自动破解所有 Beaufort 密文。'], ['parameters']),
  ]),
  article('native:classical-columnar', '列移位置换', 'classical', '把原文逐行放入矩形，再依指定的列排名读出。', ['Columnar transposition', '不完整列换位'], [aca('IncompleteColTransposition.pdf'), classicalParameters], [
    section('矩形中的排列', ['列数等于密钥长度。输入依原顺序逐行排入矩形，随后按列的排名从小到大逐列输出；换位只改变字符位置，不作字母代换。', '解密时先由总长度和列数算出每列应有的长度，按排名分配密文到各原列，再逐行读回。没有填充时，原矩形靠左的列可能多一个字符。'], ['aca'], [worked('明文 ABCDEFGH；每列排名 3 1 2；不填充', 'BEHCFADG', '矩形为 ABC / DEF / GH。第二列 BEH 排名 1，第三列 CF 排名 2，第一列 ADG 排名 3，连接后得到结果。')]),
    section('空格、重复密钥与填充', ['本站保留 Unicode 字符、空格与标点。密钥可用关键词的稳定排序，也可直接填写每列排名；“3 1 2”表示原第一列的排名为 3，不是按 3、1、2 依次读列。', '填充到整矩形必须显式开启。解密保留填充符，因为末尾 X 可能本来就是原文；删除它会丢失无法从密文判定的信息。'], ['parameters']),
  ]),
  article('native:classical-nihilist', 'Nihilist 数字替换密码', 'classical', '把明文和密钥都转换为 Polybius 两位坐标，再逐位相加。', ['Nihilist substitution', '虚无主义密码'], [aca('NihilistSubstitution.pdf'), classicalParameters], [
    section('坐标相加而非按字符拼接', ['5×5 方阵的行列从 1 编到 5，一个字母取得 11–55 范围中的一个坐标数。明文与重复密钥分别查坐标，再把两个整数相加。', 'ACA 两位数约定把 100–110 写作 00–10。解密时先根据这一范围恢复可能被减去 100 的和，再减去密钥坐标，最后检查结果是否真是有效行列。'], ['aca'], [worked('默认顺序方阵；明文 AZ；密钥 A', '22 66', 'A→11、Z→55；密钥 A 的坐标 11 重复。11+11=22，55+11=66。数字 66 是和值，不表示方阵有第六行。')]),
    section('两种输出约定', ['本站可选择 ACA 两位数或保留完整和；密文用空白或逗号分隔数值，不能把没有边界的长数字串随意切分。', '默认 J 并入 I。方阵关键词与相加密钥是两类参数，只知道其中一种不足以确定另一种。解密不自动恢复被删除的空白和原 J。'], ['parameters']),
  ]),

  article('native:number-integer', '大整数分解与数论', 'maths', '用真实多精度运算计算整数表达式，并以 ECM／SIQS 等算法寻找因数。', ['ECM', 'SIQS', '整数因数分解'], [numberSource('Integer factorization', 'ECM.HTM'), numberParameters], [
    section('因数和指数的含义', ['因数分解寻找乘积等于输入的素数幂。试除可以去掉小因数；ECM 在模合数的椭圆曲线上计算，遇到某个因子上的特殊结构时由最大公因数揭示因子；SIQS 收集平方同余关系，再组合出可提取因子的平方关系。', '结果中的相同因子合并成幂，数论函数则以整数作准确计算。概率素性检验与正式的素性证明不同；不能仅从“尚未找到因子”推出输入为素数。'], ['alpertron'], [worked('360', '360=2³×3²×5；正因数个数为 24', '反乘 8×9×5=360。一个因数可分别选 2 的 0–3 次幂、3 的 0–2 次幂和 5 的 0–1 次幂，共 4×3×2=24 种。')]),
    section('表达式、批处理与停止', ['支持官方整数表达式及相应批处理语法；整数除法不会自动变成小数计算。本站分别提供求值、分解及素性检验动作，仍由同一个官方本地引擎执行。', '大整数允许输入不代表能在短时间完成分解。本站有输入、输出和运行时限，停止或超时只表示本轮计算结束，不能写成“无因子”。'], ['alpertron', 'parameters']),
  ]),
  article('native:morse-audio', '摩斯音频', 'audio', '将真实单声道 PCM 交给 GGMorse 识别，或使用同一核心生成摩斯音频。', ['GGMorse', 'CW', '摩斯音频识别', 'Farnsworth'], [
    source('itu', 'International Morse code M.1677-1', 'ITU 国际电信联盟', 'https://www.itu.int/rec/R-REC-M.1677-1-200910-I/en', 'standard', '点、划及符号／字母／单词间隔'),
    source('ggmorse', '固定版本 GGMorse 核心', 'Georgi Gerganov', 'https://github.com/ggerganov/ggmorse/blob/7b4822a8cfdbb1addfe497f3ae8186f142a4ee79/src/ggmorse.cpp', 'implementation', 'decode_float、setParametersDecode、encode'),
    source('adapter', '本站真实 PCM 与诊断接口', '迷雾工具箱', '/expansion/morse-engine.js', 'implementation', 'decodeMorse / encodeMorse；输入、冲洗、限额'),
  ], [
    section('从声音到点划', ['摩斯以持续音的长短和静音间隔承载符号。标准计时以点为一单位，划为三单位，符号内间隔一单位，字母间隔三单位，词间隔七单位。', 'GGMorse 先把 PCM 重采样到内部 4 kHz 基准，使用短时 FFT 估计音调，再以 Goertzel 滤波提取该音调的强度。核心比较不同速度与阈值下的时序代价，识别间隔类别，再用点划表转为字符；它不是对频谱截图作文字识别。'], ['itu', 'ggmorse'], [worked('20 WPM、700 Hz 的 ... --- ...，各字母按标准间隔分隔', 'SOS', '20 WPM 的点长为 1.2/20=0.06 秒；三个短音为 S，三个 0.18 秒长音为 O，再三个短音为 S。纯音频率改变音高，不改变这些点划的含义。')]),
    section('自动参数与真实诊断', ['音调与速度设为自动时，默认搜索音调范围为 200–1200 Hz；手动音调、速度和高低通开关可帮助排除噪声或叠音。Goertzel 曲线是输入末尾的真实信号窗口，STFFT 是同一核心的真实频谱，阈值比例是逐帧自动拟合的输出。', 'estimatedPitch_Hz 与 estimatedSpeed_wpm 是估计值；signalThreshold 是比例而不是文件振幅门限；costFunction 是时序拟合代价，不是“识别正确率”。重采样、音调检测、Goertzel、时序分析耗时来自真实核心，不能解读成整段音频的总耗时。'], ['ggmorse', 'adapter']),
    section('生成和识别的边界', ['官方编码器使用音量、频率、字符速度与 Farnsworth 间隔速度生成实际 PCM。本站保留上游 Farnsworth 同时作用于符号内间隔的行为；54 个内置字符和自定义单 ASCII 映射都参与同一核心。', '识别器保留三秒分析窗口，并在末尾添加四秒零样本冲洗延迟；这不修改原音频。噪声尾部可能引起错误音调和多余字符，原结果不会被偷偷删改；可固定音调和速度重试。本站接受 4–48 kHz PCM、最多 32 MB，编码最多 256 个 ASCII 字节，超过限额直接拒绝。'], ['ggmorse', 'adapter']),
  ]),
  article('native:score', '五线谱与节奏录入', 'audio', '把明确的音名、八度和拍数转成可核验的乐谱、时间表与试听。', ['ABC notation', '乐谱', '音符序列'], [
    source('abcjs', 'ABC Music Notation', 'Paul Rosen / abcjs', 'https://paulrosen.github.io/abcjs/overview/abc-notation.html', 'official-doc', 'ABC 文本与乐谱绘制'),
    source('score', '本站乐谱序列的准确解析规则', '迷雾工具箱', '/expansion/score-core.js', 'implementation', 'parseScore、staffPitch、scorePCM', 'zh-CN'),
  ], [
    section('音高与时间分别记录', ['一个事件同时记录音名、八度和拍数，例如 C4:1 表示第四八度 C 音持续一拍，R:0.5 是半拍休止。升降号改变半音，八度每提高一级频率翻倍；谱号决定谱线上音高的位置，不能只按线条编号猜音名。', '以四分音符为一拍时，事件秒数为拍数×60/BPM。节拍、调号与谱号作为真实乐谱参数进入 ABC 表示，试听按事件时间安排，休止只推进时间。'], ['score', 'abcjs'], [worked('C4:1 D4:0.5 R:0.5；120 BPM', 'C4 从 0 到 0.5 秒；D4 从 0.5 到 0.75 秒；休止到 1 秒', '120 BPM 每拍 0.5 秒，三个事件共两拍。休止不发声，但后续事件不能提前半拍。')]),
    section('导出与识读边界', ['符号与时间表、ABC、图形乐谱和 PCM/WAV 来自同一事件模型，不能把截图当作可编辑音符。原生解析支持的拍数精度为 1/16 拍的倍数，音符范围 C0–B8，音频导出最多三分钟。', '这里记录明确输入的单声部旋律，不从任意录音自动重建完整复调乐谱；纯音试听也不等同于真实乐器采样。调号和临时升降记号必须与页面实际选择一起核对。'], ['score']),
  ]),
  article('native:element-spelling', '元素符号拼词', 'matter', '用全部 118 个正式元素符号分割字母串，并计算全部有效分法。', ['Element spelling', '周期表拼字'], [iupac, elementImplementation], [
    section('一个位置可以有两个出口', ['正式元素符号有一个或两个字母。对输入的每个位置，检查一个字母和两个字母的前缀是否是元素符号；合法前缀连到后一个位置，直到恰好走完输入。', '从末尾向前动态规划：位置 i 的分法总数等于所有合法下一位置的分法数之和。本站用 BigInt 保存计数，分页只是按路径排名选择显示，不限制实际候选集合。'], ['iupac', 'implementation'], [worked('Co，关闭严格大小写', 'Co（钴，27）或 C+O（碳 6、氧 8），总数 2', '前缀可以选两字母 Co 一步到末尾，也可先选 C 再选 O。若要求严格符号大小写，Co 只匹配钴，CO 才匹配 C+O。')]),
    section('元素符号不是名称缩写', ['输入限 1–160 个英文字母，不把空格、标点或元素中文名称偷偷删掉再猜。匹配使用正式元素符号，中文名和原子序数是结果中的对应资料。', '大小写开关会改变候选集合。没有合法分法只说明当前字符串不能完整拆成正式元素符号，不证明它没有其他化学或文字线索。'], ['iupac', 'implementation']),
  ]),
  article('native:element-words', '元素符号词库筛选', 'matter', '对所选完整词库逐词判断是否能完全拆成正式元素符号。', ['Element words', '周期表单词'], [iupac, elementImplementation], [
    section('逐词分词而非搜索元素名称', ['先按指定长度范围读取词条，再对每个纯字母词运行元素符号分词。只有从首字母到末字母全部有合法符号覆盖的词才收录。', '结果记录这个词的完整分法数与首个分法；首个分法是展示样本，不意味着这个词只能这样拆。检查某个词的全部分法应进入元素符号拼词。'], ['iupac', 'implementation'], [worked('待筛词条为 bacon、xyz', 'bacon 可以按 Ba+C+O+N 拆分；xyz 不能完整拆分', 'Ba 是钡，C、O、N 分别是碳、氧、氮；X 不是现行单字母元素符号，所以 xyz 无法从首位开始。示例只核验给定两条词，不假设任意词库都含它们。')]),
    section('词库覆盖和大小写', ['词库与元素表是两个独立来源：118 个正式元素不缺项，不意味着所选词库收录所有语言的词。按长度、大小写筛选会改变结果，输入中的非纯字母词条不会冒充可分词单词。', '筛选和结果都在本地完成。全词库可能产生大量候选，结果分页与下载应保留全部命中，不能把显示第一页当作总共只有一页。'], ['implementation']),
  ]),
  article('native:stroke-endpoints', '汉字笔画首尾匹配', 'text-language', '用每一笔的起点和终点形状，在固定汉字笔画数据中排列候选。', ['笔画端点', 'Stroke endpoints'], [
    source('upstream', 'ChinesePuzzleTool 固定原始实现', 'philippica', 'https://github.com/philippica/ChinesePuzzleTool/tree/8b4ebec728138981a94b4ff743026084e9e37ef5', 'implementation', 'factorHan.js / out.js 中的笔画资料及几何匹配'),
    source('matcher', '本站首尾点归一化与完整字库匹配', '迷雾工具箱', '/expansion/stroke-core.js', 'implementation', 'normalizeEndpoints / matchStrokeEndpoints', 'zh-CN'),
  ], [
    section('端点集合的几何比较', ['每笔提供起点和终点，一笔对应两个点。先按所有点的包围框归一化到 0–999 坐标，再只与笔数一致的汉字数据比较。原始笔画曲线中的中间转折没有被输入，因此不能凭两个端点确定全部笔形。', '固定上游比较器对端点距离作最大权匹配，并结合总距离与最大偏差形成排序分数。它不是手写图像 OCR，也不保证按输入的第一笔直接对应字库第一笔。'], ['upstream', 'matcher'], [worked('端点 (10,20)、(30,20)，只输入一笔', '归一化为 (0,499.5)、(999,499.5)，只比较字库中的一笔汉字', '横向跨度为 20，纵向跨度为零；零跨度轴放在中间。这个几何例子可以复核，但不把它宣称为唯一汉字识别结果。')]),
    section('顺序、字库和退化输入', ['支持 1–48 笔，点数须为偶数。所有点重合没有可比较的形状，直接报错；单一竖向或横向跨度允许保留，不把它除以零。', '候选由固定上游数据决定，匹配分数不是识别概率。字形、笔画拆分和草写习惯不同可能改变结果，不能用排序第一作为字源或字形规范依据。'], ['matcher']),
  ]),

  article('native:hunt-constraints-sudoku', '中文规则数独', 'logic', '把行、列、宫与变体条件写成中文约束，由真实约束核心搜索。', ['Constraint Sudoku', '中文数独规则'], [constraints, constraintImplementation], [
    section('每格的取值和互异', ['标准九宫数独的格子取 1–9；每行、每列、每个 3×3 宫各有九个不同的数。已知数字是额外固定条件，解题是在所有条件同时成立的赋值中寻找候选。', '中文脚本把这些区域和规则转成约束。只写行列互异而漏写宫约束，得到的是拉丁方而不是完整标准数独；变体需要补上对应区域或算术规则。'], ['rules', 'parser'], [worked('某一行已填 1、2、3、4、5、6、7、8，最后一格未知；该行互异且取 1–9', '最后一格必须为 9', '域中唯一未使用的数是 9。完整题面仍要同时满足此格所在的列和宫，若那里已有 9 则题面矛盾。')]),
    section('多个解和求解状态', ['脚本可以新增区域约束，不能因为页面叫数独就自动假设所有未写的变体条件都存在。修改尺寸也要重新核对宫的格子索引。', '找到一个解、找到多个解、证明无解和停止搜索是不同状态。搜索限额内只发现一个解时，除非引擎已完成排他验证，否则不能自动称为唯一解。'], ['rules', 'parser']),
  ]),
  article('native:hunt-constraints-magicSquare', '幻方', 'logic', '在各行、列及指定对角线的和约束下排列互不相同的数。', ['Magic square', '中文幻方'], [constraints, constraintImplementation], [
    section('幻和从全集总和导出', ['正常 n 阶幻方使用 1–n²，每个数恰好出现一次，要求每行、每列及两条主对角线具有相同和。总和为 n²(n²+1)/2，除以 n 行后得到幻和 n(n²+1)/2。', '互异、取值范围、行列求和与对角线求和是独立约束。只满足行列和的方阵不一定是完整幻方。'], ['rules', 'parser'], [worked('3×3；使用 1–9', '8 1 6 / 3 5 7 / 4 9 2；幻和 15', '总和 45 除以三行为 15。三行、三列及 8+5+2、6+5+4 两条对角线都为 15，且 1–9 无重复。')]),
    section('修改预设要同步修改规则', ['上游预设为 4×4、1–16、幻和 34。改成 3×3 时必须同步修改取值上限、求和常数和两条对角线索引，不能只缩小界面格子。', '旋转、镜像或不同初始条件可能产生多个有效幻方。候选计数以本轮实际搜索状态为准，不把第一种输出当作唯一排列。'], ['rules', 'parser']),
  ]),
  article('native:hunt-constraints-mine', '扫雷约束', 'logic', '用邻域中黑格的数量条件表达已知扫雷线索。', ['Minesweeper constraints', '邻域计数'], [constraints, constraintImplementation], [
    section('一个数字是一条邻域等式', ['格子用黑格和白格表示雷与非雷。数字 k 对应指定邻域中黑格的数量等于 k；邻域边界只包含题面内真正存在的格子，不能在四周补上假格。', '上游语法可明确列出本格、上下左右和四个斜向。标准扫雷的数字所在格必须为白格；若计数语法包含本格，固定其为白格后才与普通八邻格计数等价。'], ['rules', 'parser'], [worked('3×3 区域中心为已确认的白格，数字 0；计数八个邻格', '八个邻格全部为白格', '八个二值雷变量之和为 0，只可能每一个都为 0。若中心为 1，则只得到恰好一个邻格为雷，不能唯一指出是哪一格。')]),
    section('未知格不是数字零', ['未知格、已确认无雷格和数字 0 是不同信息。上游扫雷预设含“未填默认零”的脚本示例，使用真实题目时必须按实际线索编辑，不能给全部未知区域套上零计数。', '这是逻辑约束求解，不是替用户猜测随机雷位。题面信息不足会有多个模型；只搜索一部分不能把偶然出现的雷位称为必然。'], ['rules', 'parser']),
  ]),
  article('native:hunt-constraints-nonogram', '数织', 'logic', '通过每行每列连续黑段的长度与顺序，求二值格子图案。', ['Nonogram', 'Picross'], [constraints, constraintImplementation], [
    section('连续段需要保留顺序和间隔', ['一条线索 [a,b,…] 描述从指定方向依次遇到的黑段长度。两个相邻黑段之间至少有一格白格；首尾可以有额外白格，但不能交换线索的顺序。', '求解时，行和列对同一格施加约束。某行存在多种摆法时，可先保留它们共同的黑白信息，不能直接选择视觉上最像图案的那一摆法。'], ['rules', 'parser'], [worked('一行 5 格，黑段线索 [2,2]', '黑 黑 白 黑 黑', '两段各长 2，中间最少一格白格，正好占满五格，因此这行只有一种摆法。[0] 则表示整行没有黑段。')]),
    section('方向和题面一致性', ['“行从左到右”与“列从上到下”是脚本中明确的方向；把行线索反读会形成另一题。线索总长度加最少间隔若超过行列宽度，应报错而不是截掉末尾。', '数织可以多解甚至无解。结果只说明给定的行列线索是否共同可满足，不证明图片原本应有的语义。'], ['rules', 'parser']),
  ]),
  article('native:hunt-constraints-drop', 'Drop Quote 落字', 'logic', '让各列给定的字母落入同列空格，再以单词和黑格边界组合文本。', ['Drop quote', '落字谜'], [constraints, constraintImplementation], [
    section('每列是带重复次数的字母集合', ['同一列的待落字母只能分配到这一列的非黑格。每个字母出现几次就必须使用几次，黑格既不占用字母，也决定哪些连续格子组成一个词。', '列内排列和词库约束同时生效：每行的词必须存在于所选词库中，词典只限制候选，不知道目标原句的含义。'], ['rules', 'parser'], [worked('一列三个可填格，字母为 a、a、b', '不计其他约束时只有 aab、aba、baa 三种不同排列', '两个 a 不可区别，因此不是 3!=6 种。只有 a、b 两个不同符号的集合会丢掉第二个 a，无法表达原题。')]),
    section('词边界和完整词库', ['上游 5×10 预设包含黑格位置、每列完整字母及各词的格子索引。把黑格移走后也要调整组成单词的区域，不能只改变图形。', '缺词、专名、连字符和分词方式会使合法原句被词库排除。无候选先核对字母重复次数、黑格与词库范围，而不是直接断言原题错误。'], ['rules', 'parser']),
  ]),
  article('native:hunt-constraints-custom', '自定义中文规则', 'logic', '把有限取值、区域关系和条件组合成可以核验的格子约束问题。', ['中文约束脚本', 'Constraint satisfaction'], [constraints, constraintImplementation], [
    section('变量、取值域和约束相交', ['每一格是变量，取值规则指定有限域；互异、和、计数、线性组合、条件与排列继续缩小合法赋值。单词规则查询真实词库，连续段、回路和桥连规则有自己的全局结构，不能简化成邻格着色。', '编号按题面规则对应实际格子，区域不能越界。解析成功只证明语法和局部范围有效，不证明所有规则存在共同解。'], ['rules', 'parser'], [worked('两格 x、y 取 0–3 的整数，并要求 2x+3y=8', '唯一组合为 x=1、y=2', '依次令 y=0、1、2、3，x 分别为 4、2.5、1、−0.5；只有 y=2 时 x 仍为域内整数。可写成第[1,2]格的系数是[2,3],线性组合是8。')]),
    section('条件、停止和可解释性', ['“如果 A，那么 B”仅在 A 成立时要求 B，不等于同时无条件要求 A 和 B。回路、桥连或多重集合也必须使用各自真实规则，不能以看起来接近的和约束代替。', '搜索可能指数增长。本站限制题面、规则和时间；结果要区分可行解、完整枚举、矛盾与被停止的部分搜索。用户修改题面后旧解立刻失效。'], ['rules', 'parser']),
  ]),
  article('native:dictionary-substitution', '词库单表替换求解', 'cipher-analysis', '利用重复字母模式与词边界，在完整所选词库中传播一一对应关系。', ['Dictionary substitution', '带空格替换密码'], [
    source('solver', '固定版本单表替换求解器', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/substitution/substitution.js', 'implementation', 'Token、MappingTable、候选传播与搜索'),
    source('words', '上游单表工具说明', 'philippica / cipher_machine', 'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/readme.md', 'author-spec', '带空格的单表暴力', 'zh-CN'),
  ], [
    section('重复模式与全局一致映射', ['单表替换要求同一个密文字母总映射到同一个明文字母，不同密文字母的映射不能相撞。先把每个词改写成重复模式，例如 abb，再从词库取同模式、同长度的候选。', '多个词共享同一映射表。一个词的候选会排除其他词中冲突的候选，剩余歧义由搜索展开；不能给每个词各选一个看似合理的词就结束。'], ['solver'], [worked('密文 xyy；只考虑词库候选 all、too、see', '三者都符合 abb，单靠这个词不能唯一选择', 'xyy 的第二、第三字母相同，首字母不同；三个候选都有这种结构。若另一词已确定 x→s，则只剩 see 可同时满足全局映射。')]),
    section('词典限制与多解', ['词边界是此方法的重要输入；任意删空格、漏词或专名未收录会改变候选集合。本站使用所选完整本地词表，不把服务端网站返回结果当作本地求解。', '这与统计打分的单表求解互为补充。词库多解、候选上限或超时必须明确显示，找到可读句子也不能自动证明它就是作者原文。'], ['solver', 'words']),
  ]),
  article('native:words-contains', '字母包含与限定查词', 'text-language', '保留原查词器两种包含判定的并集，与严格字母重排区分。', ['Contains words', '字母超集', '仅指定字母'], [wordImplementation], [
    section('两种条件以“或”相连', ['第一种判定要求词中至少包含查询字母的全部次数，允许出现额外字母。第二种判定只要求词里的每种字母来自查询的字母种类，不限制这些字母重复多少次。命中任一判定都会被收录。', '因此它不是严格同长、同频次的 anagram，也不是“字母必须连续出现”的子串查找。重复次数在第一种判定中有意义，在第二种判定中只用于确定可用字母种类。'], ['words'], [worked('查询 ab；分别判断 cab、baa、cat', 'cab 和 baa 满足规则，cat 不满足', 'cab 包含 a、b 各至少一次；baa 的字母全部属于 {a,b}。cat 缺少 b 且含有集合外的 c、t，因此两个分支都不通过。是否实际列出还取决于所选词库。')]),
    section('词库和重复次数', ['例如查询 aab 时，第一种分支要求至少两个 a 和一个 b；第二种分支仍只允许 a、b 两类字母，并不把词长限制为三。需要逐字母计数相等时应使用既有严格重排功能。', '切换完整词表或词类过滤会改变可列出的词，不改变上述判定语义；空查询不能被当成无限通配式自动枚举所有内容。'], ['words']),
  ]),
  article('native:words-code', '自定义谓词查词', 'text-language', '在本地隔离 QuickJS 中，对所选词库逐词运行用户明确编写的筛选函数。', ['Predicate word search', 'JS 查词'], [wordImplementation,
    source('quickjs', 'QuickJS JavaScript Engine', 'Fabrice Bellard / Charlie Gordon', 'https://www.bellard.org/quickjs/quickjs.html', 'official-doc', 'Runtime memory limit、interrupt handler 与 API'),
  ], [
    section('函数的返回值就是命中条件', ['函数签名为 (word, tools) => 返回值。每个词分别传入；返回假值就不收录，返回真值则将该值字符串化作为结果，因此可以返回原词，也可以返回计算后的文本。', 'tools.isWord(s) 按当前完整词库判断是否有该词。上游 tools.anagram(s,letters) 的实际语义是 s 至少包含 letters 的字符次数，允许多余字符，并非严格同长重排；不要仅凭函数名字猜其行为。'], ['words'], [worked('word => word.length === 5 && word', '只保留长度为 5 的词，并返回这些词本身', '长度不符时 && 返回 false，符合时返回 word；若写成 word => word.length === 5，则符合的词会返回字符串 true，丢失原词。')]),
    section('隔离与资源边界', ['本站把用户函数放进 QuickJS 运算环境，不在页面或宿主 Worker 上使用 eval，也不向函数开放 DOM、网络和宿主对象。语法错误应报错，不能悄悄转换成零命中。', '自定义程序可能死循环或产生巨大结果，因此保留独立线程、约十秒执行上限、128 MB 引擎内存与 32 MB 输出限额。达到限额说明此次搜索未完整结束，不能声称词库里没有其他答案。'], ['quickjs', 'words']),
  ]),
  article('native:keyboard-qwerty', 'QWERTY 键盘替换', 'characters', '把字母表顺序与 QWERTY 键盘行序按相同位置配对。', ['ABC QWERTY', '键盘密码'], [keyboardImplementation], [
    section('按表的位置配对', ['左表为 ABCDEFGHIJKLMNOPQRSTUVWXYZ，右表为 QWERTYUIOPASDFGHJKLZXCVBNM；同一位置的字符互换。编码从左表查右表，解码反过来查。', '这种规则依据键盘从上到下、从左到右的字母行序，并非把键盘上的手指位置整体平移一键，也不受系统当前输入法改变。'], ['mapping'], [worked('ABC → QWERTY 行序方向，输入 ABC', 'QWE', 'A、B、C 是字母表第 1、2、3 项，对应右表 Q、W、E；反向输入 QWE 得到 ABC。')]),
    section('自定义表和歧义', ['两张表都必须按实际设置核对；自定义多字符记号采用最长匹配时，短记号可能成为长记号的前缀。要保证可逆，需要避免无法明确分割的输出，或使用分隔符。', '键盘替换不自动推断 Dvorak、AZERTY 或九键规则。字母排列本身就是密钥资料，不宜把不同键盘转换都称为同一种“QWERTY 位移”。'], ['mapping']),
  ]),
  article('native:keyboard-ninekey', '手机九键序号', 'characters', '用数字键号和键内位置标记一个字母，提供明确的双向转换。', ['Multi-tap key index', '九键键号序号'], [keyboardImplementation], [
    section('两个数字表示键号与位置', ['采用 2=abc、3=def、4=ghi、5=jkl、6=mno、7=pqrs、8=tuv、9=wxyz。每个字母编码为所在键号，随后接它在此键中的 1 起始位置。', '例如键 7 和键 9 各有四个字母，位置允许到 4；其余六个字母键只有三个位置。解码必须同时验证键号与位置，不把 24 当成有效的 abc 第四个字母。'], ['mapping'], [worked('a s z', '21 74 94', 'a 是键 2 第 1 个字母；s 是键 7 第 4 个字母；z 是键 9 第 4 个字母。数字对反查恢复对应字母。')]),
    section('与 T9 和重复按键区分', ['这里是明确的键号加位置，不是只输入一个键号再用词库预测单词的 T9，也不是把 a、b、c 写作 2、22、222 的多击记法。', '自定义字符表和无分隔多字符记号可能引入多义；需要按实际分隔与最长匹配规则解码，不自动猜测缺失的边界或单词。'], ['mapping']),
  ]),
];
