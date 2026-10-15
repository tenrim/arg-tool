const entries=`Resize Image|填写目标宽高，可选择像素或百分比；勾选保持比例时按边界缩放。像素画建议使用最近邻算法。
Rotate Image|填写旋转角度；结果保留在右侧，可继续裁剪或下载。
Crop Image|手动填写左上角坐标和区域宽高，或启用自动裁边；坐标以图片左上角为原点。
Flip Image|选择水平或垂直翻转，可用于倒写文字和镜像线索。
Contain Image|按比例缩小或放大，使整张图放进目标画布，空余部分可保留背景。
Cover Image|按比例填满目标尺寸，多余区域按对齐设置裁去。
Image Brightness / Contrast|亮度和对比度范围为 −100 至 100；0 表示不调整。
Image Hue/Saturation/Lightness|色相按角度调整，饱和度和明度按百分比调整；适合检查近似颜色线索。
Blur Image|填写模糊强度，选择快速或高斯算法。强度越大，细节越少。
Image Opacity|输入保留的不透明度百分比；100 为原始不透明度，0 为全透明。
Image Filter|选择灰度或棕褐色滤镜。
Dither Image|将连续颜色转换为抖动图案，便于观察色块结构。
Invert Image|反转颜色，用于检查负片和亮暗反转线索。
Sharpen Image|增强边缘细节；处理结果不能恢复原图中不存在的信息。
Normalise Image|自动拉伸各颜色通道的有效范围，提高整体对比。
Randomize Colour Palette|随机重新映射颜色，使原本相近的色值更容易区分；每次结果可能不同。
Convert Image Format|选择 JPEG、PNG、BMP 或 TIFF。JPEG 有损且不保留透明度；需要继续隐写分析时优先保留原图。
Add Text To Image|填写文字、字号、颜色和位置。上游自带字体主要覆盖拉丁字符，中文可能无法正确绘制。
Generate QR Code|输入需要编码的文字，选择尺寸、留白和纠错级别；可导出 PNG、SVG、EPS 或 PDF。
Generate Image|将输入的原始字节按灰度、RGB 等方式排列成图。十六进制数据先选择“十六进制输入”，再设置每行像素数。
Split Colour Channels|将图片拆成红、绿、蓝三张通道图，完成后可分别下载。
View Bit Plane|选择颜色通道与第 0–7 位，查看该位形成的黑白图。第 0 位是最低位。
Extract RGBA|逐像素输出颜色字节，可选是否包含透明度和字节分隔符。
Extract LSB|设置颜色顺序、遍历方向与第 0–7 位，提取隐藏字节。复杂多位组合继续使用“图像与隐写”标签。
Extract EXIF|读取原始图片的 EXIF 元数据。选择“当前处理视图”会重新编码为 PNG，通常不再包含原始 EXIF。
Remove EXIF|无损移除 JPEG 的 EXIF 元数据并下载；没有 EXIF 时原样返回，不会重新编码像素。仅处理 EXIF，不保证移除 XMP、IPTC 等其他元数据。
Parse QR Code|从图片读取二维码内容。残缺二维码可使用同页“二维码修复”功能。
Render Image|将原始字节、Base64 或十六进制解释为图片；输入格式需与内容一致。
Regular expression|填写正则表达式，并选择列出匹配、捕获组等输出方式；高亮模式会以纯文本展示匹配内容。
Find / Replace|填写要查找的文字或正则及替换内容；需要替换所有匹配时启用全局选项。
Sort|按所选分隔符拆分输入，再按指定顺序排序。
Unique|按分隔符拆分并去重；可将每行答案、单词或数字作为一项。
Diff|输入原文，将另一份文本填入参数，查看两者差异。
Extract Audio Metadata|读取音频原文件中的标签和内嵌文字，返回结构化数据；不会把音频转写成文字。
Extract ID3|读取 MP3 的 ID3 标签和内嵌封面信息；不支持的标签可能被忽略。
Render PDF|验证并导出 PDF 原始内容，本页不嵌入额外阅读窗口。
Play Media|选择媒体文件，或输入 Base64 / 十六进制数据，解码后使用本页播放器预览；播放格式取决于浏览器。
Unzip|ZIP 沿用本页“读取 ZIP 目录”和“解压选中条目”，避免一次展开整个压缩包。密码 ZIP 可在完整处理链中使用上游操作。
Entropy|计算字节随机程度并显示数值或图表；压缩内容也可能具有高熵，不能仅据此判断加密。
Frequency distribution|统计 0–255 字节值的出现次数，显示分布图与完整数据。
CSV to JSON|粘贴 CSV，按实际文件设置分隔符和表头选项，生成 JSON。
JSON to CSV|粘贴有效 JSON，选择需要的字段和分隔符，生成 CSV。
HTTP request|填写请求网址、方法和参数，点击执行才发送请求。受目标网站跨域限制；作为请求正文的输入会发送至目标地址。
DNS over HTTPS|填写域名与解析器，点击执行才发送 DNS 查询；需要联网。
`;
const help=Object.fromEntries(entries.trim().split('\n').map(line=>{const i=line.indexOf('|');return[line.slice(0,i),line.slice(i+1)];}));
const domainHelp={
 crypto:'按操作要求输入文字、密文或密钥文件，再填写相应参数。二进制内容可选择十六进制、Base64 或本机文件输入；结果可下载或保留原始字节继续处理。',
 encoding:'通常使用“文字 / UTF-8”输入，粘贴待转换字符串。选择输入来源中的 Base64 或十六进制会额外先解码一次，请避免重复解码。',
 language:'粘贴文字后执行，转换结果可复制或继续处理；这里不做自然语言翻译。'
};
export const guidance=(op,group,fallback)=>help[op]||`${fallback} ${domainHelp[group.panel]||group.hint+'类功能在此共用输入与结果，可调整参数后执行。'}`;
