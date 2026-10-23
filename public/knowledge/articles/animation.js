export const articles=[{
 id:'function-native:video-animation',capabilityIds:['native:video-animation'],relatedIds:['native:video-animation'],
 topicGroup:'video',title:'GIF 与 APNG 逐帧分析',
 summary:'按文件原始顺序解析完整动画、局部帧和延时，按透明与处置规则还原画面，导出精灵图与逐帧线索。',
 aliases:['GIF','APNG','精灵图','sprite sheet','动画差异','动画逐帧'],
 sources:[
  {id:'gif',title:'Graphics Interchange Format Version 89a',publisher:'CompuServe',url:'https://www.w3.org/Graphics/GIF/spec-gif89a.txt',language:'英文',kind:'standard'},
  {id:'png',title:'PNG Third Edition · Animation',publisher:'W3C',url:'https://www.w3.org/TR/png-3/#animation',language:'英文',kind:'standard'},
  {id:'engine',title:'gifuct-js README',publisher:'matt-way',url:'https://github.com/matt-way/gifuct-js',language:'英文',kind:'implementation'},
 ],
 sections:[
  {title:'局部帧与合成画面',sourceIds:['gif','png','engine'],paragraphs:[
   '动画文件常只存发生变化的矩形。逐帧查看需要将矩形按坐标放回完整画布，再按透明度和处置值决定下一帧继承什么。直接把局部帧排成图片会漏掉上一帧留下的内容。',
   'GIF 颜色表索引先映射 RGB，透明索引不覆盖背景；处置 0/1 保留，2 恢复背景，3 恢复绘制前状态。APNG 的 SOURCE 替换矩形，OVER 做 Alpha 合成；处置 NONE 保留、BACKGROUND 清透明、PREVIOUS 恢复绘制前状态。首次 PREVIOUS 按透明初始画布处理。',
  ],examples:[{label:'局部更新不会清空整幅图',input:'2 × 1 画布；第 1 帧两个红像素；第 2 帧在 x=1 放一个不透明蓝像素，保留上一画面。',output:'第 2 张合成画面为「红、蓝」；原始第 2 帧只有 1 × 1 的蓝像素。',explanation:'合成保留 x=0 的红色。差异视图中只有 x=1 改变；原始局部帧仍保留自己的尺寸与位置。'}]},
  {title:'原始时间与完整导出',sourceIds:['gif','png'],paragraphs:[
   'GIF 延时单位是百分之一秒；APNG 保存分子和分母，分母 0 按 100 解释。文件中的零延时保持为零；预览为了让人可以观察而将小于 20 毫秒的帧按 20 毫秒播放，不改写文件或导出的参数。GIF Netscape 循环字段为重复次数，APNG num_plays 为总播放次数，两者的 0 均为无限。',
   '完整 ZIP 保存每一张合成 PNG、每一张原始局部 PNG、GIF 索引字节、全部帧参数和原文件；APNG 的独立默认图像另存而不冒充动画帧。16 位 PNG 原始帧保持位深；屏幕预览和合成导出为 RGBA8，不能用预览替代原始样本。超出明确内存或帧数限制时拒绝整个任务，不用截帧假装完整。',
  ],examples:[{label:'APNG 延时分母为零',input:'delay_num=5，delay_den=0',output:'延时 5/100 秒，即 50 毫秒。',explanation:'分母零按规范解释为 100，完整参数仍记录原字段 0。'}]},
  {title:'精灵图与网格切片',sourceIds:['png'],paragraphs:[
   '精灵图将完整合成帧按行排列，保持原像素尺寸；列数决定行数，最后一行的空格保持透明。顺序和时间保存在独立参数文件中，普通 PNG 本身不保存动画时间。',
   '切片从源文件第一张合成画面读取，使用宽、高、边距与格间距组成的网格。剩余空间不能组成完整格时直接报错。切片原本没有帧延时，不凭空赋予动画速度。',
  ],examples:[{label:'网格尺寸核对',input:'96 × 64 图片，切片 32 × 32，边距与格间距都是 0。',output:'3 列 × 2 行，共 6 个 32 × 32 切片。',explanation:'按从左到右、从上到下排列；改成 30 像素宽就无法整除，工具明确报错，不丢掉右侧像素。'}]},
 ],
}];
