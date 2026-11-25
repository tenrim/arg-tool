import { FORENSICS_TASKS } from './catalog.js';
import { IMAGE_SURVEY, imageSteps } from './image-plan.js';
export const APERI_SOURCE = 'https://github.com/Zeecka/AperiSolve';
const common = [APERI_SOURCE, 'https://github.com/101arrowz/fflate'];
export function forensicSources(task) {
  if (task.engine === IMAGE_SURVEY) {
    const members = new Set(imageSteps.map((step) => step.engine));
    return [
      ...new Set([
        ...common,
        'https://github.com/guofei9987/HideInfo',
        'https://github.com/Sec-ant/zxing-wasm',
        'https://github.com/zxing-cpp/zxing-cpp',
        'https://github.com/matt-way/gifuct-js',
        'https://github.com/matt-way/jsBinarySchemaParser',
        'https://github.com/photopea/UPNG.js',
        'https://github.com/nodeca/pako',
        ...FORENSICS_TASKS.filter((t) => members.has(t.engine)).flatMap(forensicSources),
      ]),
    ];
  }
  return [
    ...new Set([
      ...(task.engine === 'stegoveritas'
        ? [
            'https://github.com/101arrowz/fflate',
            'https://github.com/ReFirmLabs/binwalk',
            'https://www.darwinsys.com/file/',
            'https://github.com/prettytable/prettytable',
            'https://github.com/ahupp/python-magic',
            'https://github.com/python-distro/distro',
          ]
        : common),
      task.url,
      ...(['pcrt', 'spectrogram', 'stegoveritas'].includes(task.engine)
        ? ['https://github.com/python-pillow/Pillow']
        : []),
      ...(['spectrogram', 'stegoveritas'].includes(task.engine) ? ['https://numpy.org/'] : []),
      ...(task.engine === 'pcrt'
        ? [
            'https://github.com/pallets/flask',
            'https://github.com/pallets-eco/flask-sqlalchemy',
            'https://www.sqlalchemy.org/',
          ]
        : []),
    ]),
  ];
}
export const FORENSICS_LICENSES = [
  ...FORENSICS_TASKS.filter((t) => t.url !== APERI_SOURCE).map((t) => ({
    name:
      {
        exiftool: 'ExifTool',
        file: 'file / libmagic',
        identify: 'GraphicsMagick',
        strings: 'GNU Binutils strings',
        pdfinfo: 'Poppler pdfinfo',
        pdfid: 'PDFiD',
        spectrogram: 'FFmpeg',
        openstego: 'OpenStego',
        outguess: 'OutGuess',
        jsteg: 'JSteg',
        jpseek: 'JPHide / JPSeek',
        foremost: 'Foremost',
        steghide: 'Steghide',
        stegoveritas: 'StegoVeritas',
      }[t.engine] || t.engine,
    url: t.url,
    license: t.license,
    role: '服务器单项分析：' + t.description,
    notices: ['licenses/FORENSICS-NOTICE.txt', 'licenses/forensics/' + t.engine + '.txt'],
  })),
  ...[
    [
      'Pillow',
      'https://github.com/python-pillow/Pillow',
      'HPND；依赖及部分文件按各自许可',
      'pillow',
    ],
    ['NumPy', 'https://numpy.org/', 'BSD-3-Clause；内含第三方代码按各自许可', 'numpy'],
    ['Flask', 'https://github.com/pallets/flask', 'BSD-3-Clause', 'flask'],
    [
      'Flask-SQLAlchemy',
      'https://github.com/pallets-eco/flask-sqlalchemy',
      'BSD-3-Clause',
      'flask-sqlalchemy',
    ],
    ['SQLAlchemy', 'https://www.sqlalchemy.org/', 'MIT', 'sqlalchemy'],
    ['PrettyTable', 'https://github.com/prettytable/prettytable', 'BSD-3-Clause', 'prettytable'],
    ['python-magic', 'https://github.com/ahupp/python-magic', 'MIT', 'python-magic'],
    ['distro', 'https://github.com/python-distro/distro', 'Apache-2.0', 'distro'],
  ].map(([name, url, license, id]) => ({
    name,
    url,
    license,
    role: '独立分析容器中的图像运算、格式识别或运行支持库。',
    notices: ['licenses/forensics/' + id + '.txt', 'licenses/FORENSICS-NOTICE.txt'],
  })),
];
