// A complete, bounded introductory article. Historical facts and the site's
// actual parameter conventions are cited separately; examples use one setting.
export const article = {
  id: 'function-op:Enigma',
  capabilityIds: ['op:Enigma'],
  relatedIds: ['op:Enigma'],
  topicGroup: 'classical',
  title: '恩尼格玛密码机',
  summary: '恩尼格玛密码机的结构、转子步进、参数设置及完整加解密实例。',
  aliases: ['Enigma', '恩尼格玛', '转子密码机', '转子、反射器与逐键步进'],
  sources: [
    {
      id: 'history', title: 'Enigma cipher machine',
      publisher: 'Australian Signals Directorate（澳大利亚信号局）',
      url: 'https://www.asd.gov.au/about/history/asd-stories/2022-04-01-enigma-cipher-machine',
      language: 'en', kind: 'official-doc', locator: '设备用途、无线电通信与破译历史',
    },
    {
      id: 'working', title: 'Enigma explained',
      publisher: 'Crypto Museum（设备复原研究）',
      url: 'https://www.cryptomuseum.com/crypto/enigma/working.htm',
      language: 'en', kind: 'author-spec', locator: 'Circuit diagram / Rotor stepping / Reflector / Steckerbrett',
    },
    {
      id: 'wiring', title: 'Enigma wiring',
      publisher: 'Crypto Museum（设备复原研究）',
      url: 'https://www.cryptomuseum.com/crypto/enigma/wiring.htm',
      language: 'en', kind: 'author-spec', locator: 'Enigma I：转子 I、II、III 与反射器 UKW-B 的接线',
    },
    {
      id: 'stepping', title: 'Enigma: Actions Involved in the Double Stepping of the Middle Rotor',
      publisher: 'David H. Hamer（机械动作研究原作者）',
      url: 'https://www.cryptomuseum.com/people/hamer/files/double_stepping.pdf',
      language: 'en', kind: 'author-spec', locator: 'Rotor stepping；Table 1 及复现用转子顺序',
    },
    {
      id: 'guide', title: 'Enigma, the Bombe, and Typex',
      publisher: 'GCHQ CyberChef 操作作者',
      url: 'https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7',
      language: 'en', kind: 'official-doc', locator: 'How to encrypt/decrypt with Enigma；参数、分组与已知明文',
    },
    {
      id: 'engine', title: '本站固定版本的 Enigma 操作说明与参数',
      publisher: 'GCHQ CyberChef（Apache-2.0）',
      url: '/vendor/cyberchef/catalogue.json', language: 'en', kind: 'implementation',
      locator: 'Enigma：Model、转子接线、Ring setting、Initial value、Reflector、Plugboard、Strict output',
    },
  ],
  sections: [
    {
      title: '介绍',
      paragraphs: [
        '恩尼格玛（Enigma）是一类机电密码机，二战期间用于德国军队等机构的通信加密。操作员每按下一个字母，灯板便显示一个结果字母；依次记录这些字母可得到密文。接收方使用相同的机器设置和消息起点还原原文。',
        '密文可通过摩斯电码经无线电传送。摩斯电码承担传送编码，恩尼格玛承担消息加密；将摩斯信号译成字母后，仍需对密文解密。波兰密码分析者与布莱切利园团队等先后参与了恩尼格玛的破译工作。',
        '本文采用处理 A—Z 字母的标准军用三转子结构。其他型号的接线和机械结构可能不同，运算结果须按对应型号核对。',
      ],
      sourceIds: ['history', 'working'],
    },
    {
      title: '结构与工作原理',
      paragraphs: [
        '机器的主要部件包括插线板、入口轮、转子组和反射器。插线板成对交换字母，例如 AB 表示 A、B 互换，未连接的字母保持不变。每个转子以固定接线连接输入接点与输出接点；转动转子会改变字母与接点的对应关系。',
        '电流经插线板和入口轮进入右转子，再依次通过中转子、左转子和反射器。反射器将电流送回转子组，回程从左向右沿接线反查，经入口轮和插线板到达灯板。回程使用各转子的逆向映射。',
        '标准军用结构的反射器将不同接点成对连接，因此在转子位置固定时，整机的字母映射可相互还原，且字母不会映射为自身。按键引起的转子步进会改变映射，相同输入字母在不同位置可能产生不同结果。',
      ],
      sourceIds: ['working'],
      examples: [{
        label: '信号通路',
        input: '按键动作：转子步进后接通电路',
        output: '键盘 → 插线板 → 入口轮 → 右转子 → 中转子 → 左转子\n→ 反射器\n→ 左转子反查 → 中转子反查 → 右转子反查 → 入口轮 → 插线板 → 灯板',
        explanation: '左、中、右均指操作员视角下的安装位置。罗马数字表示转子型号，不限定安装位置；例如，转子 I 也可安装在右侧。',
      }],
    },
    {
      title: '参数',
      paragraphs: [
        '完整设置包括机型、转子顺序、环位、起始位置、反射器和插线板连接。转子顺序通常按操作员视角从左向右记录；I—II—III 表示左侧为 I、中间为 II、右侧为 III，电流去程先通过 III。',
        '环位（Ring setting）规定字母标记环与内部接线的相对位置。起始位置（Initial value）是输入消息前，各转子窗口显示的字母。二者是独立参数，解密时均须与加密设置一致。',
        '环位可用 A—Z 或 01—26 记录，其中 A 对应 01。本文使用字母记法，AAA 的三个位置依次对应左、中、右转子。',
      ],
      sourceIds: ['guide', 'working'],
      examples: [{
        label: '示例参数',
        input: '机型：3-rotor（三转子）\n转子从左到右：I、II、III\n环位：A、A、A\n输入前窗口：A、A、A\n反射器：B\n插线板：留空，无交换对\nStrict output：开启，移除非字母字符并按五字母分组',
        output: 'AAAAA 和 HELLOWORLD 两个实例均使用以上参数，每次运算从窗口 AAA 开始。',
        explanation: '本站三转子模式不使用“第 4 转子”参数。以上为教学设置，不代表某份历史电报的密钥。',
      }],
    },
    {
      title: '加密示例',
      paragraphs: [
        '输入 AAAAA，使用前述参数。转子在电路接通前步进，五次按键使用的窗口位置依次为 AAB、AAC、AAD、AAE、AAF。这一区间尚未触发中转子进位。',
        '第一次按键后，窗口为 AAB，环位为 AAA。输入 A 经右转子 III 映射为 C，经中转子 II 映射为 D，再经左转子 I 映射为 F。反射器 B 将 F 接到 S；回程经左转子反查仍为 S，经中转子得到 E，经右转子得到 B。插线板为空，结果为 B。',
        '以上接点字母已计入转子偏移。右转子处于 B 时，其有效映射与原始接线表的零偏移映射不同。后续按键须按各自的窗口位置计算整条通路。',
      ],
      sourceIds: ['wiring', 'engine'],
      examples: [{
        label: '逐键运算',
        input: '初始窗口 AAA；全部设置同上\n第 1 次：输入 A，步进后 AAB\n第 2 次：输入 A，步进后 AAC\n第 3 次：输入 A，步进后 AAD\n第 4 次：输入 A，步进后 AAE\n第 5 次：输入 A，步进后 AAF',
        output: '第 1 次：B\n第 2 次：D\n第 3 次：Z\n第 4 次：G\n第 5 次：O\n合并密文：BDZGO',
        explanation: '第一次按键的接点变化为 A → C → D → F → S → S → E → B。本例五次相同输入产生不同结果；其他位置或更长输入仍可能出现重复的输出字母。',
      }],
    },
    {
      title: '解密与输出格式',
      paragraphs: [
        '保持参数一致，将窗口复原为 AAA，输入 BDZGO，结果为 AAAAA。第一次按键仍使用 AAB 位置，在同一状态下完成 B→A 的逆向还原；其余字母依次使用相同的位置序列。',
        '实体机器加密五个字母后，窗口已到 AAF，解密前须复原消息起点。本站每次计算均按表单的起始位置创建本次运算，因此本例保持起始位置 AAA 即可重新计算。加密与解密使用相同的转子配置。',
        'Strict output 开启时，非字母字符被移除，输出按五字母分组。分组空格仅用于书写，不表示原文的单词边界；原有空格、标点和大小写也无法据此恢复。',
      ],
      sourceIds: ['guide', 'engine'],
      examples: [{
        label: '加解密往返',
        input: '每次都从 AAA 开始，转子 I—II—III，环位 AAA，反射器 B，无插线板\n第一次输入：HELLOWORLD\n第二次把第一次的密文作为输入，设置保持一致',
        output: '第一次：ILBDA AMTAZ\n第二次：HELLO WORLD',
        explanation: '去掉仅为分组添加的空格，密文是 ILBDAAMTAZ，还原文字是 HELLOWORLD。本站不会据此恢复原文是否有空格、标点或大小写。',
      }],
    },
    {
      title: '转子步进',
      paragraphs: [
        '右转子每次按键步进一步。当其缺口允许拨爪推动中转子时，中转子同时步进。若中转子随后到达自身的进位位置，下一次按键会同时推动中转子与左转子。中转子因此在相邻两次按键中各走一步，称为双步进。',
        '双步进由缺口位置和拨爪机构决定，仅在相应位置发生，每次按键中转子仍只走一步。标准军用步进机构与普通逢 26 进位的计数器不同；将其简化为后者，会在涉及进位的消息中产生不同结果。',
      ],
      sourceIds: ['stepping'],
      examples: [{
        label: '双步进序列',
        input: '此例改用从左到右 III—II—I，环位 AAA\n窗口起点 ADQ，连续按两次字母',
        output: 'ADQ → AER → BFS\n中转子：D → E → F',
        explanation: '右侧 I 从 Q 到 R 时推动中转子 D→E；下一次按键，中转子 E→F，同时推动左转子 A→B。此例使用 III—II—I，与前述加解密实例的 I—II—III 顺序不同。',
      }],
    },
    {
      title: '解谜应用',
      paragraphs: [
        'A—Z 密文、罗马数字转子编号、成对字母以及三个或四个起始字母，可作为识别恩尼格玛相关线索的参考，但不足以单独确定算法。整理线索时，可按机型、转子顺序、环位、起始位置、反射器和插线板分类，记录已知条件与缺失参数。',
        '本站复现本例的步骤为：在关联工具中选择三转子模式，依次设置左 I／中 II／右 III，环位与起始位置均为 A，反射器为 B，插线板留空，再输入示例文字。结果不符时，须逐项核对这些参数和消息起点。',
        '本站 Enigma 操作用于参数已知时的加密与解密，不自动恢复未知密钥。已知明文片段可用于排除不可能的对应：标准结构中，同一位置的明文字母与密文字母不能相同。通过这一筛选的候选仍需进一步验证。',
      ],
      sourceIds: ['guide', 'engine'],
    },
  ],
  misconceptions: [
    '转子编号表示型号，转子顺序表示安装位置；顺序通常按操作员视角从左向右记录。',
    '环位与起始窗口是独立参数，AAA 须注明对应的参数类型。',
    '加密与解密须使用相同设置和相同的消息起点。',
    '插线板按字母对互换，同一字母不能同时属于多个交换对。',
    '五字母分组不保留原文的单词长度和空格位置。',
  ],
};
