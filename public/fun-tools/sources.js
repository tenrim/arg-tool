const github = (name) => 'https://github.com/' + name;
const rows = [
  ['pic-scramble', 'iris10086/pic-scramble', 'MIT', 'Gilbert 曲线和像素置换。'],
  ['stegcloak', 'KuroLabs/stegcloak', 'MIT', '完整 StegCloak 加密、压缩、HMAC 和零宽字符格式。'],
  [
    'hidden-watermark',
    'guofei9987/hidden_watermark',
    'MIT',
    '固定 Rust 文本水印格式的 JavaScript 适配。',
  ],
  ['crypttool', 'guofei9987/CryptTool', 'MIT', '水印密码种子、LCG、XOR 和二进制位序。'],
  ['buddha', 'takuron/talk-with-buddha', 'MIT', '佛又曰 V2 字符映射和 AES 口令格式。'],
  ['beast', 'ntnyq/beast-codec', 'MIT', '完整兽音编码解码与可选首尾标记。'],
  ['spectrotrace', 'j-about/SpectroTrace', 'MIT', '完整图片加法合成引擎与高级参数。'],
  [
    'spectrum',
    'HK-SHAO/atools',
    'GPL-3.0-only',
    'Spectrum 原始编解码、WASM 内核、图片元数据、相位恢复与质量分析；对应源码随包提供。',
  ],
  ['hideinfo', 'guofei9987/HideInfo', 'MIT', '化物为图 RGB 文件封装格式适配。'],
  [
    'screendrop',
    'guofei9987/ScreenDrop',
    'MIT（README 明示）',
    '完整 GF 分块协议、CRC16 与 SHA-256。',
  ],
];
export const FUN_LICENSES = rows.map(([id, repo, license, role]) => ({
  name: repo.split('/').at(-1),
  url: github(repo),
  license,
  role,
  notices: [
    `vendor/fun-tools/${id}-${['screendrop', 'crypttool'].includes(id) ? 'NOTICE' : 'LICENSE'}.txt`,
  ],
}));
FUN_LICENSES.push({
  name: 'node-qrcode',
  url: github('soldair/node-qrcode'),
  license: 'MIT',
  role: 'ScreenDrop 原版二维码生成器。',
  notices: ['vendor/fun-tools/qrcode-LICENSE.txt'],
});
FUN_LICENSES.push({
  name: 'CryptoJS 4.2.0',
  url: github('brix/crypto-js'),
  license: 'MIT',
  role: '佛又曰 V2 的 AES 口令加解密。',
  notices: ['vendor/fun-tools/crypto-js-LICENSE.txt'],
});
export const FUN_SOURCES = {
  'pic-scramble': [github('iris10086/pic-scramble')],
  'visual-crypto': [],
  'text-steganography': [
    github('KuroLabs/stegcloak'),
    github('guofei9987/hidden_watermark'),
    github('guofei9987/CryptTool'),
  ],
  'beast-codec': [github('ntnyq/beast-codec')],
  'buddha-codec': [github('takuron/talk-with-buddha'), github('brix/crypto-js')],
  'spectral-images': [github('j-about/SpectroTrace'), github('HK-SHAO/atools')],
  'file-image': [github('guofei9987/HideInfo')],
  'screen-drop': [
    github('guofei9987/ScreenDrop'),
    github('soldair/node-qrcode'),
    github('cozmo/jsQR'),
  ],
};
FUN_LICENSES.push({
  name: 'AudioJS 解码器',
  url: github('audiojs/decode'),
  license: '各包分别为 MIT、Apache-2.0、GPL-2.0；内嵌库各自许可见 notice',
  role: '完整音频解码回退。AAC/FAAD2 在独立 Worker 中运行；保留对应源码与构建脚本。',
  notices: [
    'vendor/fun-tools/DEPENDENCIES-NOTICE.txt',
    'vendor/fun-tools/FAAD2-COPYING.txt',
    'vendor/fun-tools/GPL-2.0.txt',
  ],
});
FUN_LICENSES.push({
  name: 'MoonBit Core',
  url: github('moonbitlang/core'),
  license: 'Apache-2.0',
  role: 'Spectrum WASM 数值内核编译时使用的固定标准库。',
  notices: ['vendor/fun-tools/moon-core-LICENSE.txt'],
});
FUN_SOURCES['spectral-images'].push(
  github('audiojs/decode'),
  github('moonbitlang/core'),
  github('indutny/fft.js'),
);
export function funImplementationSources(panel, implementation) {
  if (panel === 'text-steganography')
    return implementation === 'watermark'
      ? [github('guofei9987/hidden_watermark'), github('guofei9987/CryptTool')]
      : [github('KuroLabs/stegcloak')];
  if (panel === 'spectral-images')
    return implementation === 'trace'
      ? [github('j-about/SpectroTrace'), github('indutny/fft.js')]
      : FUN_SOURCES[panel].filter((url) => url !== github('j-about/SpectroTrace'));
  return null;
}
for (const project of FUN_LICENSES)
  project.sourceArchive = 'vendor/fun-tools/fun-tools-sources.zip';
for (const project of FUN_LICENSES)
  if (['stegcloak', 'beast-codec'].includes(project.name))
    project.notices.push('vendor/fun-tools/DEPENDENCIES-NOTICE.txt');
