import { FORENSICS_TASKS } from './catalog.js';
export const APERI_SOURCE = 'https://github.com/Zeecka/AperiSolve';
const common = [APERI_SOURCE, 'https://github.com/101arrowz/fflate'];
export function forensicSources(task) {
  return [
    ...new Set([
      ...common,
      task.url,
      ...(['pcrt', 'spectrogram'].includes(task.engine)
        ? ['https://github.com/python-pillow/Pillow']
        : []),
      ...(task.engine === 'spectrogram' ? ['https://numpy.org/'] : []),
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
  ].map(([name, url, license, id]) => ({
    name,
    url,
    license,
    role: '独立分析容器中的图像运算或 PNG 尺寸恢复支持库。',
    notices: ['licenses/forensics/' + id + '.txt', 'licenses/FORENSICS-NOTICE.txt'],
  })),
];
