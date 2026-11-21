// Commands target the bundled FFmpeg core; media algorithms remain upstream.
import { EDIT_MODES, planEditing } from './editing.js';
export const VIDEO_MODES = [
  ...EDIT_MODES,
  ['frame', '提取指定时刻 PNG'],
  ['frames', '连续帧提取'],
  ['audio', '音轨提取'],
  ['native', '媒体格式转换'],
  ['clip', '裁剪视频'],
  ['mute', '移除视频音轨'],
  ['resize', '缩放视频'],
  ['rotate', '旋转／翻转视频'],
  ['speed', '调整视频速度'],
  ['reverse', '视频与音轨倒放'],
  ['gif', '视频转 GIF'],
  ['subtitle', '提取文字字幕'],
  ['inspect', '媒体信息与轨道'],
  ['animation', 'GIF / APNG 完整逐帧分析与精灵图'],
  ['capabilities', '查看固定核心的全部能力'],
];
export const AUDIO_FORMATS = [
  ['wav', 'WAV（PCM，无损解码）'],
  ['mp3', 'MP3'],
  ['m4a', 'M4A（AAC）'],
  ['flac', 'FLAC（无损）'],
  ['mka', '原音轨（MKA，不重编码）'],
];
export const MEDIA_TYPES = {
  png: 'image/png',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mka: 'audio/x-matroska',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  srt: 'text/plain',
  vtt: 'text/vtt',
  json: 'application/json',
  txt: 'text/plain',
};
export function numeric(value, title, min, max, integer = false) {
  const n = Number(value);
  if (
    String(value).trim() === '' ||
    !Number.isFinite(n) ||
    n < min ||
    n > max ||
    (integer && !Number.isInteger(n))
  )
    throw Error(`${title}须为 ${min}–${max}${integer ? ' 的整数' : ''}。`);
  return n;
}
export function mediaSummary(meta) {
  return [
    `时长：${meta.format?.duration ?? '未知'} 秒`,
    `格式：${meta.format?.format_long_name || meta.format?.format_name || '未知'}`,
    ...(meta.streams || []).map(
      (s) =>
        `轨道 #${s.index} · ${s.codec_type} · ${s.codec_name || '未知'}${s.width ? ` · ${s.width}×${s.height}` : ''}${s.sample_rate ? ` · ${s.sample_rate} Hz · ${s.channels} 声道` : ''}${s.tags?.language ? ` · ${s.tags.language}` : ''}`,
    ),
  ].join('\n');
}
export function planMedia(o, meta) {
  if (EDIT_MODES.some(([id]) => id === o.mode)) return planEditing(o, meta, numeric);
  const mode = o.mode,
    streams = meta.streams || [],
    audio = streams.filter((s) => s.codec_type === 'audio'),
    video = streams.filter((s) => s.codec_type === 'video'),
    subtitles = streams.filter((s) => s.codec_type === 'subtitle');
  const duration = Number(meta.format?.duration || video[0]?.duration || audio[0]?.duration);
  const custom = mode === 'native' && o.custom;
  if (custom) {
    let args;
    try {
      args = JSON.parse(o.command);
    } catch {
      throw Error('自定义命令必须是 JSON 字符串数组。');
    }
    if (
      !Array.isArray(args) ||
      !args.length ||
      args.length > 300 ||
      args.some(
        (x) =>
          typeof x !== 'string' ||
          x.length > 10000 ||
          /(:\/\/|^-protocol_whitelist$|^-protocol_blacklist$)/i.test(x),
      )
    )
      throw Error('参数须为最多 300 项的本地 FFmpeg 字符串数组，不接受网络协议覆盖。');
    return [{ args: ['-protocol_whitelist', 'file,pipe', ...args] }];
  }
  if (!VIDEO_MODES.some(([id]) => id === mode)) throw Error('未知的媒体操作。');
  if (['inspect', 'capabilities'].includes(mode)) return [];
  const needsVideo = [
    'frame',
    'frames',
    'reverse',
    'gif',
    'clip',
    'mute',
    'resize',
    'rotate',
    'speed',
  ].includes(mode);
  if (needsVideo && !video.length) throw Error('文件没有视频轨；请使用音轨提取或音频格式转换。');
  const clip = mode !== 'frame' && o.range === 'clip';
  const start = mode === 'frame' || clip ? numeric(o.start, '起点', 0, 1e9) : 0;
  const length = clip ? numeric(o.duration, '片段长度', 0.001, 1e9) : duration;
  if (Number.isFinite(duration) && start >= duration)
    throw Error(`起点超出媒体时长（${duration} 秒）。`);
  if (clip && Number.isFinite(duration) && start + length > duration + 0.1)
    throw Error(`片段终点超出媒体时长（${duration} 秒）；请调整范围。`);
  // Input-side -t bounds reverse's buffered frames, instead of trimming after the filter.
  const base = [
    '-protocol_whitelist',
    'file,pipe',
    ...(start ? ['-ss', String(start)] : []),
    ...(clip ? ['-t', String(length)] : []),
    '-i',
    'input',
  ];
  const job = (args, name) => ({ args: [...base, ...args, name], name });
  const encode = ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac'];
  const maps = ['-map', '0:v:0', '-map', '0:a?'];
  const width = ['frames', 'gif', 'resize'].includes(mode)
    ? numeric(o.width, '输出宽度（0 保持原尺寸）', 0, 7680, true)
    : 0;
  const scale = width ? `scale=${width}:-2` : '';
  if (mode === 'frame') return [job(['-map', '0:v:0', '-frames:v', '1'], 'frame.png')];
  if (mode === 'frames' || mode === 'gif') {
    const fps = numeric(o.fps, '采样帧率', 0.01, 60);
    if (mode === 'frames') {
      const max = numeric(o.maxFrames, '帧数上限', 1, 1000, true);
      if (!Number.isFinite(length)) throw Error('媒体时长未知，请选择指定片段以确定抽帧范围。');
      if (Math.ceil(length * fps) > max)
        throw Error(
          `预计 ${Math.ceil(length * fps)} 帧，超过设定的 ${max} 帧；请降低帧率、缩短范围或提高上限，不会静默截断。`,
        );
      return [
        job(
          ['-map', '0:v:0', '-vf', [`fps=${fps}`, scale].filter(Boolean).join(',')],
          'frame-%06d.png',
        ),
      ];
    }
    return [
      job(
        [
          '-filter_complex',
          `[0:v:0]fps=${fps}${scale ? ',' + scale : ''},split[a][b];[a]palettegen[p];[b][p]paletteuse`,
          '-an',
          '-loop',
          '0',
        ],
        'clip.gif',
      ),
    ];
  }
  if (mode === 'audio') {
    if (!audio.length) throw Error('文件没有音轨，无法提取声音。');
    const selected =
      o.track === 'all'
        ? audio
        : [audio[numeric(o.track, '音轨序号（从 1 开始）', 1, audio.length, true) - 1]];
    const codecs = {
      wav: ['pcm_s16le'],
      mp3: ['libmp3lame'],
      m4a: ['aac'],
      flac: ['flac'],
      mka: ['copy'],
    }[o.audioFormat];
    if (!codecs) throw Error('请选择支持的音频格式。');
    return selected.map((s) =>
      job(
        ['-map', `0:${s.index}`, '-vn', '-c:a', ...codecs],
        `audio-${audio.indexOf(s) + 1}.${o.audioFormat}`,
      ),
    );
  }
  if (mode === 'subtitle') {
    if (!subtitles.length)
      throw Error('文件没有内嵌字幕轨。画面上烧录的字幕不能通过轨道提取获得。');
    const s =
      subtitles[numeric(o.subtitleTrack, '字幕轨序号（从 1 开始）', 1, subtitles.length, true) - 1];
    if (['hdmv_pgs_subtitle', 'dvd_subtitle', 'dvb_subtitle', 'xsub'].includes(s.codec_name))
      throw Error('这是图像字幕，不能直接转为文字字幕。');
    return [job(['-map', `0:${s.index}`, '-c:s', 'srt'], 'subtitles.srt')];
  }
  if (mode === 'mute') return [job(['-map', '0:v:0', '-c:v', 'copy', '-an'], 'muted.mkv')];
  if (mode === 'clip') return [job([...maps, ...encode], 'clip.mp4')];
  if (mode === 'resize') return [job([...maps, '-vf', scale || 'null', ...encode], 'resized.mp4')];
  if (mode === 'rotate') {
    const filter = {
      right: 'transpose=1',
      left: 'transpose=2',
      half: 'hflip,vflip',
      horizontal: 'hflip',
      vertical: 'vflip',
    }[o.rotation];
    if (!filter) throw Error('请选择旋转／翻转方式。');
    return [job([...maps, '-vf', filter, ...encode], 'rotated.mp4')];
  }
  if (mode === 'reverse')
    return [
      job(
        [
          '-map',
          '0:v:0',
          ...(o.keepAudio ? ['-map', '0:a?'] : []),
          '-vf',
          'reverse',
          ...(o.keepAudio && audio.length ? ['-af', 'areverse'] : ['-an']),
          ...encode,
        ],
        'reverse.mp4',
      ),
    ];
  if (mode === 'speed') {
    const speed = numeric(o.speed, '速度倍数', 0.25, 4);
    const [rateNumerator, rateDenominator = 1] = String(
      video[0].avg_frame_rate || video[0].r_frame_rate,
    )
      .split('/')
      .map(Number);
    const outputRate = (rateNumerator / rateDenominator) * speed;
    const tempo =
      speed < 0.5
        ? `atempo=0.5,atempo=${speed / 0.5}`
        : speed > 2
          ? `atempo=2,atempo=${speed / 2}`
          : `atempo=${speed}`;
    return [
      job(
        [
          ...maps,
          '-vf',
          `setpts=(PTS-STARTPTS)/${speed}`,
          '-vsync',
          'vfr',
          ...(Number.isFinite(outputRate) && outputRate > 0
            ? ['-r', String(outputRate)]
            : ['-enc_time_base', '1:1000000']),
          ...(audio.length ? ['-af', tempo] : []),
          ...encode,
        ],
        'speed.mp4',
      ),
    ];
  }
  if (mode === 'native') {
    const codecs = {
      mp4: ['-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac'],
      webm: [
        '-c:v',
        'libvpx',
        '-deadline',
        'realtime',
        '-cpu-used',
        '5',
        '-b:v',
        '1M',
        '-c:a',
        'libvorbis',
      ],
      mkv: ['-map', '0', '-c', 'copy'],
      mp3: ['-vn', '-c:a', 'libmp3lame'],
      wav: ['-vn', '-c:a', 'pcm_s16le'],
      flac: ['-vn', '-c:a', 'flac'],
    }[o.format];
    if (!codecs) throw Error('请选择支持的输出格式。');
    if (['mp3', 'wav', 'flac'].includes(o.format) && !audio.length)
      throw Error('文件没有音轨，无法转换为音频。');
    return [job(codecs, `converted.${o.format}`)];
  }
  throw Error('此操作使用独立动画工作台。');
}
