# 通用 UI 组件

验证范围遵循 [TESTING_POLICY.md](TESTING_POLICY.md)：日常只测受影响契约；本文列举的是保留的覆盖能力，不是每次改动的执行清单。完整检查使用 `npm run verify:all`。

开发前必须阅读 [UI 开发强制规则](UI_DEVELOPMENT_RULES.md)；本文说明接口。

本目录约定适用于网站页面、能力总览和全部任务，包括原工具兼容入口、按需加载的第四轮工具、图灵机、科普阅读与动态 CyberChef 参数。能力数量从统一登记生成，不把原工具页面总数作为任务数量。工具的计算引擎、文件和结果模型不归组件层管理；目录与工作区契约见 [能力架构](CAPABILITY_ARCHITECTURE.md)。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `public/ui/index.js` | 页面使用的统一导出入口 |
| `public/ui/core.js` | 实例登记、属性、内容组合、状态及生命周期 |
| `public/ui/motion.js` | 进入／反馈、按 ID 匹配的集合过渡、取消与标签几何 |
| `public/ui/controls.js` | Button / IconButton / Input / Textarea / Select / Option / Field / SearchField / FilePicker / Link |
| `public/ui/layout.js` | ToolCard / Box / Card / ToolPanel / ToolHeader / Toolbar / FormGrid / CheckGroup / SplitView / Result / DataList / Table / Provenance / Navigation / ToolHelp |
| `public/ui/conversion.js` | ConversionWorkbench：共享参数、输入／结果、双向操作和导出组成 |
| `public/ui/feedback.js` | Status / Notice / Badge / EmptyState 与状态更新 |
| `public/ui/overlays.js` | Dialog / Disclosure / TabList / TabPanel 及交互控制器 |
| `public/ui/icons.js` | 侧栏、目录与页面共用的本地 SVG 图标 |
| `public/ui/template.js` | 声明式组合、实例化与安全替换边界 |
| `public/ui/pages.js` | 原六个静态页面的组成及初始应用布局 |
| `public/ui/capabilities.js` | CapabilityButton／CapabilityGroup：统一任务按钮和就地展开列表 |
| `public/ui/components.css` | 公共控件的外观、状态、触控尺寸与响应式规则 |
| `public/navigation.js` | 稳定五类／能力组定义、旧工具路由与网站页登记 |
| `public/capabilities/registry.js` | 真实能力归属、单一功能族配对、旧方向别名、来源覆盖、代表入口、关联功能／科普与统一搜索数据 |
| `public/chef-tools/families.js` | 从登记投影原工具选择与 CyberChef 选板的功能族，保留真实方向 |
| `public/knowledge/content.js` | 逐功能文章、逐节文献、冻结／校验及知识搜索，不拥有 UI 或用户输入 |
| `public/knowledge/page.js` | 科普目录／阅读组合，复用公共组件、焦点及取消契约 |

使用原生 ES 模块和 DOM，不新增 npm 运行依赖。组件返回原生元素：移动、隐藏或切换标签不会重建输入，不会丢失文件与监听器。`data-ui` 用于样式和检查；真实实例登记保存在 WeakMap 中，补一个属性不能将普通元素变成组件。

正文不重复铺开操作说明。`tool-help.js` 通过 `ToolHelp` 与共用展开控制器提供页头说明；`data-tool-help` 将需要动态更新的说明原节点移入该区域，保留 ID 和可访问描述。按需页面可用 `appendToolHelpContent(id, ...nodes)` 追加，帮助尚未挂载时暂存、挂载后移交；共用按需加载器在模块初始化后调用 `collectToolHelpContent(id)` 移交带标记的节点。已有说明覆盖的静态段落直接删除。当前文件、选中项、读数、进度、错误和来源许可不属于这类说明。用户明确要求的科普文章是可见阅读内容，概念、例子与误区直接放在正文，阅读操作的用法仍归共享帮助。

## 组件组成

```js
import {Input, Field, Button, Card, ToolPanel, ToolHeader, Provenance} from './ui/index.js';

const input = Input({id: 'clue-input', value: '', attrs: {maxlength: 1000}});
const page = ToolPanel({
  id: 'panel-example', className: 'panel', hidden: true,
  header: ToolHeader({className: 'page-heading', title: '线索工具'}),
  body: Card({className: 'surface', title: '输入', children: [
    Field({className: 'r1-field', label: '线索', control: input, description: '仅在本机处理'}),
    Button({text: '处理', variant: 'primary', on: {click: () => process(input.value)}}),
  ]}),
  footer: sources.length ? Provenance({className: 'tool-provenance', items: sources}) : undefined,
});
```

组件选项共用 `id`、`className`、`attrs`、`text`、`children`、`hidden` 和 `on`。文字通过 `textContent` 插入。Button 默认 `type="button"`；表单提交按钮显式提供 `type: 'submit'` 或 `attrs.type`。IconButton 必须提供可访问名称。Field 自动关联控件与说明；Table 提供列标题、标题和安全文本行；DataList 组合字段与值。ToolPanel 的顺序为页头、内容、可选来源；有实际第三方项目时，来源保持页面最后。纯本站代码、浏览器内置接口不单独列为项目；project-sources 在工具依赖组合完成后统一移除原生接口条目及空来源栏，未登记外部项目继续明确报出许可缺失，不能隐藏。关于页的开源登记独立保留。

页面可以使用 HTML 语义作为声明式组合语法：

```js
import {render} from './ui/index.js';
render(container, `<div class="surface">
  <label class="r1-field"><span>参数</span><input id="parameter"></label>
  <button type="button" class="primary-button">执行</button>
</div>`);
```

`render` 在离屏模板中解析声明，再逐个调用同一套组件工厂创建新实例；按钮、字段、卡片等不会以原始 HTML 插入页面后再补样式或补标记。`insert` 支持追加、前置及前后插入。完整新树构建成功后才替换旧内容，坏模板不会破坏正在工作的表单。

声明式模板只能来自开发者维护的 UI 组成。动态线索、文件名和结果必须转义，或通过组件的 `text` / `value` 输入；模板解析不是任意 HTML 的通用净化器。模板拒绝脚本、iframe、内联事件等。CyberChef 的不可信 HTML 仍经 `parseInert` 提取文字，图表仍通过原有严格 SVG 白名单重建，不能送入 UI 渲染器。

不允许页面调用 `createElement`、写 `innerHTML`、调用 `insertAdjacentHTML` 或自行 `new Option`；从组件库导入相应方法。Canvas 算法和 SVG 图形几何属于工具的专用渲染层，地图、星图和网格无需改成普通表单组件。

## 交互与状态

- `tabsController` 管理标签与面板的 ARIA 关联、选择、焦点、方向键、Home / End、禁用项和动态增加标签。图片与音频共用它；CyberChef 使用 `visibility: false`，由原响应式布局决定多栏或单栏显示。
- `dialogController` 管理原生模态框、初始焦点、关闭按钮、外部点击、Esc 和焦点恢复。打开时同步测量可见视口，键盘缩小视口或浏览器平移时更新高度及顶部偏移，关闭／销毁时解除监听。旧 close 事件不能清除重新打开的状态。页面仍负责弹层互斥与导航目的地；手机目录先聚焦关闭按钮，搜索按需唤起键盘。
- `disclosureController` 同步说明面板的可见状态、按钮名称及 `aria-expanded`，展开不导航也不清除输入。可选 `responsiveQuery` 由共用控制器在初始化和视口改变时读取当前媒体查询状态，不使用可能过期的事件快照；只在可折叠视口启用 collapse 高度动画，桌面常开容器不保留裁切，内部浮层可完整展开；卸载或销毁解除媒体监听。能力组完整列表和必要任务选择使用共用控制器，不自行维护开关时序。
- `updateStatus` 同时更新安全文字、错误样式和 `data-state`。`setState` 更新 disabled / hidden / busy / selected / expanded / pressed；原生属性直接修改也可被生命周期订阅观察。
- 控制器返回 `destroy()`，销毁可重复调用，旧控制接口不能再激活界面；弹窗销毁时同步关闭并恢复焦点。说明按钮／面板任一端卸载即自动销毁。`onDisconnect` 注册组件确实离开文档后的资源清理；同一批次内搬动组件不视为卸载。

## 表单密度与可用空间

- `SearchField({control, icon, label})` 将图标与输入组成单个搜索框，统一可访问名称和外层焦点。内部 Input 不再重复绘制边框、背景、阴影或焦点轮廓。
- `FormGrid({density, minColumnWidth})` 按所在面板的可用宽度自动决定列数，而不是按页面名称写死手机／桌面列数。默认 `compact`，可使用 `comfortable`；窄屏保持至少 44px 控件高度。短参数可以并排，`Field({span:'full'})` 用于多行、格式＋内容及预设＋自定义等复合字段。
- `CheckGroup({label})` 让相关开关按可用宽度成组换行。每项仍是独立 Field／原生 checkbox，整行点击有效；复选框和文字同行。动态 CyberChef 参数保留原顺序、参数索引及条件隐藏。多控件字段用具名 group，每个控件单独命名，避免一个 label 同时包含两个输入。
- `SplitView({layout, minPaneWidth})` 将输入／结果或两组操作按实际容器宽度分栏／堆叠，默认最小面板宽度 320px。`balanced` 用于始终并排的紧凑可视输入与预览，例如六点盲文；专用点阵和绘图坐标仍由工具负责。
- `Textarea({autoSize:true, minRows, maxRows})` 按内容与换行调整高度，长内容达到上限后内部滚动，默认 4–12 行。普通输入事件和宽度变化共用同一实现；程序修改使用 `setTextareaValue`。原生手动拖动高度仍有效；卸载会清理 ResizeObserver 和待执行帧。声明式模板可提供 `data-fit="content"` 与 `data-min-rows`。
- `EmptyState` 与 Result 的 `data-state="empty"` 共用紧凑占位规则，不为没有输出的状态保留大型装饰区。真实结果、下载与处理链继续使用原始字节。

组件外观与密度规则只在 `components.css` 维护。模块样式只负责组成、图形和工具特有布局；不能再用 `.chef-check` 等页面选择器覆盖公共字段方向或焦点。

## 通用动效

公共节奏和状态样式只在 `components.css` 维护，JS 读取同一时长与曲线（支持 ms／s，保留 0ms）：按压 100ms、焦点／反馈 140ms、页面／标签／结果 180ms、展开 200ms、弹窗与侧栏 220ms；触控设备缩短位移和弹窗时间。曲线为 `cubic-bezier(.2,.8,.2,1)`，不会弹跳或放大整页。CRT 仍为静态纹理。

- `motion.js` 接收 core 的真实挂载、卸载、属性和结果内容变化，优先让一个外层组件进入，避免嵌套字段同时移动。ToolPanel 页根声明 data-motion="fade"，只改变透明度，不创建位移包含块，固定／粘性控件在动画期间也保持位置。结果与 Status 共用反馈；输入事件短暂抑制重复进入，持续进度不重启仍在播放的反馈。
- `animatePresence(node, {kind:'enter'|'feedback'})` 用于操作切换或程序写入的结果，所有显式调用也共用连续输入抑制；`setTextareaValue` 同时处理只读结果反馈。持续计算、进度或模拟快照使用 `setTextareaValue(node, value, {feedback:false})`，保留即时内容和自适应高度，单次操作仍默认反馈；不能在页面关闭公共动效或创建独立动画。重复进入从当前绘制位置继续，切页／卸载、后台页面及系统减少动态效果会取消持有的动画。
- `animateCollection(container, update, {key})` 用于有稳定记录 ID 的列表／可视选择器，先读取旧位置与变换，再同步执行 update，按键匹配新元素并插值。当前塔罗牌扇形切换使用此接口；最多测量 48 项，不复制退出节点，也不复制用户输入。
- `tabsController` 的滑动指示条是 TabList 伪元素，无额外子节点。用布局坐标避免按压缩放污染宽度，并跟随窄屏换行后的实际行位置；ResizeObserver、滚动、字体加载及动态标签共用测量，销毁时清理监听。默认相对定位使用低优先级，不能覆盖页面已有的 sticky／fixed 布局。隐藏标签的状态即时生效；多个桌面面板仍由原响应式布局决定。
- `disclosureController` 即时更新 hidden、inert、ARIA 和文案，原生离散 display 与自然高度插值负责进入／退出；关闭面板不能继续接受键盘输入。原生 details 使用 ::details-content；浮动菜单声明 `data-motion="popover"`，不让高度动画裁切桌面菜单。浮层在打开及退出期间都保持脱离文档流，关闭立即停止命中，不能因移除 open 属性恢复普通排布而挤动表单。
- `dialogController` 仍同步 showModal／close、焦点、inert 与 ARIA；原生 display／overlay 离散过渡负责退出；纵向布局和定位独立于 open，退出时短暂保留视口尺寸快照，在完成／重开／销毁时清理，避免关闭期间横排或跳位。`leaving` 和 `ui:exitcomplete` 只协调视觉清理（例如把侧栏搬回布局），不延迟导航／计算。重新打开或销毁使旧退出回调失效；不支持离散过渡的浏览器直接关闭。
- 执行按钮只有真实 `aria-busy=true` 时显示转圈，不依据 disabled 猜测。已知成功通过 `updateStatus(node, text, 'success')` 显示完成标记；失败、停止和输入作废各自保持真实状态。公共 action 对实际 Promise 提供忙碌反馈，独立 Worker 的按钮在已有控制函数中明确同步。
- CSS 和 JS 均响应 `prefers-reduced-motion` 的实时变化。减少动态效果时保持状态和静态忙碌指示，不播放过渡；普通状态结束后不维持轮询或 RAF 循环。自动高度编辑器在输入时即时调整，不为每个字符补高度动画。

生命周期 `ui:mount`、`ui:unmount`、`ui:state`、`ui:open`、`ui:close`、`ui:toggle`、`ui:select` 保持兼容。观察器只处理真实工厂实例，不补标记或重建 DOM。退出必须在公共控制器内协调，不能依靠已经移除的 `ui:unmount` 执行。

## 验证

```bash
npm run test:plan -- --files public/ui/controls.js
npm run verify -- --files public/ui/controls.js
```

源代码审计检查页面使用公开入口和组件工厂、禁止独立动效与公共外观覆盖、确认最后的组件样式层和每个目录页的必备说明；检查与构建也执行这些规则。单元用例包含 7 个架构约束回归，用不合规片段验证检查会失败。浏览器专项检验真实实例、移动后输入保留、表单属性、模板失败原子性、安全文字表格、SVG 命名空间、标签键盘、说明状态、弹窗焦点和生命周期。另逐个打开所有工具与网站页面及按需加载工具，核对全部常规控件、页头、说明与末尾来源，并检查 320 / 390 / 800 / 1440px 的输入结果宽度。各工具的真实算法回归继续保留，仅在相关算法、数据或接口受影响时执行。

布局专项逐项渲染 505 个官方参数定义，检查控件裁切、复选项位置、整行点击改变参数和复合字段命名，并实际执行 ROT13／Base64。覆盖五类搜索、盲文点阵与结果、短结果编辑器、键盘尺寸视口、可见视口单独缩小／偏移、工具页控件边界及字号放大；不是仅检查页面存在，也不冒称实体安卓测试。

动效专项使用正常动态设置，检查真实路由、按压、侧栏、弹窗进入／退出与重开、说明反复开关、标签几何和键盘、忙碌／成功、结果替换和卸载、桌面浮动菜单、实际塔罗切换与 ROT13、动画期间的粘性标签、手机抽屉与键盘视口、系统偏好实时切换和闲置清理。其余布局／算法回归按实际影响选择，不以仅在减少动态设置下通过代替正常动画验证。

网站页面由 `site-pages.js` 组合相同的 ToolPanel／Card／Field，关于与设置使用 ToolHeader。首页仅包含已收藏、最近使用和工具导航，不添加宣传标题或介绍区。ToolCard 统一首页和弹窗目录的图标、文字、点击与明确收藏状态；网站页面不显示工具专用帮助和收藏页头。`preferences.js` 对本机设置作版本／选项校验，根属性驱动公共字号、密度、扫描线和动效，减少动态效果同时取消已有 JS 动画并关闭 CSS 过渡；系统减少动态效果仍优先。

默认组合约定：不指定组合类名的 Card、Field、DataList 分别使用共用 surface、ui-field、ui-data；默认留白、字段间距与资料排列在 components.css。指定既有组合类名时保留原组合。FilePicker 提供 triggerLabel 时由组件隐藏原生文件输入，只显示触发按钮和文件名；文件对象与程序化选择仍保留。新增工具不得用局部 CSS 补这些基础行为。

## 转换工作台

`ConversionWorkbench({id, settings, inputLabel, resultLabel, reversible})` 返回 `{root, parameters, input, output, run, stop, reverse, use, copy, save, status, details}`。参数使用 Field／FormGrid，输入和结果使用有界自适应 Textarea，桌面双栏、窄屏自然单栏。控制器管理输入版本、停止、超时、清理和真实结果；算法不放入组件。输出使用 setTextareaValue，禁止直接复制一套页面表单或增加独立动效。

转换控制器将程序回填的原始字符串与 textarea 的显示快照分开保存；原生文本框会将 CR／CRLF 显示为 LF。追加／读取使用 `adopt`／`getInput`，手动编辑清除原始快照；反向操作和导出读取真实结果。不能从显示值重新构造引擎数据。

工具搜索由 `capabilities/registry.js` 登记并使用 `tool-search.js` 的公共词汇，首页、侧栏、能力总览、完整目录和全局搜索不能维护不同别名。全局搜索默认跨五类；代表入口、完整列表和搜索匹配相同稳定能力 ID。已有引擎支持的转换继续调用原算法，明确区分 Unicode 码点、UTF-8 字节和数字进制。同类型已支持的编解码／加解密用一个功能族表示，由统一登记提供真实方向；原工具选择与 CyberChef 选板也使用同一功能族投影。旧单向入口通过 `resolveCapability` 保留原方向，方向下拉框保留源输入、立即取消并作废结果；“作为输入”显式采纳真实输出字节，再按需切换方向。保留同名兼容参数和各方向专用草稿，不给哈希等操作推测逆向，也不承诺所有双方向操作无损往返。

## 能力工作区组成

能力总览使用公共 Card／ToolCard／Button／Disclosure 等组件，数量从当前组成员计算，代表入口覆盖不同用途。“全部 N 项”只展开本组；完整目录使用 SearchField 和稳定分组索引，选择任务在同一文档进入真实工作区。桌面侧栏与手机抽屉继续由 `workbench-shell.js` 和共享弹窗控制器管理，不复制侧栏节点或工具输入。

任务外壳组合当前路径、帮助、返回组、全部功能及原工具节点。工具控制器仍拥有输入、参数、Worker 和结果：切换方向或任务时输入可按模型共享，旧结果同步作废；原控件节点不能被导航层重新创建。浏览／详情、输入／结果布局使用公共响应式组合，公共样式与动效保持原有所有权。

资料可视浏览、媒体素材和模拟状态由各专用模型负责。资料点选与关联使用真实记录 ID；图片原始文件与当前结果分离；围棋／国际象棋及其他模拟的规则不因共享外壳而混合。旧路由和收藏 ID 保持兼容，目录能力 ID 不直接进入旧偏好格式。来源许可仍在工作区最后，帮助不重复铺在正文。

`CapabilityButton({entry, onOpen, compact, selected})` 返回公共按钮，使用稳定能力 ID 与实际名称，可明确标记双向操作；`CapabilityGroup({group, entries, onOpen, expanded})` 返回公共卡片，按登记展示代表入口与完整列表，过滤未开放记录并计算可见数量。分类元数据与私密任务输入分离，组件不运行算法、不保存用户草稿。

## 科普阅读组成

科普是第五个正式分类 `knowledge`，沿用原四个工具领域组成 `learn-codec`／`learn-reference`／`learn-media`／`learn-other`，不另建一份工具分类表。`knowledge/articles/` 每项可见功能提供一篇规则文章，双向功能族一篇；`content.js` 校验并冻结正文、实例、逐节文献与精确 `capabilityIds`，数量与登记一致，不以组概论充当覆盖。

`mountKnowledge(main, {navigate, onArticleChange})` 返回 `{panel, activateArticle, cancel, destroy, selected}`，在同一文档挂载 `#panel-knowledge`。`activateArticle(id)` 打开稳定文章 ID，空 ID 返回主题目录；文章能力为 `learn:<id>`，链接为 `#knowledge?task=learn:<id>`。`onArticleChange` 只同步导航身份，不保存工具输入或用户阅读内容。

目录使用公共 SearchField、Toolbar、Button、Status 与 Result；按钮只显示基本功能名称，页头和正文标题不追加解释后缀、概要或分组标签。正文使用 Card、Box、DataList 与 ReferenceList 等公共组件安全呈现机制、输入／输出例子及对应原始依据。SplitView 在桌面显示目录与正文，窄屏切换并提供返回目录、焦点恢复；先选领域再显示该领域的主题筛选，避免平铺全部主题。页面 CSS 只管理组成与排布，外观和动效仍由公共组件层拥有。

关联按钮通过统一登记与 `resolveCapability` 使用真实任务和旧方向别名，工具页通过登记的 `learningIds` 显示相关科普。重复打开同一文章保持正文节点与焦点，关联载入使用修订号拒绝旧回调；`cancel()` 作废在途更新，`destroy()` 幂等释放 ResizeObserver、事件、动画及阅读引用，卸载由 `onDisconnect` 清理。文章文献通过公共 ReferenceList 在对应段落及例子旁呈现，引用不是集成依赖；真实查询工具与引擎继续保留其精确项目／数据许可，实际复制第三方文字或图像需按素材许可署名。

### Discovery composition defaults

`SearchField` owns its surface, flex layout, constrained 20px icon and full-width named input without requiring a page class. `EmptyState({size:'compact'})` supplies a 44px compact variant for collection widgets; the default variant retains the result-pane layout. `CapabilityGroup` uses canonical public metadata and an inline disclosure with an accurate visible count; retained inventory rows cannot become executable buttons. `CapabilityButton` supplies the same task control in the overview, full directory and workspace.

## 有界字节网格与资料选择

`ByteGrid({id,label,rows=32,onSelectionChange,onPageChange})` 由公共入口导出，返回组件根节点。`byteGridController(root)` 提供 `setData({length,read(offset,count)},{offset})`、`select(offset,{extend,focus,end})`、`refresh()`、`viewport`、`columns`、`selection` 与 `destroy()`。数据源只提供有界片段；最多 64 行，默认 32 行。列数按实际宽度与字号选择 16／8／4，窄容器及大字号回退到 2 列。地址和 ASCII 在窄布局中让出可编辑字节空间。

网格使用一个键盘焦点、真实 `aria-activedescendant` 和选区；方向键、Home／End、PageUp／PageDown 与 Shift 扩选由组件维护。ASCII 是只读镜像，编辑和跳转使用正常触控控件。普通按钮至少 44px；有界可视网格的密集单元属于复合图形，必须同时提供键盘、偏移和选区控件。隐藏／移动保留状态，真正销毁后释放读取闭包、观察器、数据和事件处理。

`Button({variant:'choice',attrs:{'aria-pressed':...}})` 提供多行资料选择；`Result` 的 `data-size="compact"` 适用于紧凑空态。公共颜色、选中状态和动效仍由组件样式与动效所有者维护。资料页只组合真实记录、分页和解释，不通过页面 CSS 补公共控件缺失。

## 多行记录与有界目录

`Result({layout:'collection'})` 由公共样式提供内容高度的网格行；有界目录只约束容器滚动，不压缩每条记录。`Button({layout:'stacked'})` 提供标题、摘要与标签的多行布局，保留至少 44px 点击目标。科普及 IT 资料采用同一接口，页面只设目录边界和摘要行数。新增消费者需校验长标题、200% 字号、子内容在按钮边界内及邻行不重叠。

公共侧栏的 `data-sidebar-motion` 描述动作意图：`toggle` 用于主动桌面收展，保留让位过渡；`responsive` 用于断点放置，正文与侧栏即时同步，不能以页面额外左边距修补遮挡。

## 规则文献旁注

`ReferenceList({items,label='规则依据',...options})` 使用标准来源记录 `{id,title,publisher,url,language,kind,locator}`。它显示可访问文献链接、发布机构、章节与语言，外链带 `noopener noreferrer`，拒绝脚本／数据协议、带凭据 URL 和非同源 HTTP；本地引擎记录标明资料性质，逻辑路径从当前应用资源根解析，保留子目录部署。组件只呈现来源，不自动发起外部请求，公共组件样式提供自然换行、44px 链接目标与大字号窄屏排布。

文章内容所有者先校验逐节来源绑定，渲染者以本篇 source ID 查找，不从页面临时凑外链。来源旁注不注册文档为软件依赖，不生成浏览器 Web API 或本站仓库页脚。

`DataList({items,valueFormat:'literal'})` 保留例子字节、位分组和点阵文本的换行／间隔，值使用公共等宽字体并可在窄屏换行。默认资料值布局不变，不靠知识页的 CSS 临时模拟点阵。

## 统一转换布局

`ConversionLayout` 只组合方向／参数与操作卡片、响应式输入／结果卡片及状态；`ConversionWorkbench` 使用它提供原生转换控件，CyberChef 单项任务也使用同一布局。方向用原生 Select，执行及停止在上方，结果操作留在结果卡片。页面标题和说明由共享页头持有，不在任务内重复生成。移除反向快捷按钮后，先“作为输入”、再选方向仍通过原控制器采纳实际字节及已执行参数快照；纯方向切换不得采纳结果。
