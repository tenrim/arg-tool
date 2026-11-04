# 迷雾工具箱维护入口

先读 [开发指导](docs/DEVELOPMENT_GUIDE.md) 和 [项目现行约定](docs/PROJECT_CONTRACTS.md)，再按改动阅读专项文档。README、THIRD_PARTY 仍是运行和第三方范围入口。

- 用户最新明确要求优先；文档冲突以较新的明确决定为准，同时修正旧说法。`docs/archive/` 是历史依据，不是现行指令；版本、分支、服务与部署状态重新核实。
- 产品名统一为“迷雾工具箱”。Node.js 24+，主构建离线且不要求根目录安装运行依赖。
- 功能或逻辑修改先按 [参考编码](docs/REFERENCE_CODING.md) 查项目所有者和直接相关参考，记录固定提交、路径、行号；不自动更新参考库或修改固定上游字节。
- UI 修改先读 [UI 规则](docs/UI_DEVELOPMENT_RULES.md)、[组件接口](docs/UI_COMPONENTS.md)、[能力架构](docs/CAPABILITY_ARCHITECTURE.md)。页面只用 `public/ui/index.js`；公共外观修改 `public/ui/styles/` 后生成，动效归 `ui/motion.js`。
- 原控制器拥有输入、文件、草稿、取消和结果；输入变化和离页同步失效。笔记、脑图、白板共用原笔记事务和数据库，不增加第二套状态所有者。
- 保留完整算法、原始字节、选定资料集、来源、许可和真实任务页脚，不用样本、假结果、隐藏控件或弱化断言替代完成。
- 当前搜索默认排除科普，设置可开启；函数绘图为获准的 Desmos iframe，CyberChef 仍为本站原生控件与本地 Worker。详细产品边界以项目现行约定为准。
- 验证只按 [TESTING_POLICY.md](docs/TESTING_POLICY.md) 选择本轮实际改动及有证据的直接影响，已通过且不再受影响的检查不重跑。
- 保留无关修改、笔记和私密配置。提交标题和正文必须中文；使用用户当前 Git 身份和明确远端。提交、推送、部署分别依据用户授权，不提交凭据、私钥、账号库、临时输出或安装产物。
