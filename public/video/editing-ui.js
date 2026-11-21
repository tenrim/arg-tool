import { Textarea } from '../ui/index.js';
export const EDIT_HELP = {
  concat:
    '按下面的文件顺序拼接；可上下移动。视频统一为首项尺寸（等比留边）、30 fps；音频统一为 48 kHz 双声道。每个文件使用指定序号音轨，无声视频补静音。',
  'replace-audio':
    '第一项为视频，第二项为替换音频（也可为含音轨的视频）。只保留第一条画面轨和所选替换音轨，输出 MKV，画面不重编码。',
  crop: '以正常播放方向的左上角为原点，单位为画面像素（自动处理直角旋转标记）。宽高填 0 表示延伸到原画面边缘；输出宽高须为偶数。保留全部音轨。',
  detect:
    '检查完整文件的黑屏、画面冻结或静音，并列出起止秒数。静音检查所选音轨的整体信号；全类型检测会跳过文件中不存在的音频或画面。候选不代表损坏或隐藏线索。',
  segments:
    '每行填写“起点,终点”，单位秒，例如 0,5。按填写顺序分别导出；允许区间重叠。全部校验通过后才处理，最多 100 段。视频保留全部音轨；音频导出使用所选音轨。',
  sync: '正数让声音晚出现，负数让声音提前；保留视频长度，空缺补静音，超出部分裁掉。输出 MKV，仅保留第一条画面轨和所选音轨，画面不重编码。',
  channels:
    '拆分：把所选音轨的每个声道导出为独立 WAV。重组：按映射的顺序生成 1–8 声道 WAV；序号从 1 开始，例如 1:2,1:1 交换左右声道，1:1,2:1 合并两个文件的首声道。重组统一 48 kHz，以所选来源的最长时长补静音。',
};
export function editingFields({ select, number, field }) {
  return [
    select('concat-kind', '拼接类型', [
      ['video', '视频（含声音）'],
      ['audio', '仅音频'],
    ]),
    number('edit-track', '使用第几条音轨（从 1 开始）', 1, { min: 1, step: 1 }),
    select('audio-length', '替换音频的时长处理', [
      ['video', '保持视频长度：短音频补静音'],
      ['loop', '保持视频长度：循环短音频'],
      ['shortest', '截到较短文件长度'],
    ]),
    number('crop-x', '左边距 / 像素', 0, { min: 0, step: 1 }),
    number('crop-y', '上边距 / 像素', 0, { min: 0, step: 1 }),
    number('crop-width', '裁切宽度（0 到右边缘）', 0, { min: 0, step: 2 }),
    number('crop-height', '裁切高度（0 到下边缘）', 0, { min: 0, step: 2 }),
    select('detect-kind', '检测内容', [
      ['all', '黑屏、冻结、静音'],
      ['black', '黑屏'],
      ['freeze', '画面冻结'],
      ['silence', '静音'],
    ]),
    number('detect-duration', '异常最短持续时间 / 秒', 1, { min: 0.01, step: 0.1 }),
    number('black-level', '黑色像素亮度阈值（0–1）', 0.1, { min: 0, max: 1, step: 0.01 }),
    number('black-ratio', '黑色像素面积比例（0–1）', 0.98, { min: 0, max: 1, step: 0.01 }),
    number('freeze-noise', '冻结帧差异阈值 / dB', -60, { min: -100, max: 0, step: 1 }),
    number('silence-level', '静音阈值 / dB', -50, { min: -100, max: 0, step: 1 }),
    select('segment-kind', '分段输出', [
      ['video', '视频 MP4'],
      ['audio', '音频 WAV'],
    ]),
    field(
      'segments',
      '导出区间（每行：起点,终点 / 秒）',
      Textarea({ id: 'video-segments', rows: 3, value: '0,5\n10,15' }),
    ),
    number('offset', '声音偏移 / 毫秒（正数延迟，负数提前）', 0, { step: 10 }),
    select('channel-action', '声道操作', [
      ['split', '逐声道拆分'],
      ['merge', '指定声道重组'],
    ]),
    field(
      'channel-map',
      '输出声道顺序（文件序号:声道序号）',
      Textarea({ id: 'video-channel-map', rows: 2, value: '1:1,2:1' }),
    ),
  ];
}
export function editingVisibility(mode, controls) {
  const detect = mode === 'detect',
    kind = controls['detect-kind'].value;
  return {
    'concat-kind': mode === 'concat',
    'edit-track':
      ['concat', 'replace-audio', 'sync', 'channels'].includes(mode) ||
      (detect && ['all', 'silence'].includes(kind)) ||
      (mode === 'segments' && controls['segment-kind'].value === 'audio'),
    'audio-length': mode === 'replace-audio',
    ...Object.fromEntries(
      ['crop-x', 'crop-y', 'crop-width', 'crop-height'].map((k) => [k, mode === 'crop']),
    ),
    'detect-kind': detect,
    'detect-duration': detect,
    'black-level': detect && ['all', 'black'].includes(kind),
    'black-ratio': detect && ['all', 'black'].includes(kind),
    'freeze-noise': detect && ['all', 'freeze'].includes(kind),
    'silence-level': detect && ['all', 'silence'].includes(kind),
    'segment-kind': mode === 'segments',
    segments: mode === 'segments',
    offset: mode === 'sync',
    'channel-action': mode === 'channels',
    'channel-map': mode === 'channels' && controls['channel-action'].value === 'merge',
  };
}
