> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 启动卡顿优化

2026-10-25，本地开发阶段仅调整源码；随后按用户明确授权部署六个相关前端文件，见 [线上部署记录](../releases/动画修复-部署记录2026-10-25.md)。未进行 Git 提交或推送。

## 动画连续性（用户进一步明确的重点）

用户主要要求动画流畅，加载耗时是次要指标。本次继续针对实际播放修复，不以缩短加载时间作为流畅度结论：

- 原 `mountInitialLayout` 把同一个加载节点放进 `body.replaceChildren`，仍会造成节点短暂断开，CSS 动画被取消并重新开始。现在创建工作台只在它之后追加原界面节点，加载节点保持连接、沿用原来的 Animation 对象及播放相位。
- 隔离中的工作台不提前播放进入。原先外壳仍为 inert 时，`animatePageEntrance` 无法选择可见卡片，只能回退为整页淡入；同时控件的首次挂载与测量挤占第一帧。`animatePresence` 现在统一排除 inert 区域。
- `startup.js` 等待真实路由后，经公共 `prepareInitialPresence` 等两个渲染阶段，让挂载通知与首次 ResizeObserver 测量在加载层仍显示时完成；随后同步解除原隔离、移除加载层，对当前真实面板调用原 `animatePresence`。共享层仍使用同一 Animate UI Effect、弹簧、淡入与位移参数，不另建动画方案或定时延迟；后台页面直接完成等待，准备期间进入后台也立即释放等待。

在 Chrome、1280 × 900、CPU 4 倍减速的本地渲染采样中，入场后的前 800 毫秒：

| 动画观察项 | 本次修正前 | 本次修正后 |
| --- | --- | --- |
| 主线程相邻帧最大间隔 | 219.4 毫秒 | 29.3 毫秒 |
| 主线程帧间隔超过 50 毫秒 | 1 次 | 0 次 |
| 主线程帧间隔中位数 | 16.7 毫秒 | 16.7 毫秒 |
| 首个记录到的入场运动，距加载层移除 | 255.5 毫秒 | 102.1 毫秒 |

原本加载方块已由浏览器合成播放：即使主线程阻塞，采集画面仍会连续变化，本次重点是修复节点移动引起的重启。修正后两个持续约 2.4 秒／2.0 秒的初始化长任务内分别采集到 139／112 个不同的方块画面；不把主线程的阻塞直接等同于合成动画卡帧，也不把浏览器采样冒称所有实体设备的固定帧率保证。

证据为 `outputs/startup-performance/motion-before.json`、`entry-before.json`、`motion-after.json`。专项回归另外断言加载节点不被移动、三个原 Animation 对象保留，以及首页实际卡片存在连续的中间透明度、页面根不再承担隔离状态的回退淡入；保留窄屏、减少动态、输入、重试与禁用 JavaScript 检查。

参考仍为下述同一 Animate UI 固定提交：`primitives/effects/effect/index.tsx:102-176` 使用实际 slide / fade variants；`primitives/slot/index.tsx:97-133` 转交真实节点的 ref 与属性。本次修正本站挂载与启动时序，不改上游代码或运行包。

## 原因与修正

- `ui/motion.js` 原先为隐藏工具中的全部复选框挂载 React / Animate UI 指示器；现在与原下拉框准备流程一起，等待所属区域取消 `hidden` 后挂载。真实输入节点、勾选及不确定状态继续由原控制器持有，显示时读取当前值，重复显示不重复挂载。
- `ui/animate-ui.js` 移除每次挂载复选框指示器后立即读取布局的操作，使用已有 ResizeObserver 的首次通知定位；后续尺寸变化及卸载清理继续保留。
- `workspace.js` 原先逐个读取所有工作区的跳转目标尺寸并立即写入按钮可见性，导致反复布局。现在只处理当前可见面板，先集中读取、再写入确有变化的状态，并把同一帧的多次通知合并；主节点卸载时取消回调、移除监听。

上一轮的性能改动保持加载动画及 Animate UI 进入参数；本轮进一步修复上述播放时序，没有改动第三方运行包、引入新依赖或复制上游代码。

## 参考编码

先使用 `SearchProject` 检索启动动画、`animatePageEntrance` 与 `mountWorkspaceGuides sync`，再使用 `SearchReference -Repo animateui` 检索 `Effect transition stagger` 及 `Checkbox Indicator useIsInView`，回到原文件确认。

参考仓库为 `https://github.com/animate-ui/animate-ui`，固定提交 `c28163655493f98bff9dc0362301a6242f74a1fd`：

- `packages/react/src/primitives/effects/effect/index.tsx:63-125`：既有 Effect 使用进入弹簧及减少动态配置，保留本站对应适配，不替换动画方案。
- `packages/react/src/primitives/base-ui/checkbox/checkbox.tsx:15-67`：Root / Indicator 接收 checked 与 indeterminate，并由 IndicatorPresence 和 ReducedMotionConfig 呈现。因此延后装配视觉层时继续读取原生输入当前状态，不创建第二份表单状态。

核对本站 `public/vendor/ui-runtime/UPSTREAM.json` 的 Animate UI 2.0.0 / Base UI 1.8.0 及当前 `attachAnimateCheckbox` 调用；不依据参考快照升级版本。

## 本轮验证

Chrome 无界面模式，1280 × 920，CPU 4 倍减速，通过相同本机服务读取 public，启用相同 CPU 采样：

| 观察项 | 修改前 | 修改后两次记录 |
| --- | --- | --- |
| 真实工作区就绪 | 7.10 秒 | 5.27 / 5.68 秒 |
| 初始化最长阻塞任务 | 3.95 秒 | 2.30 / 2.41 秒 |
| 就绪后紧接着的阻塞任务 | 2.04 秒 | 0.18 / 0.22 秒 |

就绪耗时在这两次对照中缩短约 20%—26%。这些是本地模拟和采样结果，不代表实体手机或线上网络耗时；初始化本身仍有长任务，不宣称达到全程固定帧率。

采样及页面截图位于被忽略的 `outputs/startup-performance/`，包括 `baseline.json`、`optimized.json`、`final.json`。

`scripts/browser-startup.mjs` 通过：桌面及 375px 等待画面、系统与站内减少动态设置、原深链接与可编辑输入、加载失败后的原链接重试、禁用 JavaScript 提示；新增验证隐藏复选框延后装配、显示时继承勾选及不确定状态、点击与反复显示、单份指示器及卸载清理，并确认工作区同步不读取隐藏面板目标的尺寸。浏览器未捕获页面错误。

本轮没有运行无关工具套件或整站构建。
