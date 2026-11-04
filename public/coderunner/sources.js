import { SERVER_LANGUAGES } from './server-catalog.js';
const unique = new Map();
unique.set('https://nodejs.org/', {
  name: 'Node.js 服务器运行环境',
  url: 'https://nodejs.org/',
  license: 'MIT；V8、OpenSSL 和独立依赖条款按随包声明',
  role: '在独立容器中执行 TypeScript 编译生成的 JavaScript，不替换现有浏览器 QuickJS。',
  notices: ['licenses/CODE-RUNNER-NOTICE.txt'],
});
for (const language of Object.values(SERVER_LANGUAGES)) {
  const existing = unique.get(language.url);
  if (existing) existing.name += ' / ' + language.name;
  else
    unique.set(language.url, {
      name: language.name + ' 服务器运行环境',
      url: language.url,
      license: language.license,
      role: '玩家明确提交后，在本站临时隔离容器中编译或运行程序；每次创建新环境，标准输入与标准输出独立传递。',
      notices: ['licenses/CODE-RUNNER-NOTICE.txt'],
    });
}
export const CODE_RUNNER_LICENSES = Object.freeze([...unique.values()].map(Object.freeze));
export function serverLanguageSources(id) {
  const language = SERVER_LANGUAGES[id];
  const extra =
    id === 'typescript'
      ? ['https://nodejs.org/']
      : ['kotlin', 'scala'].includes(id)
        ? ['https://openjdk.org/']
        : id === 'powershell'
          ? ['https://github.com/dotnet/dotnet']
          : [];
  return [language.url, ...extra];
}
