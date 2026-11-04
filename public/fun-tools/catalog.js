export const FUN_TASKS = [
  ['pic-scramble', '图片混淆', 'image', ['小番茄', 'Gilbert', '像素混淆', '解混淆']],
  ['visual-crypto', '视觉密码', 'image', ['叠图显字', '视觉秘密分享', '透明分片']],
  ['text-steganography', '文本隐写', 'encoding', ['StegCloak', '文本隐水印', '郭飞', '零宽隐写']],
  ['beast-codec', '兽音译者', 'encoding', ['兽语', '嗷呜啊', 'beast']],
  ['buddha-codec', '佛又曰', 'encoding', ['与佛论禅', 'Takuron', '佛语']],
  [
    'spectral-images',
    '图片与声音互转',
    'audio',
    ['SpectroTrace', 'Spectrum', 'atools', '声谱图隐写', '图片转音频'],
  ],
  ['file-image', '化物为图', 'files', ['HideInfo', '文件转图片', '图片还原文件']],
  ['screen-drop', '二维码传文件', 'files', ['ScreenDrop', '离线传文件', '连续二维码']],
].map(([id, title, group, aliases]) => ({ id, title, group, aliases }));
