# 结果联动与邮件反馈

源码版默认只提供本机报告复制／下载，不创建发送或附件入口。只有部署者在 `public/deployment.js` 配置同源 `feedbackEndpoint` 并自行部署服务后，下文的邮件发送流程才适用。前端不保存 SMTP 凭据。


## 用其他工具处理

编解码／加解密任务、基础转换、处理链、图片提取／二维码、图片原文件与当前处理视图、文件原字节和 ZIP 选中条目提供“用其他工具处理”入口。三维模型、资料查询、模拟器不强制增加入口，保留原有具名操作。

`public/handoff/model.js` 根据原始字节和来源推荐真实登记的任务；推荐说明区别“文件头符合”和“可尝试”。推荐与完整兼容列表均按主导航的大类／工具组分层，列表可搜索，双向功能直接显示实际方向；登记仍是标题、分类、路由与方向的唯一来源。`button.js` 只交付读取和有效性接口，`dialog.js` 选择目标／结果文件，`targets.js` 通过 app 注入的接口交接。没有全局结果仓库，不写入网址或偏好。保留 32 MB 上限、严格 UTF-8、真实字节、原图与重编码视图区别；不从显示预览取数。

打开菜单后来源变化会拒绝采纳；采纳前生成快照，app 独占目标激活，导航被替代则不回填。目标已有不同输入时明确确认替换。接收只载入，不自动执行。任务输入区通过 source-preview 展示上一步文本、图片或二进制十六进制预览；预览有界且只读，不能重建或修改用于计算的原始字节。切换输入来源时释放图片 URL 并移除旧预览。既有“用作当前输入”和“反向处理结果”继续由原控制器保留操作／格式归属。

各单项工具已移除“送到处理链”入口和对应控制器依赖；完整处理链保留自己的入口及配方操作。

## 报告边界

侧栏“报告问题”与错误状态旁“报告此问题”打开同一个表单。自动诊断仅含版本、任务 ID、浏览器版本、窗口大小、最多 30 条无输入值的操作标记，以及已知错误分类和本站模块位置。原始 exception message、console、参数、密钥、文件、结果和浏览历史不自动收集。未知诊断字段在服务端丢弃。

用户可查看报告，并主动选择最多 2 个／合计 4 MB 附件。只有点击发送才调用同源 `api/feedback`。复制／下载仅导出文字报告，所选附件需另行提供。邮件正文、联系人和附件都是用户主动提交的信息，不使用联系方式作为 SMTP 邮件头。

## 1Panel 部署邮件服务

网站继续作为静态站点运行；额外部署 `services/feedback` 的 Node.js 24 服务。邮件服务只负责报告，不参与工具运算，不与静态目录放在一起公开。

1. 在静态网站根目录之外放置 `services/feedback`，运行 `npm ci --omit=dev --ignore-scripts`。
2. 复制 `.env.example` 为 `.env`，配置 SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASS、REPORT_TO。QQ 邮箱使用授权码及 smtp.qq.com:465；配置只保存在服务端。`.env` 已被 Git 忽略，不随网页发布。
3. ALLOWED_ORIGINS 设置为实际网站源，如 `https://www.tool.mistarg.cn`，不带路径或结尾斜杠。多个源用逗号分隔。不能用 `*`。
4. 运行 `npm run verify-mail` 检查 TLS 与登录，这一步不发邮件。用 1Panel 的 Node 运行环境或进程管理运行 `npm start`，默认监听 127.0.0.1:6143。容器部署时按容器网络设置 HOST，并且不要将该端口直接对公网开放。
5. 在网站 OpenResty 配置中添加下面的精确接口代理。若网站位于 `/tools/` 子目录，把 location 改为 `/tools/api/feedback`，proxy_pass 仍指向 `/api/feedback`。

```nginx
location = /api/feedback {
    client_max_body_size 6m;
    proxy_pass http://127.0.0.1:6143/api/feedback;
    proxy_set_header Origin $http_origin;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_connect_timeout 5s;
    proxy_read_timeout 30s;
}
```

本机代理且 X-Real-IP 由代理覆盖时，服务设置 TRUST_PROXY=true。服务仅在直连对端为回环地址时信任此头；跨容器代理默认按直连地址限流，应调整部署网络，使可信代理与服务通过回环通信，或在代理额外配置逐 IP 限流。每来源 10 分钟最多 5 次新报告，全服务每小时最多 60 次。

服务仅向配置的固定接收邮箱发送。成功响应代表 SMTP 已接收，不保证邮件一定进入收件箱。相同报告编号在当前服务进程内去重 24 小时；明确的 SMTP 拒收允许用户手动重试；超时或状态不确定时不会再次投递，防止实际已发送却重复发信。重启会清空去重与限流记录。遇到不确定状态，可复制报告联系维护者；修改报告会生成新编号。此版本没有持久邮件队列或管理员后台，收件箱承担问题管理。

## 本地配置与检查

可用 `node services/feedback/configure.mjs <邮箱文本路径>` 导入发送邮箱、授权码和接收邮箱；只写入被忽略的 `services/feedback/.env`，不打印值。默认仅允许 localhost:16142 和 localhost:16143，生产部署需修改源。

启动邮件服务后，开发静态服务设置 FEEDBACK_URL=http://127.0.0.1:6143，执行 `node scripts/server.mjs --port 16143`。该代理只接受本机目标。没有配置服务时，网页仍可复制、下载报告。

验证归属：`tests/handoff.test.mjs`、`tests/feedback.test.mjs` 与 `scripts/browser-handoff-feedback.mjs`；其他行为按 [测试政策](TESTING_POLICY.md) 选择。后台依赖仅 Nodemailer 10.1.1（MIT-0），固定锁在服务目录，不增加前端 npm 依赖。
