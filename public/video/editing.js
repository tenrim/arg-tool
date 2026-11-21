// Assemble commands for the bundled FFmpeg, never implement media algorithms here.
export const EDIT_MODES = [
  ['concat', '音视频拼接'],
  ['replace-audio', '替换视频音轨'],
  ['crop', '画面裁切'],
  ['detect', '异常片段检测'],
  ['segments', '多时间段导出'],
  ['sync', '音画同步调整'],
  ['channels', '声道拆分与重组'],
];
export const MULTI_MODES = ['concat', 'replace-audio', 'channels'];
const videoCodec = ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'];
const layouts = ['mono', 'stereo', '2.1', 'quad', '5.0', '5.1', '6.1', '7.1'];
export function planEditing(o, metadata, numeric) {
  const metas = metadata.inputs || [metadata];
  const names = metas.map((_, i) => (i ? `input-${i + 1}` : 'input'));
  const streams = (i, type) => metas[i].streams.filter((s) => s.codec_type === type);
  const video = (i = 0) => {
    const s = streams(i, 'video')[0];
    if (!s) throw Error(`第 ${i + 1} 个文件没有视频轨。`);
    return s;
  };
  const audio = (i = 0) => {
    const tracks = streams(i, 'audio');
    if (!tracks.length) throw Error(`第 ${i + 1} 个文件没有音轨。`);
    const index = numeric(o['edit-track'] ?? 1, '音轨序号', 1, tracks.length, true);
    if (!tracks[index - 1]) throw Error(`第 ${i + 1} 个文件没有所选音轨。`);
    return tracks[index - 1];
  };
  const length = (i = 0, stream) => {
    const tag = stream?.tags?.DURATION || stream?.tags?.duration;
    const parts = /^\d+:\d+:\d+(?:\.\d+)?$/.test(tag || '') ? tag.split(':').map(Number) : [];
    const tagged = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : NaN;
    const direct = Number(stream?.duration);
    const value =
      Number.isFinite(direct) && direct > 0
        ? direct
        : Number.isFinite(tagged) && tagged > 0
          ? tagged
          : Number(metas[i].format?.duration);
    if (!Number.isFinite(value) || value <= 0) throw Error(`无法确定第 ${i + 1} 个文件时长。`);
    return value;
  };
  const one = () => {
    if (metas.length !== 1) throw Error('此操作请选择一个媒体文件。');
  };
  const inputs = names.flatMap((n) => ['-i', n]);
  const job = (args, name, prefix = inputs) => ({
    args: ['-protocol_whitelist', 'file,pipe', ...prefix, ...args, ...(name ? [name] : [])],
    name,
  });
  const num = (key, title, min, max, fallback, integer = false) =>
    numeric(o[key] ?? fallback, title, min, max, integer);
  if (o.mode === 'crop') {
    one();
    const raw = video();
    const rotation = Number(
      raw.side_data_list?.find((s) => s.rotation !== undefined)?.rotation || raw.tags?.rotate || 0,
    );
    if (rotation % 90) throw Error('此视频带非直角旋转信息，请先规范画面方向再裁切。');
    const v = Math.abs(rotation % 180) === 90 ? { width: raw.height, height: raw.width } : raw;
    const x = num('crop-x', '左边距', 0, v.width - 1, 0, true),
      y = num('crop-y', '上边距', 0, v.height - 1, 0, true),
      w = num('crop-width', '裁切宽度', 0, v.width, 0, true) || v.width - x,
      h = num('crop-height', '裁切高度', 0, v.height, 0, true) || v.height - y;
    if (x + w > v.width || y + h > v.height) throw Error('裁切矩形超出原画面。');
    if (w % 2 || h % 2) throw Error('H.264 输出宽高须为偶数；请明确调整裁切尺寸。');
    return [
      job(
        [
          '-map',
          '0:v:0',
          '-map',
          '0:a?',
          '-vf',
          `crop=${w}:${h}:${x}:${y}:exact=1`,
          ...videoCodec,
          '-c:a',
          'aac',
        ],
        'cropped.mp4',
      ),
    ];
  }
  if (o.mode === 'segments') {
    one();
    const rows = String(o.segments ?? '')
      .trim()
      .split(/\r?\n/);
    if (!rows[0] || rows.length > 100) throw Error('请填写 1–100 行区间，每行“起点,终点”（秒）。');
    const isAudio = o['segment-kind'] === 'audio';
    const selected = isAudio ? audio() : video();
    return rows.map((row, i) => {
      const parts = row.trim().split(/[,，\s]+/);
      if (parts.length !== 2) throw Error(`第 ${i + 1} 行须为两个秒数：起点,终点。`);
      const start = numeric(parts[0], `第 ${i + 1} 行起点`, 0, length(0, selected)),
        end = numeric(parts[1], `第 ${i + 1} 行终点`, 0, length(0, selected));
      if (end <= start) throw Error(`第 ${i + 1} 行终点须大于起点。`);
      return job(
        isAudio
          ? ['-map', `0:${audio().index}`, '-c:a', 'pcm_s24le']
          : ['-map', '0:v:0', '-map', '0:a?', ...videoCodec, '-c:a', 'aac'],
        `segment-${String(i + 1).padStart(3, '0')}.${isAudio ? 'wav' : 'mp4'}`,
        ['-ss', String(start), '-t', String(end - start), '-i', 'input'],
      );
    });
  }
  if (o.mode === 'sync') {
    one();
    video();
    const a = audio(),
      duration = length(0, video()),
      offset = num('offset', '声音偏移 / 毫秒', -duration * 1000 + 1, duration * 1000 - 1, 0);
    const shift =
      offset >= 0 ? `adelay=${offset}:all=1` : `atrim=start=${-offset / 1000},asetpts=PTS-STARTPTS`;
    return [
      job(
        [
          '-map',
          '0:v:0',
          '-map',
          `0:${a.index}`,
          '-c:v',
          'copy',
          '-af',
          `asetpts=PTS-STARTPTS,${shift},apad,atrim=duration=${duration}`,
          '-c:a',
          'pcm_s24le',
          '-t',
          String(duration),
        ],
        'synchronized.mkv',
      ),
    ];
  }
  if (o.mode === 'replace-audio') {
    if (metas.length !== 2) throw Error('请选择两个文件：第一项视频，第二项替换用音频。');
    video();
    const a = audio(1),
      policy = o['audio-length'] || 'video';
    if (!['video', 'shortest', 'loop'].includes(policy)) throw Error('未知的音轨时长策略。');
    const duration =
      policy === 'shortest' ? Math.min(length(0, video()), length(1, a)) : length(0, video());
    const source =
      policy === 'loop' ? ['-i', 'input', '-stream_loop', '-1', '-i', 'input-2'] : inputs;
    return [
      job(
        [
          '-map',
          '0:v:0',
          '-map',
          `1:${a.index}`,
          '-c:v',
          'copy',
          '-af',
          `asetpts=PTS-STARTPTS,apad,atrim=duration=${duration}`,
          '-c:a',
          'pcm_s24le',
          '-t',
          String(duration),
        ],
        'replaced-audio.mkv',
        source,
      ),
    ];
  }
  if (o.mode === 'concat') {
    if (metas.length < 2 || metas.length > 20) throw Error('拼接需要 2–20 个文件。');
    const isAudio = o['concat-kind'] === 'audio',
      filters = [],
      labels = [];
    const v = isAudio ? null : video();
    const w = v ? Math.ceil(v.width / 2) * 2 : 0,
      h = v ? Math.ceil(v.height / 2) * 2 : 0;
    metas.forEach((_, i) => {
      const duration = length(i, isAudio ? audio(i) : video(i));
      if (!isAudio) {
        video(i);
        filters.push(
          `[${i}:v:0]setpts=PTS-STARTPTS,scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`,
        );
        labels.push(`[v${i}]`);
      }
      if (streams(i, 'audio').length) {
        const a = audio(i);
        filters.push(
          `[${i}:${a.index}]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${duration}[a${i}]`,
        );
      } else if (!isAudio)
        filters.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${duration}[a${i}]`);
      else throw Error(`第 ${i + 1} 个文件没有音轨。`);
      labels.push(`[a${i}]`);
    });
    filters.push(
      `${labels.join('')}concat=n=${metas.length}:v=${isAudio ? 0 : 1}:a=1${isAudio ? '' : '[v]'}[a]`,
    );
    return [
      job(
        [
          '-filter_complex',
          filters.join(';'),
          ...(isAudio ? [] : ['-map', '[v]', ...videoCodec]),
          '-map',
          '[a]',
          '-c:a',
          isAudio ? 'pcm_s24le' : 'aac',
        ],
        isAudio ? 'joined.wav' : 'joined.mp4',
      ),
    ];
  }
  if (o.mode === 'channels') {
    const action = o['channel-action'] || 'split';
    if (action === 'split') {
      one();
      const a = audio();
      if (!a.channels || a.channels > 64) throw Error('无法确定声道数或超过 64 声道。');
      return Array.from({ length: a.channels }, (_, i) =>
        job(
          ['-map', `0:${a.index}`, '-af', `pan=mono|c0=c${i}`, '-c:a', 'pcm_s24le'],
          `channel-${String(i + 1).padStart(2, '0')}.wav`,
        ),
      );
    }
    if (action !== 'merge') throw Error('未知的声道操作。');
    const refs = String(o['channel-map'] || '')
      .trim()
      .split(/[,，\s]+/);
    if (!refs[0] || refs.length > 8)
      throw Error('重组需要 1–8 个“文件序号:声道序号”，用逗号分隔。');
    const chosen = refs.map((ref, i) => {
      if (!/^\d+:\d+$/.test(ref)) throw Error('声道映射格式示例：1:1,2:1；序号从 1 开始。');
      const [f, c] = ref.split(':').map(Number);
      numeric(f, '文件序号', 1, metas.length, true);
      const a = audio(f - 1);
      numeric(c, '声道序号', 1, a.channels, true);
      return { f: f - 1, c: c - 1, a, i };
    });
    // Each selected channel becomes an explicit mono input to join; repeated channels are allowed.
    const duration = Math.max(...chosen.map(({ f, a }) => length(f, a)));
    const filters = chosen.map(
      ({ f, c, a, i }) =>
        `[${f}:${a.index}]pan=mono|c0=c${c},aresample=48000,asetpts=PTS-STARTPTS,apad,atrim=duration=${duration},aformat=sample_fmts=fltp:channel_layouts=mono[c${i}]`,
    );
    const layout = layouts[chosen.length - 1];
    const labels = chosen.map(({ i }) => `[c${i}]`).join('');
    // amerge + pan explicitly retains the declared input order even when layouts overlap.
    filters.push(
      `${labels}${chosen.length === 1 ? 'anull' : `amerge=inputs=${chosen.length},pan=${layout}|${chosen.map(({ i }) => `c${i}=c${i}`).join('|')}`}[out]`,
    );
    return [
      job(
        ['-filter_complex', filters.join(';'), '-map', '[out]', '-c:a', 'pcm_s24le'],
        'channels-merged.wav',
      ),
    ];
  }
  if (o.mode === 'detect') {
    one();
    const kind = o['detect-kind'] || 'all',
      jobs = [];
    if (!['all', 'black', 'freeze', 'silence'].includes(kind)) throw Error('未知的检测类型。');
    const minimum = num('detect-duration', '最短持续时间', 0.01, 3600, 1);
    // FFmpeg already normalizes the container start. Retain each stream's offset.
    const detectionEnd = (s) => {
      const origin = Number(metas[0].format?.start_time) || 0;
      const direct = Number(s.duration);
      return Number.isFinite(direct) && direct > 0
        ? (Number(s.start_time) || origin) - origin + direct
        : length(0, s) - origin;
    };
    const add = (type, args) =>
      jobs.push({
        ...job([...args, '-f', 'null', '-']),
        detection: type,
        duration: detectionEnd(type === 'silence' ? audio() : video()),
      });
    if (['all', 'black', 'freeze'].includes(kind) && streams(0, 'video').length) {
      if (kind !== 'freeze')
        add('black', [
          '-map',
          '0:v:0',
          '-an',
          '-vf',
          `blackdetect=d=${minimum}:pix_th=${num('black-level', '黑色像素阈值', 0, 1, 0.1)}:pic_th=${num('black-ratio', '黑色面积比例', 0, 1, 0.98)}`,
        ]);
      if (kind !== 'black')
        add('freeze', [
          '-map',
          '0:v:0',
          '-an',
          '-vf',
          `freezedetect=n=${num('freeze-noise', '冻结差异阈值', -100, 0, -60)}dB:d=${minimum}`,
        ]);
    } else if (kind === 'black' || kind === 'freeze') video();
    if (['all', 'silence'].includes(kind) && streams(0, 'audio').length) {
      const a = audio();
      add('silence', [
        '-map',
        `0:${a.index}`,
        '-vn',
        '-af',
        `silencedetect=n=${num('silence-level', '静音阈值', -100, 0, -50)}dB:d=${minimum}`,
      ]);
    } else if (kind === 'silence') audio();
    if (!jobs.length) throw Error('没有可检测的音视频轨道。');
    return jobs;
  }
  throw Error('未知的媒体编辑操作。');
}

export function detectionReport(runs) {
  const events = [],
    labels = { black: '黑屏', freeze: '画面冻结', silence: '静音' };
  for (const { type, logs, duration } of runs) {
    const add = (start, end, open = false) => {
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start)
        events.push({
          type,
          label: labels[type],
          start,
          end,
          duration: end - start,
          endAtFile: open,
        });
    };
    if (type === 'black') {
      for (const m of logs.matchAll(
        /black_start:([\d.e+-]+)\s+black_end:([\d.e+-]+)\s+black_duration:/g,
      ))
        add(Number(m[1]), Number(m[2]));
    } else {
      let start;
      const prefix = type === 'freeze' ? 'freeze' : 'silence';
      const re = new RegExp(`${prefix}_(start|end):\\s*([\\d.e+-]+)`, 'g');
      for (const m of logs.matchAll(re)) {
        if (m[1] === 'start') start = Number(m[2]);
        else if (start !== undefined) {
          add(start, Number(m[2]));
          start = undefined;
        }
      }
      if (start !== undefined) add(start, duration, true);
    }
  }
  events.sort((a, b) => a.start - b.start || a.type.localeCompare(b.type));
  return { checked: runs.map((r) => labels[r.type]), events };
}
