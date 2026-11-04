import { SERVER_LANGUAGES } from '../../coderunner/server-catalog.js';

export const articles = Object.entries(SERVER_LANGUAGES).map(([id, language]) => ({
  id: 'function-native:code-' + id,
  capabilityIds: ['native:code-' + id],
  relatedIds: ['native:code-' + id],
  topicGroup: 'programming',
  title: language.name,
  summary: language.note,
  aliases: [language.name, language.ext, '主流', '编程', '服务器运行'],
  sources: [
    {
      id: 'language',
      title: language.name + ' 官方语言文档',
      publisher: language.name + ' 项目',
      url: language.docs,
      language: 'en',
      kind: 'official-doc',
      locator: '程序结构、语法及标准输入输出',
    },
    {
      id: 'runtime',
      title: '本站运行环境和参数边界',
      publisher: '迷雾工具箱',
      url: '/coderunner/server-catalog.js',
      language: 'zh-CN',
      kind: 'implementation',
      locator: id,
    },
  ],
  sections: [
    {
      title: '程序结构与输入输出',
      paragraphs: [
        language.note,
        '源代码定义运算和控制流程，标准输入是程序运行时读取的另一段文本。将待处理内容填入标准输入，不会自动把它插入源代码。标准输出与错误诊断分别展示。',
      ],
      sourceIds: ['language', 'runtime'],
      examples: [
        {
          label: '读取一行中文并输出',
          input: language.example + '\n\n标准输入：迷雾\n',
          output: '你好，迷雾\n',
          explanation: '程序读取独立提供的一行文本，并在输出中添加问候语；中文按 UTF-8 传递。',
        },
      ],
    },
    {
      title: '本站执行边界',
      paragraphs: [
        '服务器语言只有在点击“发送并运行”后才上传当前代码与标准输入。每次执行使用新的 Linux 隔离环境，不能访问宿主文件、外部网络或上一次任务的数据；临时文件随任务结束删除。',
        '当前入口运行单个源文件和已安装标准库，不接受任意编译参数或联网安装依赖。代码与标准输入分别最多 256 KB，编译最多 60 秒，执行最多 10 秒，每个编译或执行阶段的标准输出与错误流合计最多 256 KB。超限、编译失败、非零退出和成功完成分别报告；发生错误时保留的输出可能不完整。',
        '“主流／常用”和“冷门／解谜”是本站的查找分组，不是语言排名。运行版本与操作系统会影响语法和库的可用性，服务器返回实际运行环境版本。',
      ],
      sourceIds: ['runtime'],
      examples: [],
    },
  ],
  misconceptions: ['运行一门语言不等于提供该语言的全部第三方框架、桌面系统或移动应用平台。'],
}));
