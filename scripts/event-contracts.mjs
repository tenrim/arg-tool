// Development-time contracts. Runtime payloads stay inside the browser.
// These are literal source checks, not a parser or a proof about dynamic events.
export const EVENT_CONTRACTS = {
  'arg:astronomy-object': [
    'discovery/bridge.js capabilities/reference-workspaces.js',
    '选定完整天体记录',
    '对象记录；科学工具消费，更新时取消旧运算',
  ],
  'arg:audiochange': ['media-workspace/audio.js', '原音频变更', '无载荷；同步清除结果与录入租约'],
  'arg:audioready': ['media-workspace/audio.js', '原音频载入完成', '无载荷；从原音频所有者读取'],
  'arg:capability-direction': [
    'chef-tools/task-view.js',
    'CyberChef 方向变化',
    'capabilityId、op；由 app 同步实际任务',
  ],
  'arg:capability-native-direction': [
    'capabilities/native-workspaces.js',
    '原生方向变化',
    'id、direction；不自动采纳结果',
  ],
  'arg:cipherchange': ['chef-tools/index.js', '共享分析输入变化', '无载荷；使旧任务结果失效'],
  'arg:collectionschange': ['preferences.js', '收藏或最近使用变化', '无载荷；读取统一偏好所有者'],
  'arg:filechange': ['media-workspace/file.js', '原文件变化', '无载荷；同步清除旧分析和结果'],
  'arg:fileready': ['media-workspace/file.js', '文件载入完成', '无载荷；从文件所有者读取'],
  'arg:imagechange': ['image-tools.js', '原图片变化', '无载荷；同步清除结果租约'],
  'arg:imageready': ['image-tools.js', '图片载入完成', '无载荷；从图片所有者读取'],
  'arg:imageviewchange': [
    'image-tools.js hunt-media.js',
    '当前图片视图变化',
    '无载荷；原图与当前视图分离',
  ],
  'arg:materialchange': [
    'capabilities/native-workspaces.js',
    '素材可用性变化',
    'kind、ready；不携带文件字节',
  ],
  'arg:nativetaskchange': [
    'capabilities/native-workspaces.js',
    '原生任务切换或离开',
    'panel、id、capabilityId、reason；同步取消与失效',
  ],
  'arg:opencapability': [
    'capabilities/browser.js chef-tools/index.js',
    '请求打开已登记功能',
    'id、op、direction、preferredVariant；由 app 验证和导航',
  ],
  'arg:openoperation': ['', '兼容操作打开入口', 'op；仅 app 接收，当前无内建发送者'],
  'arg:panelchange': [
    'app.js',
    '工作区切换',
    '页面、分组、任务、方向等元数据；不携带输入、文件、笔记或结果',
  ],
  'arg:preferenceschange': [
    'preferences.js',
    '偏好变化',
    '无载荷；即时应用展示、动态效果和搜索偏好',
  ],
  'arg:qr-source': ['round-two.js', '主动把图片交给二维码工具', 'source 为本地画布；不联网'],
  'arg:reference-context': [
    'capabilities/reference-workspaces.js',
    '地区工作区上下文变化',
    'workspace、country、kind',
  ],
  'arg:reference-request': [
    'capabilities/reference-workspaces.js discovery/bridge.js',
    '请求选择资料记录',
    'kind、selection；接收方取消旧查询',
  ],
  'arg:reference-result': [
    'reference/index.js',
    '本地资料查询结果',
    'kind、result；原查询控制器拥有结果',
  ],
  'arg:searchopen': ['workspace.js', '打开原位搜索', '无载荷；壳层关闭竞争浮层'],
  'arg:startupcomplete': ['startup.js', '启动完成', '无载荷；启动守卫只接收一次'],
  'arg:subpanelchange': [
    'round2/common.js',
    '共享面板子视图变化',
    'panel、id；调整尺寸或激活对应控制器',
  ],
  'arg:taskimplementationchange': [
    'completion/views.js',
    '当前真实实现变化',
    'name、codec、direction 或 mode；app 解析实际来源',
  ],
  'arg:taskselectionchange': ['app.js', '公开任务选择变化', '任务元数据；壳层更新最近使用'],
  'arg:tasksourceschange': [
    'app.js fun-tools/common.js',
    '真实来源变化',
    '任务与 implementation 元数据；project-sources 更新页末来源',
  ],
  'arg:videochange': ['chef-tools/index.js', '原视频文件变化', '无载荷；旧素材结果失效'],
};
export const PERFORMANCE_MARKS = { 'arg:startup-ready': 'public/startup.js' };
