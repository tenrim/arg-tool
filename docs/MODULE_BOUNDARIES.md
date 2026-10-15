# 模块边界与耦合检查

2026-10-13 检查所有第一方 public JavaScript 模块的导入、资源加载点、事件通道、全局写入及已知 DOM 桥接。机器清单见 [coupling-audit.json](coupling-audit.json)，命令为 `npm run audit:architecture -- --report docs/coupling-audit.json`。固定第三方内部代码不重写，其文件完整性仍由独立摘要审计负责。

## 职责和依赖方向

| 所有者 | 允许依赖 | 不允许承担 |
| --- | --- | --- |
| ui | 本目录组件、模板、动效 | 业务控制器、功能登记、引擎加载 |
| navigation / registry / 各 catalog | 静态分类、操作描述、科普内容与搜索 | UI、状态模型、实际运算 |
| capabilities/routes | URL 标准接口 | DOM、注册表加载、输入／结果 |
| 侧栏／搜索／总览 | 公共 UI、登记、纯路由 | 计算、素材和工具私有状态 |
| app / site-shell | 各控制器装配、导航生命周期 | 算法复本、第二套目录 |
| 各工具 UI/controller | 本工具模型、公共 UI、命名桥接 | 其他工具内部状态／任意跨工具导入 |
| 模型／算法／Worker | 纯数据、同领域模型、固定运行库 | 公共 UI、壳层、DOM 呈现 |
| bridge / workspace adapter | 经验证的当前对象、明确目标控制器 | 自动上传、模糊目标、旧异步结果回填 |

`scripts/architecture-policy.mjs` 明确登记允许的跨领域边及用途。新增边必须有真实用户流程和相应测试归属，不能用“都是共享代码”放宽整片目录。模型文件按角色判定：`round4/model.js` 是三维模型页面控制器，不是领域状态模型。

## 本轮修正

1. `navigation.js` 删除无人调用的旧顶部菜单实现及 UI 导入。现在登记、偏好和科普读取分类不会加载 UI 组件树；没有恢复已删除的菜单。
2. `capabilityRoute` 移到独立 `capabilities/routes.js`。侧栏、科普、资料联动和 app 使用同一序列化函数，不再为生成 URL 导入完整工作区控制器。
3. 编程语言与纸笔题型描述分别归到 `coderunner/catalog.js`、`round3/catalog.js`。登记只读描述，原模型导入并重新导出同一个对象以保持接口兼容。规则、求解、参数与原始 ID 不变。
4. 测试依赖拆分：默认验证不再把任何一次改动都扩展成全站生成、语法遍历和所有 Worker 回归；公共 UI 行为与具体引擎行为分别选择。

当前字面量 ESM 导入图无循环，已登记的跨领域边符合契约。这个结论不等于“运行时完全没有耦合”。

## 运行时桥接审视

新增结果交接：handoff/button 接受所属控制器的读取／有效性闭包，handoff/model 只判定数据和推荐元数据；dialog 经 targets 调用 app 注入的导航与采纳接口。没有任意 DOM 字段写入，也不让工具彼此导入。feedback/model 只接收经过白名单裁剪的诊断；feedback/ui 不读取工具输入与结果，SMTP 服务与前端独立。对应 handoff、feedback 单元及 browser-handoff-feedback 覆盖有效性、覆盖确认、隐私和失败行为。

| 通道／入口 | 责任与数据 | 相关覆盖 |
| --- | --- | --- |
| panelchange / nativetaskchange | app 发布当前页面／任务身份，控制器同步停止旧工作；不传输入 | task-lifecycle、capability-resilience |
| opencapability / capability-direction | 真实能力 ID、原始操作、显式方向 | sidebar-routing、capabilities、chef-tools |
| image / audio / file / material 事件 | 素材所有者使消费者结果失效；原始文件与当前结果分开 | round-two、chef-tools、privacy |
| reference-request/result/context | 资料控制器与共享地区上下文，用实际记录查询 | reference、discovery、task-lifecycle |
| astronomy-object | 已确认天体对象交给天文控制器，沿用时间／位置 | discovery、science、task-lifecycle |
| crystal-ready / model-bridge | 用户显式将真实 CIF 模型交给现有模型页 | reference、round-four |
| preferences / collections / search | 设置和壳层展示状态；不保存工具私有数据 | site-pages、workspace |
| qr-source / subpanelchange | 原图片／当前视图与原 QR、乐器控制器之间的显式接口 | round-one、round-two |

已检查资源加载所有者：参考、科学、基础转换、图灵机和 CyberChef 的计算地址由各自适配层处理；它们不是导航层的职责。计算出来的 URL 和 vendor 动态加载必须由所属实际 Worker 回归验证，不凭静态图宣称安全或资源正确。

## 保留的集中点和后续约束

- `app.js` 仍是较大的装配入口，并保留早期音频／文件控制代码；它广泛依赖工具是装配关系，不代表每个工具互相调用。后续新增控制逻辑应放入所属工具，不继续扩大 app。
- `round1/common.js` 已被多轮工具使用，实际是历史共享 UI／下载帮助层，不包含其他轮引擎。当前作为明确的兼容公共入口保留；不要继续塞入某个工具的私有逻辑。`round2/common.js` 的 workerJob 也有纸笔消费者，变更时必须覆盖这个已登记接口。
- 功能登记仍读入完整科普内容以同步验证覆盖；这是启动体积上的集中点。若将来拆为按需正文，应以单一内容模型生成轻量索引，不能手写另一份目录。本轮没有为了静态图漂亮而放弃内容校验。
- 多个控制器仍用 DOM ID 交接素材，例如音高到乐器、纸笔答案到提取、图片到 QR。保留实际节点与输入所有权；已有桥接的改动按两端契约验证，新联动应使用具名函数／事件，不能读写任意页面字段。
- 第一方全局赋值扫描发现的 console/print 位于代码运行的独立 Worker，用于该次运行的受限输出，不是主页面全局状态。

静态审计检查字面量导入、方向与循环；事件、资源表达式和全局写入另列清单。它不是完整 JS 解析器，也不能捕获所有运行时组合或任意 DOM 数据流。因此不能以“0 条静态违规”替代真实联动回归。

## 源码版部署配置

`public/deployment.js` 只提供部署者配置的可选同源反馈地址；`feedback/ui.js` 校验地址并决定是否创建发送及附件入口。空地址保持本机复制／下载，不发请求。具名桥接在 architecture-policy 登记，默认路径由 browser-site-pages 验证，显式启用服务由 browser-handoff-feedback 验证。
