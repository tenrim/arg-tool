// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    "id": "function-native:image",
    "capabilityIds": [
      "native:image"
    ],
    "relatedIds": [
      "native:image"
    ],
    "topicGroup": "image",
    "title": "图片预览与编辑",
    "summary": "图片文件先解码为像素阵列；屏幕上的缩放只是显示比例，像素宽高才是图像真实尺寸。",
    "aliases": [
      "像素",
      "预览",
      "分辨率"
    ],
    "sources": [
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "draw",
        "title": "drawImage：源矩形与目标矩形",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "图片预览与编辑"
      }
    ],
    "sections": [
      {
        "title": "显示尺寸、像素与编辑预览",
        "paragraphs": [
          "图片文件先解码为像素阵列；屏幕上的缩放只是显示比例，像素宽高才是图像真实尺寸。",
          "裁剪选择像素矩形，旋转改变像素位置；灰度与反色改变通道值。预览视图与原始文件是两份状态，下载当前视图才会得到处理后的图片。"
        ],
        "sourceIds": [
          "pixels",
          "draw",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "放大不会凭空恢复细节；要读隐写，应使用原图或无损结果，JPEG 再压缩可能改变低位。"
        ],
        "sourceIds": [
          "pixels",
          "draw",
          "implementation"
        ],
        "examples": [
          {
            "input": "100 × 50 像素图片，显示比例 200%",
            "output": "显示区域约为 200 × 100，原图仍有 5000 个像素",
            "explanation": "显示缩放与重新采样不是同一操作。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-steg",
    "capabilityIds": [
      "native:image-steg"
    ],
    "relatedIds": [
      "native:image-steg"
    ],
    "topicGroup": "image",
    "title": "图片隐写提取",
    "summary": "LSB 隐写把消息的比特写入像素通道的低位；将颜色值改动 1，肉眼通常不易察觉。",
    "aliases": [
      "隐写",
      "LSB",
      "最低有效位"
    ],
    "sources": [
      {"id": "aperisolve-server", "title": "AperiSolve 扫描器注册与执行实现", "publisher": "AperiSolve 项目", "url": "https://github.com/Zeecka/AperiSolve/tree/ab97840536ce82bc09dd3a3713b3864deb20eedd/aperisolve/analyzers", "language": "en", "kind": "author-spec", "locator": "registry.py、base_analyzer.py、binwalk.py"},
      {
        "id": "bits",
        "title": "按位与：提取指定二进制位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_AND",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "steg",
        "title": "StegOnline 官方说明",
        "publisher": "StegOnline 项目",
        "url": "https://stegonline.georgeom.net/",
        "language": "en",
        "kind": "author-spec",
        "locator": "位选择、通道与像素遍历"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-projects.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "StegOnline 多位隐写提取"
      }
    ],
    "sections": [
      {"title": "原图扫描与像素提取的区别", "paragraphs": ["完整扫描读取文件的全部原始字节，而不是画布重新编码的图片。检测器按文件类型及深度选项执行，各自的错误和未适用状态分别保留。", "例如 PNG 的 IEND 块后附有 ZIP 数据，图片仍可能正常显示。重新保存像素会丢失尾部 ZIP；原图字节扫描可通过文件签名与文件提取器继续检查它。发现签名不等于提取成功，仍需核对扫描报告及提取文件。", "本站提供浏览器内 LSB 提取；原始文件的服务器端扫描可通过“图像与媒体分析外站”中的 AperiSolve 介绍前往原站。两者读取的对象不同，像素提取结果不能代替文件结构扫描报告。"], "sourceIds": ["aperisolve-server"]},
      {
        "title": "颜色通道怎样保存隐藏比特",
        "paragraphs": [
          "LSB 隐写把消息的比特写入像素通道的低位；将颜色值改动 1，肉眼通常不易察觉。",
          "读取时必须知道通道顺序、所选位和像素遍历方向。先提取各位置的 0/1，再按 8 位拼成字节；改变任一顺序会得到不同消息。"
        ],
        "sourceIds": [
          "bits",
          "steg",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "有噪点不代表一定存在隐写；有损图片、缩放、调色都会破坏原始比特。"
        ],
        "sourceIds": [
          "bits",
          "steg",
          "implementation"
        ],
        "examples": [
          {
            "input": "8 个 R 通道低位：0 1 0 0 0 0 0 1",
            "output": "01000001₂ = 0x41 = ASCII A",
            "explanation": "例子采用从左到右的 8 位字节顺序，不能直接套用到未知格式。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-qr",
    "capabilityIds": [
      "native:image-qr"
    ],
    "relatedIds": [
      "native:image-qr"
    ],
    "topicGroup": "image",
    "title": "二维码识别与修复",
    "summary": "QR 码由黑白模块排列数据，三角位置上的定位图案帮助读码器判断方向与网格。",
    "aliases": [
      "QR",
      "二维码",
      "纠错"
    ],
    "sources": [
      {
        "id": "qr",
        "title": "什么是 QR 码",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/index.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定位图案、读取与数据容量"
      },
      {
        "id": "qr-ec",
        "title": "QR 码纠错功能",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/error_correction.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "纠错等级与复原能力"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "二维码识别与修复"
      }
    ],
    "sections": [
      {
        "title": "定位、阈值与纠错的作用",
        "paragraphs": [
          "QR 码由黑白模块排列数据，三角位置上的定位图案帮助读码器判断方向与网格。",
          "图像修复先保留边缘与安静区，再尝试灰度、二值化或反色，读码器重新定位模块并校验。纠错是利用冗余码字恢复受损数据，而不是猜出任意缺失内容。"
        ],
        "sourceIds": [
          "qr",
          "qr-ec",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "L、M、Q、H 常见纠错等级约可恢复 7%、15%、25%、30% 的码字损坏；定位区域严重损坏仍可能无法识别。"
        ],
        "sourceIds": [
          "qr",
          "qr-ec",
          "implementation"
        ],
        "examples": [
          {
            "input": "同一 QR 图片，一份保留白边，一份紧贴黑色背景裁切",
            "output": "保留安静区的版本更符合读码器定位条件",
            "explanation": "二维码四周应保留空白模块；修复应先检查布局再增加锐化。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-compare",
    "capabilityIds": [
      "native:image-compare"
    ],
    "relatedIds": [
      "native:image-compare"
    ],
    "topicGroup": "image",
    "title": "图片比较与差值",
    "summary": "对齐的两张图片可以逐个比较同坐标像素，差值图记录各通道变化的大小。",
    "aliases": [
      "差分",
      "像素差值",
      "diff"
    ],
    "sources": [
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "图片比较与差值"
      }
    ],
    "sections": [
      {
        "title": "逐像素差值怎样显出改动",
        "paragraphs": [
          "对齐的两张图片可以逐个比较同坐标像素，差值图记录各通道变化的大小。",
          "绝对差值为 |A−B|；相同像素变成零，不同像素出现亮点。尺寸或位置不一致时，先对齐再解释差值。"
        ],
        "sourceIds": [
          "pixels",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "JPEG 重新压缩、色彩空间转换或微小平移也会产生大片差异，差值不等于隐藏消息。"
        ],
        "sourceIds": [
          "pixels",
          "implementation"
        ],
        "examples": [
          {
            "input": "A 的 R=100，B 的 R=104",
            "output": "R 通道绝对差值 = 4",
            "explanation": "若放大差值 20 倍用于显示，会看到值 80；这只是可视化放大。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20EXIF",
    "capabilityIds": [
      "op:Extract%20EXIF"
    ],
    "relatedIds": [
      "op:Extract%20EXIF"
    ],
    "topicGroup": "image",
    "title": "提取 EXIF 元数据",
    "summary": "EXIF 是图像内的结构化标签，可记载拍摄设备、曝光时间、方向或 GPS，标签不属于可见像素。",
    "aliases": [
      "EXIF",
      "IFD",
      "元数据"
    ],
    "sources": [
      {
        "id": "exif",
        "title": "Exif 标准",
        "publisher": "CIPA / JEITA",
        "url": "https://www.cipa.jp/e/std/std-sec.html",
        "language": "en",
        "kind": "standard",
        "locator": "CIPA DC-008：标签与图像文件结构"
      },
      {
        "id": "meta",
        "title": "WIC 元数据概述",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/windows/win32/wic/-wic-about-metadata",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "支持的元数据格式与元数据块"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract EXIF"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract EXIF"
      }
    ],
    "sections": [
      {
        "title": "相机标签与像素数据的区别",
        "paragraphs": [
          "EXIF 是图像内的结构化标签，可记载拍摄设备、曝光时间、方向或 GPS，标签不属于可见像素。",
          "读取器定位 EXIF 容器，沿 IFD 标签目录提取编号、类型与值；一个值是否出现取决于拍摄和编辑过程是否写入该标签。"
        ],
        "sourceIds": [
          "exif",
          "meta",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "EXIF 可以修改或删除，时间及位置不是天然可信证据；无标签也不代表文件损坏。"
        ],
        "sourceIds": [
          "exif",
          "meta",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "EXIF Orientation = 6",
            "output": "通常提示按顺时针 90° 方向显示图像",
            "explanation": "方向标签描述显示朝向，文件存储的像素顺序可能仍未旋转。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-barcode",
    "capabilityIds": [
      "native:image-barcode"
    ],
    "relatedIds": [
      "native:image-barcode"
    ],
    "topicGroup": "image",
    "title": "二维码与条形码识别",
    "summary": "一维条码用条和空的宽度模式编码，QR 则在二维模块中同时承载数据与纠错信息。",
    "aliases": [
      "条形码",
      "条码",
      "二维码"
    ],
    "sources": [
      {
        "id": "qr",
        "title": "什么是 QR 码",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/index.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定位图案、读取与数据容量"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "二维码与条形码识别"
      }
    ],
    "sections": [
      {
        "title": "一维条码与二维矩阵怎样读",
        "paragraphs": [
          "一维条码用条和空的宽度模式编码，QR 则在二维模块中同时承载数据与纠错信息。",
          "识别器先确定码制，再读取宽度或模块模式并验证校验信息。条码旁的人类可读数字便于核对，但通常不是识别依据。"
        ],
        "sourceIds": [
          "qr",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "读到文本不等于必须打开网址；识别会返回载荷，码制与读码清晰度决定能否成功。"
        ],
        "sourceIds": [
          "qr",
          "implementation"
        ],
        "examples": [
          {
            "input": "QR 载荷是文本 ARG",
            "output": "读码结果 ARG",
            "explanation": "结果应按文本理解；二维码外观与实际载荷是不同层次。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-stereo",
    "capabilityIds": [
      "native:image-stereo"
    ],
    "relatedIds": [
      "native:image-stereo"
    ],
    "topicGroup": "image",
    "title": "立体图隐藏轮廓",
    "summary": "随机点立体图用纹理间的水平位移编码深度，双眼对重复图案建立对应后感知轮廓。",
    "aliases": [
      "Magic Eye",
      "立体图",
      "视差"
    ],
    "sources": [
      {
        "id": "stereo",
        "title": "双眼立体视觉可塑性的实验研究",
        "publisher": "中国科学院心理研究所 · 心理学报",
        "url": "https://journal.psych.ac.cn/xlxb/CN/Y1992/V24/I2/32",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "随机点立体图对与双眼视差"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "立体图隐藏轮廓"
      }
    ],
    "sections": [
      {
        "title": "重复纹理与水平视差",
        "paragraphs": [
          "随机点立体图用纹理间的水平位移编码深度，双眼对重复图案建立对应后感知轮廓。",
          "本工具比较原图与水平移位后的图像，找出重复纹理的相似和差异。调整移位可以显出部分结构，但不是完整三维重建。"
        ],
        "sourceIds": [
          "stereo",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "重复周期和局部深度位移会不同；单个偏移得到的轮廓需结合附近偏移检查。"
        ],
        "sourceIds": [
          "stereo",
          "implementation"
        ],
        "examples": [
          {
            "input": "重复纹理间距 80 像素，局部间距 75 像素",
            "output": "局部相对重复周期偏移 −5 像素",
            "explanation": "差异位置可能对应深度轮廓，方向取决于图像的立体生成约定。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-exif",
    "capabilityIds": [
      "native:image-exif"
    ],
    "relatedIds": [
      "native:image-exif"
    ],
    "topicGroup": "image",
    "title": "图片 EXIF / XMP / IPTC 信息",
    "summary": "EXIF、XMP 和 IPTC 是不同的元数据结构，可以同时存在于同一图片中。EXIF 常用二进制标签，XMP 通常以 XML/RDF 表达属性。",
    "aliases": [
      "XMP",
      "IPTC",
      "EXIF"
    ],
    "sources": [
      {
        "id": "meta",
        "title": "WIC 元数据概述",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/windows/win32/wic/-wic-about-metadata",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "支持的元数据格式与元数据块"
      },
      {
        "id": "exif",
        "title": "Exif 标准",
        "publisher": "CIPA / JEITA",
        "url": "https://www.cipa.jp/e/std/std-sec.html",
        "language": "en",
        "kind": "standard",
        "locator": "CIPA DC-008：标签与图像文件结构"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-inspect.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "图片 EXIF / XMP / IPTC 信息"
      }
    ],
    "sections": [
      {
        "title": "EXIF、XMP、IPTC 分别在哪里",
        "paragraphs": [
          "EXIF、XMP 和 IPTC 是不同的元数据结构，可以同时存在于同一图片中。EXIF 常用二进制标签，XMP 通常以 XML/RDF 表达属性。",
          "逐容器查看字段而非只搜可见文字；图像工具可能保留一种元数据却删除另一种，因此相同含义的字段也可能互相矛盾。"
        ],
        "sourceIds": [
          "meta",
          "exif",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "没有某个容器就不会出现相应字段；不要把某个解析器没有显示的项目当作已彻底移除。"
        ],
        "sourceIds": [
          "meta",
          "exif",
          "implementation"
        ],
        "examples": [
          {
            "input": "EXIF 有拍摄时间，XMP 有作者",
            "output": "两个容器分别显示各自的属性",
            "explanation": "容器是资料结构，不是两份图片。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-planes",
    "capabilityIds": [
      "native:image-planes"
    ],
    "relatedIds": [
      "native:image-planes"
    ],
    "topicGroup": "image",
    "title": "位平面与图层浏览",
    "summary": "8 位通道的值可写成 b7×128＋…＋b1×2＋b0，每一位单独组成一张位平面。",
    "aliases": [
      "位平面",
      "bit plane"
    ],
    "sources": [
      {
        "id": "bits",
        "title": "按位与：提取指定二进制位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_AND",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "image-data",
        "title": "ImageData：像素数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "data、width、height"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-inspect.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "位平面与图层浏览"
      }
    ],
    "sections": [
      {
        "title": "把一个颜色字节拆成八张位图",
        "paragraphs": [
          "8 位通道的值可写成 b7×128＋…＋b1×2＋b0，每一位单独组成一张位平面。",
          "选择 R、G、B 或 A 及位编号后，用 (value >> bit) & 1 提取。高位通常承载明显亮暗结构，低位更容易出现细小噪声或隐写。"
        ],
        "sourceIds": [
          "bits",
          "image-data",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "各工具可能将 1 渲染成白或黑；比较时应先核对显示约定，而不是根据反色判断消息不同。"
        ],
        "sourceIds": [
          "bits",
          "image-data",
          "implementation"
        ],
        "examples": [
          {
            "input": "R = 170 = 10101010₂",
            "output": "R 的第 0 位为 0，第 1 位为 1",
            "explanation": "第 0 位的权重是 1，第 7 位的权重是 128。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-color",
    "capabilityIds": [
      "native:image-color"
    ],
    "relatedIds": [
      "native:image-color"
    ],
    "topicGroup": "image",
    "title": "像素取色与色值",
    "summary": "RGBA 分别记录红、绿、蓝与不透明度；常见 8 位分量范围是 0～255。",
    "aliases": [
      "取色",
      "RGBA",
      "色值"
    ],
    "sources": [
      {
        "id": "color",
        "title": "CSS 颜色值",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RGB、十六进制与 HSL"
      },
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-inspect.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "像素取色与色值"
      }
    ],
    "sections": [
      {
        "title": "RGBA 值如何对应一个像素",
        "paragraphs": [
          "RGBA 分别记录红、绿、蓝与不透明度；常见 8 位分量范围是 0～255。",
          "坐标先定位真实图片像素，再读取四个连续分量。十六进制颜色每两位表示一个通道；屏幕显示可能还受颜色配置和缩放影响。"
        ],
        "sourceIds": [
          "color",
          "pixels",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "完全透明像素仍可带有 RGB 值，肉眼看不到不代表其中的颜色数据为零。"
        ],
        "sourceIds": [
          "color",
          "pixels",
          "implementation"
        ],
        "examples": [
          {
            "input": "像素 RGBA = (255, 128, 0, 255)",
            "output": "#FF8000，完全不透明",
            "explanation": "FF=255、80=128、00=0；不透明度 255/255=1。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:image-png",
    "capabilityIds": [
      "native:image-png"
    ],
    "relatedIds": [
      "native:image-png"
    ],
    "topicGroup": "image",
    "title": "PNG 数据块检查",
    "summary": "PNG 以固定的八字节签名开头，之后由长度、四字符类型、内容与 CRC 构成的数据块连接。",
    "aliases": [
      "PNG",
      "IDAT",
      "IHDR"
    ],
    "sources": [
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/image-inspect.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "PNG 数据块检查"
      }
    ],
    "sections": [
      {
        "title": "签名、数据块与 CRC",
        "paragraphs": [
          "PNG 以固定的八字节签名开头，之后由长度、四字符类型、内容与 CRC 构成的数据块连接。",
          "IHDR 给出宽高和像素类型，IDAT 合起来保存压缩图像数据，IEND 标记结束。CRC 校验块类型和内容，不包含长度字段。"
        ],
        "sourceIds": [
          "png",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "CRC 正确只说明块内容与所附校验一致，不保证图片可信；IEND 之后的额外字节需另行查看。"
        ],
        "sourceIds": [
          "png",
          "implementation"
        ],
        "examples": [
          {
            "input": "89 50 4E 47 0D 0A 1A 0A",
            "output": "PNG 文件签名",
            "explanation": "识别签名只是第一步，还需检查 IHDR 和完整块结构。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Crop%20Image",
    "capabilityIds": [
      "op:Crop%20Image"
    ],
    "relatedIds": [
      "op:Crop%20Image"
    ],
    "topicGroup": "image",
    "title": "裁剪图片",
    "summary": "裁剪只保留左上坐标和宽高确定的矩形区域，输出中的像素坐标从新的左上角开始。",
    "aliases": [
      "裁剪",
      "crop"
    ],
    "sources": [
      {
        "id": "draw",
        "title": "drawImage：源矩形与目标矩形",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Crop Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Crop Image"
      }
    ],
    "sections": [
      {
        "title": "从源图选取一个坐标矩形",
        "paragraphs": [
          "裁剪只保留左上坐标和宽高确定的矩形区域，输出中的像素坐标从新的左上角开始。",
          "原图像素 (x,y) 进入裁剪结果后变为 (x−left,y−top)。先核对源图真实尺寸，再设置裁剪边界。"
        ],
        "sourceIds": [
          "draw",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "裁剪不等于缩放；越界、零宽或零高矩形不能得到期望图片。"
        ],
        "sourceIds": [
          "draw",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原图 100 × 80；裁剪 left=20，top=10，width=30，height=40",
            "output": "输出 30 × 40；原图 (25,15) 成为 (5,5)",
            "explanation": "只改变所保留的区域。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:View%20Bit%20Plane",
    "capabilityIds": [
      "op:View%20Bit%20Plane"
    ],
    "relatedIds": [
      "op:View%20Bit%20Plane"
    ],
    "topicGroup": "image",
    "title": "查看位平面",
    "summary": "位平面显示每个像素指定通道的一个二进制位，0～7 对应从最低位到最高位。",
    "aliases": [
      "bit plane",
      "位平面"
    ],
    "sources": [
      {
        "id": "bits",
        "title": "按位与：提取指定二进制位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_AND",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "View Bit Plane"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "View Bit Plane"
      }
    ],
    "sections": [
      {
        "title": "一个颜色分量的某一位",
        "paragraphs": [
          "位平面显示每个像素指定通道的一个二进制位，0～7 对应从最低位到最高位。",
          "本 CyberChef 操作把提取值为 1 的位置画成黑色、为 0 的位置画成白色，其余颜色信息丢弃。"
        ],
        "sourceIds": [
          "bits",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "这项操作返回可视化图片，不是将这些位直接拼接为文件；提取隐藏字节应使用 Extract LSB。"
        ],
        "sourceIds": [
          "bits",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "R = 3 = 00000011₂，Bit=0",
            "output": "该像素显示为黑色",
            "explanation": "最低位为 1；这里黑白约定由本操作实现确定。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Resize%20Image",
    "capabilityIds": [
      "op:Resize%20Image"
    ],
    "relatedIds": [
      "op:Resize%20Image"
    ],
    "topicGroup": "image",
    "title": "调整图片尺寸",
    "summary": "调整尺寸按目标宽高重新采样像素。放大会增加像素数，但新增像素来自已有样本的插值。",
    "aliases": [
      "resize",
      "重采样"
    ],
    "sources": [
      {
        "id": "draw",
        "title": "drawImage：源矩形与目标矩形",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Resize Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Resize Image"
      }
    ],
    "sections": [
      {
        "title": "尺寸改变为什么需要重采样",
        "paragraphs": [
          "调整尺寸按目标宽高重新采样像素。放大会增加像素数，但新增像素来自已有样本的插值。",
          "最近邻复制附近像素，平滑插值会混合邻近值。对像素字体或码图的分析应注意所选重采样模式。"
        ],
        "sourceIds": [
          "draw",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "缩小可能丢失细线，平滑可能改变低位；需要无损字节分析时不要先调整尺寸。"
        ],
        "sourceIds": [
          "draw",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "10 × 10 放大成 20 × 20",
            "output": "像素数由 100 变成 400",
            "explanation": "原始可用信息仍只有最初 100 个样本。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Flip%20Image",
    "capabilityIds": [
      "op:Flip%20Image"
    ],
    "relatedIds": [
      "op:Flip%20Image"
    ],
    "topicGroup": "image",
    "title": "翻转图片",
    "summary": "水平翻转交换左右，垂直翻转交换上下；色值本身不变，只改变像素位置。",
    "aliases": [
      "镜像",
      "flip"
    ],
    "sources": [
      {
        "id": "scale",
        "title": "scale：缩放与翻转",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/scale",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Flip Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Flip Image"
      }
    ],
    "sections": [
      {
        "title": "镜像怎样改变坐标",
        "paragraphs": [
          "水平翻转交换左右，垂直翻转交换上下；色值本身不变，只改变像素位置。",
          "宽为 W 的图片水平翻转将 x 映射为 W−1−x，高为 H 时垂直翻转将 y 映射为 H−1−y。"
        ],
        "sourceIds": [
          "scale",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "翻转和旋转不同；水平和垂直都翻转等价于旋转 180°。"
        ],
        "sourceIds": [
          "scale",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "宽 W=4，原坐标 x=0",
            "output": "翻转后 x=3",
            "explanation": "4−1−0=3。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Split%20Colour%20Channels",
    "capabilityIds": [
      "op:Split%20Colour%20Channels"
    ],
    "relatedIds": [
      "op:Split%20Colour%20Channels"
    ],
    "topicGroup": "image",
    "title": "分离颜色通道",
    "summary": "彩色像素是通道分量的组合；分离通道让每种分量的空间变化单独可见。",
    "aliases": [
      "颜色通道",
      "RGB"
    ],
    "sources": [
      {
        "id": "image-data",
        "title": "ImageData：像素数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "data、width、height"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Split Colour Channels"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Split Colour Channels"
      }
    ],
    "sections": [
      {
        "title": "红、绿、蓝信息如何分离",
        "paragraphs": [
          "彩色像素是通道分量的组合；分离通道让每种分量的空间变化单独可见。",
          "选取一个通道形成独立视图，可找到只在某种颜色里出现的笔画。通道分离保留该分量的强度，而位平面只保留一位。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "通道图上的亮暗并不是原图灰度；A 通道代表不透明度而不是第四种颜色。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "像素 RGB=(200,50,10)",
            "output": "R 分量 200，G 分量 50，B 分量 10",
            "explanation": "分量视图可以按灰度或相应色彩显示，数值含义相同。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20colour%20code",
    "capabilityIds": [
      "op:Parse%20colour%20code"
    ],
    "relatedIds": [
      "op:Parse%20colour%20code"
    ],
    "topicGroup": "image",
    "title": "解析颜色代码",
    "summary": "颜色代码可以是 #RRGGBB、RGB 或 HSL 等表示，同一颜色可以有多种等价写法。",
    "aliases": [
      "颜色转换",
      "HEX",
      "HSL"
    ],
    "sources": [
      {
        "id": "color",
        "title": "CSS 颜色值",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RGB、十六进制与 HSL"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse colour code"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse colour code"
      }
    ],
    "sections": [
      {
        "title": "颜色文本怎样变成通道数值",
        "paragraphs": [
          "颜色代码可以是 #RRGGBB、RGB 或 HSL 等表示，同一颜色可以有多种等价写法。",
          "十六进制每两位转换为一个 0～255 分量；三位短写将每位重复。HSL 则先按色相、饱和度和明度计算 RGB。"
        ],
        "sourceIds": [
          "color",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "格式和不透明度约定必须明确；#RGB 短写不是每位直接转成 0～15 的通道值。"
        ],
        "sourceIds": [
          "color",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "#0F8",
            "output": "#00FF88 = RGB(0,255,136)",
            "explanation": "0→00、F→FF、8→88。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20QR%20Code",
    "capabilityIds": [
      "op:Generate%20QR%20Code"
    ],
    "relatedIds": [
      "op:Generate%20QR%20Code"
    ],
    "topicGroup": "image",
    "title": "生成二维码",
    "summary": "QR 编码器选择数字、字母数字或字节模式，再按版本容量编码载荷并增加纠错码字。",
    "aliases": [
      "二维码生成",
      "QR"
    ],
    "sources": [
      {
        "id": "qr-create",
        "title": "生成 QR 码",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/howto/generate.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "选择版本、纠错等级与显示条件"
      },
      {
        "id": "qr-version",
        "title": "QR码的信息量和版本",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/version.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "版本1的21×21码元与每版递增4"
      },
      {
        "id": "qr",
        "title": "什么是 QR 码",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/index.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定位图案、读取与数据容量"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate QR Code"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate QR Code"
      }
    ],
    "sections": [
      {
        "title": "载荷如何变成模块阵列",
        "paragraphs": [
          "QR 编码器选择数字、字母数字或字节模式，再按版本容量编码载荷并增加纠错码字。",
          "载荷和纠错等级决定需要的网格大小。模块上再加定位图案、时序结构和掩码，帮助读码器读取。"
        ],
        "sourceIds": [
          "qr-create",
          "qr-version",
          "qr",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "更高纠错会占用容量；不要为了小图把模块缩到难以分辨或删去安静区。"
        ],
        "sourceIds": [
          "qr-create",
          "qr-version",
          "qr",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "QR 版本 1",
            "output": "数据网格 21 × 21 个模块",
            "explanation": "普通 QR 版本每增加 1，边长增加 4 个模块；白边另计。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20Image",
    "capabilityIds": [
      "op:Generate%20Image"
    ],
    "relatedIds": [
      "op:Generate%20Image"
    ],
    "topicGroup": "image",
    "title": "生成图片",
    "summary": "原始字节本身没有宽高；生成图片需要指定每个像素使用的分量数量、每行像素数和显示放大比例。",
    "aliases": [
      "字节图像",
      "raw pixels"
    ],
    "sources": [
      {
        "id": "image-data",
        "title": "ImageData：像素数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "data、width、height"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate Image"
      }
    ],
    "sections": [
      {
        "title": "把原始字节按像素排列",
        "paragraphs": [
          "原始字节本身没有宽高；生成图片需要指定每个像素使用的分量数量、每行像素数和显示放大比例。",
          "灰度模式一字节一像素，RGB 每三字节一像素，RGBA 每四字节一像素；按行从左到右排列。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "更换每行宽度会改变图案排布，不能据此认定一种排布是唯一真实含义。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "RGB 模式；FF 00 00 00 FF 00；每行 2 像素",
            "output": "一行：红色像素、绿色像素",
            "explanation": "前 3 字节是红，后 3 字节是绿。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20QR%20Code",
    "capabilityIds": [
      "op:Parse%20QR%20Code"
    ],
    "relatedIds": [
      "op:Parse%20QR%20Code"
    ],
    "topicGroup": "image",
    "title": "识别二维码",
    "summary": "二维码识别定位三个探测图案，估计模块网格，再读取格式、数据与纠错码字。",
    "aliases": [
      "二维码识别",
      "QR decode"
    ],
    "sources": [
      {
        "id": "qr",
        "title": "什么是 QR 码",
        "publisher": "DENSO WAVE",
        "url": "https://www.qrcode.com/zh/about/index.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定位图案、读取与数据容量"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse QR Code"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse QR Code"
      }
    ],
    "sections": [
      {
        "title": "模块阵列如何还原载荷",
        "paragraphs": [
          "二维码识别定位三个探测图案，估计模块网格，再读取格式、数据与纠错码字。",
          "正确码制和清晰图像让解析器按相应模式恢复字节或字符；输入是图片文件，输出是码中实际载荷。"
        ],
        "sourceIds": [
          "qr",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "二维码不是加密；外观复杂不会阻止正常读码器读取，也不会证明网址安全。"
        ],
        "sourceIds": [
          "qr",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "二维码实际编码文本 HELLO",
            "output": "输出 HELLO",
            "explanation": "输出是载荷文字，图片里的装饰标题不属于编码数据。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Randomize%20Colour%20Palette",
    "capabilityIds": [
      "op:Randomize%20Colour%20Palette"
    ],
    "relatedIds": [
      "op:Randomize%20Colour%20Palette"
    ],
    "topicGroup": "image",
    "title": "随机重映射调色板",
    "summary": "随机重映射为每种原 RGB 颜色指定一个新的颜色，同样的原色会被映射到同样的新色。",
    "aliases": [
      "调色板",
      "重映射"
    ],
    "sources": [
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Randomize Colour Palette"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Randomize Colour Palette"
      }
    ],
    "sections": [
      {
        "title": "一致重映射怎样放大色差",
        "paragraphs": [
          "随机重映射为每种原 RGB 颜色指定一个新的颜色，同样的原色会被映射到同样的新色。",
          "本操作以种子与 RGB 组合生成映射，微小色差可能因此变成明显反差，有利于观察近似同色的图案。"
        ],
        "sourceIds": [
          "pixels",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它改变视觉颜色而不恢复隐藏文本；使用相同种子可复现映射，原图应另外保存。"
        ],
        "sourceIds": [
          "pixels",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原图两片区域为 RGB(100,100,100) 与 RGB(101,100,100)",
            "output": "两种原色会分别获得新的显示颜色",
            "explanation": "映射由完整 RGB 值区分，所以相差 1 也可能产生大色差。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Cover%20Image",
    "capabilityIds": [
      "op:Cover%20Image"
    ],
    "relatedIds": [
      "op:Cover%20Image"
    ],
    "topicGroup": "image",
    "title": "缩放图片以填满画布",
    "summary": "Cover 选择足够大的缩放倍数，让图片覆盖目标框的整个宽和高，再裁掉超过框的部分。",
    "aliases": [
      "cover",
      "填满"
    ],
    "sources": [
      {
        "id": "fit",
        "title": "object-fit：contain 与 cover",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/object-fit",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "取值"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Cover Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Cover Image"
      }
    ],
    "sections": [
      {
        "title": "保持比例填满并裁掉溢出",
        "paragraphs": [
          "Cover 选择足够大的缩放倍数，让图片覆盖目标框的整个宽和高，再裁掉超过框的部分。",
          "缩放倍数为 max(目标宽/原宽,目标高/原高)，裁剪位置由对齐参数决定。"
        ],
        "sourceIds": [
          "fit",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "结果没有留边，但可能丢失图片边缘；保留整图应改用 Contain。"
        ],
        "sourceIds": [
          "fit",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原图 200 × 100；目标 100 × 100",
            "output": "先缩放成 200 × 100，再裁掉左右总计 100 像素",
            "explanation": "比例 max(0.5,1)=1；中间对齐时两侧各裁 50。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Contain%20Image",
    "capabilityIds": [
      "op:Contain%20Image"
    ],
    "relatedIds": [
      "op:Contain%20Image"
    ],
    "topicGroup": "image",
    "title": "缩放图片以完整容纳",
    "summary": "Contain 选择较小的缩放倍数，让整张图片装进目标框，未覆盖区域留边。",
    "aliases": [
      "contain",
      "完整容纳"
    ],
    "sources": [
      {
        "id": "fit",
        "title": "object-fit：contain 与 cover",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/object-fit",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "取值"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Contain Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Contain Image"
      }
    ],
    "sections": [
      {
        "title": "保持比例容纳完整图片",
        "paragraphs": [
          "Contain 选择较小的缩放倍数，让整张图片装进目标框，未覆盖区域留边。",
          "缩放倍数为 min(目标宽/原宽,目标高/原高)；输出图片的位置由对齐设置决定。"
        ],
        "sourceIds": [
          "fit",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它保留全部画面但可能增加边缘背景，二维码分析要区分新增边缘与原有安静区。"
        ],
        "sourceIds": [
          "fit",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原图 200 × 100；目标 100 × 100",
            "output": "原图缩为 100 × 50；上下剩余总计 50 像素",
            "explanation": "比例 min(0.5,1)=0.5。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20RGBA",
    "capabilityIds": [
      "op:Extract%20RGBA"
    ],
    "relatedIds": [
      "op:Extract%20RGBA"
    ],
    "topicGroup": "image",
    "title": "提取 RGBA 像素",
    "summary": "RGBA 提取把解码后的像素通道值列成文本，每个像素依次为 R、G、B、A，从左到右再从上到下排列。",
    "aliases": [
      "RGBA",
      "像素字节"
    ],
    "sources": [
      {
        "id": "image-data",
        "title": "ImageData：像素数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "data、width、height"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract RGBA"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract RGBA"
      }
    ],
    "sections": [
      {
        "title": "图片解码后通道值的排列",
        "paragraphs": [
          "RGBA 提取把解码后的像素通道值列成文本，每个像素依次为 R、G、B、A，从左到右再从上到下排列。",
          "默认按分隔符输出十进制数；包含 Alpha 时有 4×W×H 个分量，关闭 Alpha 则每像素三个。文件压缩字节与这些解码值不同。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "JPEG 文件字节不能直接当 RGBA；提取器必须先正确解码图片。"
        ],
        "sourceIds": [
          "image-data",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "两个像素：红色和蓝色，均不透明；逗号分隔并包含 Alpha",
            "output": "255,0,0,255,0,0,255,255",
            "explanation": "每四个十进制分量为一个像素；A=255 表示完全不透明。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20LSB",
    "capabilityIds": [
      "op:Extract%20LSB"
    ],
    "relatedIds": [
      "op:Extract%20LSB"
    ],
    "topicGroup": "image",
    "title": "提取最低有效位",
    "summary": "LSB 提取读取每个像素指定颜色分量的某一位，按照设置的通道与像素顺序组成比特流。",
    "aliases": [
      "LSB",
      "隐写提取"
    ],
    "sources": [
      {
        "id": "bits",
        "title": "按位与：提取指定二进制位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_AND",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract LSB"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract LSB"
      }
    ],
    "sections": [
      {
        "title": "按通道顺序拼接低位数据",
        "paragraphs": [
          "LSB 提取读取每个像素指定颜色分量的某一位，按照设置的通道与像素顺序组成比特流。",
          "通常先从 Bit=0 和按行顺序检查，再将每 8 位拼成字节；一个 RGB 像素取三个通道就贡献三位。"
        ],
        "sourceIds": [
          "bits",
          "pixels",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "位、通道顺序或扫描方式不符会得到乱码；只有提取结果符合文本或文件结构才有进一步证据。"
        ],
        "sourceIds": [
          "bits",
          "pixels",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Row；R 通道；Bit=0；八像素低位 01000001",
            "output": "字节 41（十六进制），ASCII A",
            "explanation": "这是按行读取的完整 8 位示例。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Add%20Text%20To%20Image",
    "capabilityIds": [
      "op:Add%20Text%20To%20Image"
    ],
    "relatedIds": [
      "op:Add%20Text%20To%20Image"
    ],
    "topicGroup": "image",
    "title": "添加图片文字",
    "summary": "把文字绘到图片上需要字体、字号、位置与布局；绘制后文字成为像素，不再是独立文本对象。",
    "aliases": [
      "图片文字",
      "水印"
    ],
    "sources": [
      {
        "id": "text",
        "title": "fillText：字体与文本坐标",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/fillText",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Add Text To Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Add Text To Image"
      }
    ],
    "sections": [
      {
        "title": "文字怎样成为图片像素",
        "paragraphs": [
          "把文字绘到图片上需要字体、字号、位置与布局；绘制后文字成为像素，不再是独立文本对象。",
          "字体决定字形，横向对齐与基线决定文字相对于位置点怎样排列。工具按设置把字形覆盖或混合到原像素上。"
        ],
        "sourceIds": [
          "text",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "字体缺字、换行或超出边界可能改变结果；下载图片不能恢复可编辑的文字层。"
        ],
        "sourceIds": [
          "text",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "图片宽 200；水平居中放置标题 ARG",
            "output": "文字中心对齐图片中线 x=100",
            "explanation": "居中参考的是排版点，实际字形宽度由字体和字号决定。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Image%20Opacity",
    "capabilityIds": [
      "op:Image%20Opacity"
    ],
    "relatedIds": [
      "op:Image%20Opacity"
    ],
    "topicGroup": "image",
    "title": "图片不透明度",
    "summary": "不透明度控制像素与背景混合的比例；1 完全不透明，0 完全透明。",
    "aliases": [
      "透明度",
      "alpha"
    ],
    "sources": [
      {
        "id": "alpha",
        "title": "globalAlpha：不透明度",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/globalAlpha",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Opacity"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Opacity"
      }
    ],
    "sections": [
      {
        "title": "透明程度如何影响合成",
        "paragraphs": [
          "不透明度控制像素与背景混合的比例；1 完全不透明，0 完全透明。",
          "本操作参数用百分数：50 表示 α=0.5。它将原 Alpha 乘这一比例；显示时再与背景合成，结果还受颜色空间影响。"
        ],
        "sourceIds": [
          "alpha",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "JPEG 不能保存透明通道；要保留透明结果应使用支持 Alpha 的格式。"
        ],
        "sourceIds": [
          "alpha",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原像素 A=200；本工具 Opacity=50",
            "output": "新 A≈100",
            "explanation": "RGB 可以保留，显示色会随背景改变。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Dither%20Image",
    "capabilityIds": [
      "op:Dither%20Image"
    ],
    "relatedIds": [
      "op:Dither%20Image"
    ],
    "topicGroup": "image",
    "title": "图片抖动处理",
    "summary": "抖动在可用颜色或亮度级数有限时，用空间上不同点的排列近似中间值。",
    "aliases": [
      "dither",
      "抖动",
      "量化"
    ],
    "sources": [
      {
        "id": "jimp",
        "title": "Jimp 图像处理 API",
        "publisher": "Jimp 项目",
        "url": "https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/",
        "language": "en",
        "kind": "author-spec",
        "locator": "normalize、dither、blur、convolute、color"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Dither Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Dither Image"
      }
    ],
    "sections": [
      {
        "title": "用点阵分布近似中间颜色",
        "paragraphs": [
          "抖动在可用颜色或亮度级数有限时，用空间上不同点的排列近似中间值。",
          "有序抖动使用重复阈值矩阵；误差扩散把当前量化误差分配给邻近像素。本操作采用其图像库提供的抖动效果。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "抖动产生的规律点纹可能是处理痕迹，不是新找到的隐写；它会改变低位数据。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "黑白只有 0 和 255；要近似亮度 128",
            "output": "使用接近一半白点、一半黑点的区域",
            "explanation": "区域平均亮度约 127.5，单像素仍只有两个级数。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Invert%20Image",
    "capabilityIds": [
      "op:Invert%20Image"
    ],
    "relatedIds": [
      "op:Invert%20Image"
    ],
    "topicGroup": "image",
    "title": "图片反色",
    "summary": "8 位 RGB 反色将每个颜色分量 v 改为 255−v，让亮暗和互补颜色反转。",
    "aliases": [
      "invert",
      "反相"
    ],
    "sources": [
      {
        "id": "pixels",
        "title": "Canvas 像素操作",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ImageData、颜色选择器与反相颜色"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Invert Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Invert Image"
      }
    ],
    "sections": [
      {
        "title": "反色的逐通道计算",
        "paragraphs": [
          "8 位 RGB 反色将每个颜色分量 v 改为 255−v，让亮暗和互补颜色反转。",
          "对 R、G、B 分别计算；透明度一般保持原值。反色可让白底黑字变成黑底白字，但不会增加信息。"
        ],
        "sourceIds": [
          "pixels",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "不同位深的最大值不同；这里的 255 适用于 8 位分量。"
        ],
        "sourceIds": [
          "pixels",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "RGB(10,20,30)",
            "output": "RGB(245,235,225)",
            "explanation": "255−10=245，另外两通道同理。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Normalise%20Image",
    "capabilityIds": [
      "op:Normalise%20Image"
    ],
    "relatedIds": [
      "op:Normalise%20Image"
    ],
    "topicGroup": "image",
    "title": "图片归一化",
    "summary": "图像归一化根据原图颜色范围重新分配强度，提高低对比区域的可见差别。",
    "aliases": [
      "normalize",
      "对比拉伸"
    ],
    "sources": [
      {
        "id": "jimp",
        "title": "Jimp 图像处理 API",
        "publisher": "Jimp 项目",
        "url": "https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/",
        "language": "en",
        "kind": "author-spec",
        "locator": "normalize、dither、blur、convolute、color"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Normalise Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Normalise Image"
      }
    ],
    "sections": [
      {
        "title": "把较窄亮度范围拉伸",
        "paragraphs": [
          "图像归一化根据原图颜色范围重新分配强度，提高低对比区域的可见差别。",
          "一种线性拉伸写为 (v−最小值)×255/(最大值−最小值)；本操作使用随附图像库的 normalize 实现，不能和机器学习归一化混为一谈。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "均匀图片没有可拉伸的强度差；噪声也会放大，结果不能还原已经丢失的亮度级数。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "示意范围为 100～200；像素 150",
            "output": "线性示意结果约 128",
            "explanation": "此例说明区间映射，不作为不同库实现的逐像素兼容承诺。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Image%20Brightness%20%2F%20Contrast",
    "capabilityIds": [
      "op:Image%20Brightness%20%2F%20Contrast"
    ],
    "relatedIds": [
      "op:Image%20Brightness%20%2F%20Contrast"
    ],
    "topicGroup": "image",
    "title": "图片亮度与对比度",
    "summary": "亮度改变整体强度，对比度改变像素之间的差距；两者可以独立调整。",
    "aliases": [
      "亮度",
      "对比度"
    ],
    "sources": [
      {
        "id": "jimp",
        "title": "Jimp 图像处理 API",
        "publisher": "Jimp 项目",
        "url": "https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/",
        "language": "en",
        "kind": "author-spec",
        "locator": "normalize、dither、blur、convolute、color"
      },
      {
        "id": "filter",
        "title": "Canvas 滤镜",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "滤镜函数与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Brightness / Contrast"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Brightness / Contrast"
      }
    ],
    "sections": [
      {
        "title": "整体变亮与增强差距的区别",
        "paragraphs": [
          "亮度改变整体强度，对比度改变像素之间的差距；两者可以独立调整。",
          "本操作亮度、对比度参数由图像库定义，取值范围与 CSS 百分比不同。先以零变化作为基准，再逐步调整以免截断通道值。"
        ],
        "sourceIds": [
          "jimp",
          "filter",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "通道被截到 0 或 255 后细节不能靠反向参数恢复；别把过曝区域当作真实纯白。"
        ],
        "sourceIds": [
          "jimp",
          "filter",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "输入原图；亮度 0、对比度 0",
            "output": "颜色保持基准状态",
            "explanation": "这里 0 表示不调整，不是 CSS brightness(0)。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Image%20Filter",
    "capabilityIds": [
      "op:Image%20Filter"
    ],
    "relatedIds": [
      "op:Image%20Filter"
    ],
    "topicGroup": "image",
    "title": "图片滤镜",
    "summary": "本入口提供灰度与棕褐色（Sepia）两种滤镜，按颜色变换让画面呈现黑白或复古色。",
    "aliases": [
      "滤镜",
      "filter"
    ],
    "sources": [
      {
        "id": "filter",
        "title": "Canvas 滤镜",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "滤镜函数与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Filter"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Filter"
      }
    ],
    "sections": [
      {
        "title": "滤镜是像素变换而非隐藏资料",
        "paragraphs": [
          "本入口提供灰度与棕褐色（Sepia）两种滤镜，按颜色变换让画面呈现黑白或复古色。",
          "灰度将彩色分量折合为亮暗强度，Sepia 重新混合 RGB 形成偏暖颜色；与模糊等邻域滤镜的机制不同。"
        ],
        "sourceIds": [
          "filter",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本操作列出的滤镜由其图像库提供，与浏览器 CSS 同名效果也可能参数不同。"
        ],
        "sourceIds": [
          "filter",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "先反色再转灰度，与先改变对比度再反色",
            "output": "顺序不同可能得到不同输出",
            "explanation": "每一步输出都会成为下一步的输入。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Blur%20Image",
    "capabilityIds": [
      "op:Blur%20Image"
    ],
    "relatedIds": [
      "op:Blur%20Image"
    ],
    "topicGroup": "image",
    "title": "图片模糊",
    "summary": "模糊将邻近像素的值混合，减弱细小变化与锐利边缘。范围越大，空间细节通常损失越多。",
    "aliases": [
      "blur",
      "模糊"
    ],
    "sources": [
      {
        "id": "jimp",
        "title": "Jimp 图像处理 API",
        "publisher": "Jimp 项目",
        "url": "https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/",
        "language": "en",
        "kind": "author-spec",
        "locator": "normalize、dither、blur、convolute、color"
      },
      {
        "id": "filter",
        "title": "Canvas 滤镜",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "滤镜函数与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Blur Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Blur Image"
      }
    ],
    "sections": [
      {
        "title": "邻域混合为什么使边缘变软",
        "paragraphs": [
          "模糊将邻近像素的值混合，减弱细小变化与锐利边缘。范围越大，空间细节通常损失越多。",
          "高斯模糊按距离加权，本操作也提供图像库支持的快速或高斯模糊方式；半径的单位是像素。"
        ],
        "sourceIds": [
          "jimp",
          "filter",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "模糊不能可靠去除某个秘密，也不能恢复低分辨率内容；它会破坏二维码模块或低位隐写。"
        ],
        "sourceIds": [
          "jimp",
          "filter",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "三个灰度值 0、255、0，用等权平均示意",
            "output": "中间位置平均 85",
            "explanation": "示意说明邻域混合；实际核的权重由所选算法确定。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Sharpen%20Image",
    "capabilityIds": [
      "op:Sharpen%20Image"
    ],
    "relatedIds": [
      "op:Sharpen%20Image"
    ],
    "topicGroup": "image",
    "title": "图片锐化",
    "summary": "锐化突出像素与邻域的差别，让边缘显得更明显；它不会凭空补回原图细节。",
    "aliases": [
      "sharpen",
      "锐化",
      "卷积"
    ],
    "sources": [
      {
        "id": "jimp",
        "title": "Jimp 图像处理 API",
        "publisher": "Jimp 项目",
        "url": "https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/",
        "language": "en",
        "kind": "author-spec",
        "locator": "normalize、dither、blur、convolute、color"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Sharpen Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Sharpen Image"
      }
    ],
    "sections": [
      {
        "title": "用邻域差增强局部边缘",
        "paragraphs": [
          "锐化突出像素与邻域的差别，让边缘显得更明显；它不会凭空补回原图细节。",
          "本操作先高斯模糊一份副本，计算原图高于模糊图的正差，再按强度和亮度阈值加回原图，限制通道到 0～255。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "锐化同时会增强噪声和振铃；读小字前可少量尝试，但对隐写应保留原像素。"
        ],
        "sourceIds": [
          "jimp",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原像素灰度 100，模糊副本同位置也为 100",
            "output": "锐化差值为 0，该像素不增加亮度",
            "explanation": "平坦区域没有原图与模糊副本的正差可增强。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Image%20Hue%2FSaturation%2FLightness",
    "capabilityIds": [
      "op:Image%20Hue%2FSaturation%2FLightness"
    ],
    "relatedIds": [
      "op:Image%20Hue%2FSaturation%2FLightness"
    ],
    "topicGroup": "image",
    "title": "图片色相、饱和度与明度",
    "summary": "HSL 用色相角度、饱和度与明度表达颜色；色相改变颜色类别，饱和度改变离灰色的程度。",
    "aliases": [
      "HSL",
      "色相",
      "饱和度"
    ],
    "sources": [
      {
        "id": "color",
        "title": "CSS 颜色值",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RGB、十六进制与 HSL"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Hue/Saturation/Lightness"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Image Hue/Saturation/Lightness"
      }
    ],
    "sections": [
      {
        "title": "色相、浓淡与明度分别改变什么",
        "paragraphs": [
          "HSL 用色相角度、饱和度与明度表达颜色；色相改变颜色类别，饱和度改变离灰色的程度。",
          "本操作的 Hue 是角度增量，Saturation 和 Lightness 是图像库定义的调整量；0 代表不调整，角度按 360° 循环。"
        ],
        "sourceIds": [
          "color",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "这里是 HSL 明度，不是感知亮度或曝光；不同颜色在相同 HSL 明度下视觉明暗仍可能不同。"
        ],
        "sourceIds": [
          "color",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Hue 调整 360°，其余为 0",
            "output": "色相回到原方向",
            "explanation": "360° 是一整圈，等价于零角度偏移。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Render%20Image",
    "capabilityIds": [
      "op:Render%20Image"
    ],
    "relatedIds": [
      "op:Render%20Image"
    ],
    "topicGroup": "image",
    "title": "显示图片",
    "summary": "显示图片先识别图像文件格式，再让解码器将压缩或封装的字节恢复为像素。",
    "aliases": [
      "显示图片",
      "图像解码"
    ],
    "sources": [
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Render Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Render Image"
      }
    ],
    "sections": [
      {
        "title": "字节如何由图片解码器显示",
        "paragraphs": [
          "显示图片先识别图像文件格式，再让解码器将压缩或封装的字节恢复为像素。",
          "一个图片文件常含文件头、压缩像素与元数据；仅将任意字节当作图片并不能得到有效画面。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "能显示只说明解码器接受该格式，不代表不存在额外块或附加数据。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "PNG 签名加完整 IHDR、IDAT、IEND",
            "output": "得到 PNG 画面",
            "explanation": "只输入八字节签名仍没有足够图像数据。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Rotate%20Image",
    "capabilityIds": [
      "op:Rotate%20Image"
    ],
    "relatedIds": [
      "op:Rotate%20Image"
    ],
    "topicGroup": "image",
    "title": "旋转图片",
    "summary": "旋转将像素围绕参考中心按角度重新定位；非直角旋转往往还需重采样和扩展画布。",
    "aliases": [
      "rotate",
      "旋转"
    ],
    "sources": [
      {
        "id": "rotate",
        "title": "rotate：旋转变换",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/rotate",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Rotate Image"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Rotate Image"
      }
    ],
    "sections": [
      {
        "title": "旋转中心与输出画布",
        "paragraphs": [
          "旋转将像素围绕参考中心按角度重新定位；非直角旋转往往还需重采样和扩展画布。",
          "绕中心旋转要先平移到中心，施加旋转，再平移回去。直角旋转交换坐标轴，90° 时宽高交换。"
        ],
        "sourceIds": [
          "rotate",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "保留原尺寸可能裁掉四角；扩大画布则会产生新的边缘区域。"
        ],
        "sourceIds": [
          "rotate",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "原图 30 × 20，完整旋转 90°",
            "output": "输出边界可为 20 × 30",
            "explanation": "90° 将横纵方向互换。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20EXIF",
    "capabilityIds": [
      "op:Remove%20EXIF"
    ],
    "relatedIds": [
      "op:Remove%20EXIF"
    ],
    "topicGroup": "image",
    "title": "移除 EXIF 元数据",
    "summary": "移除 EXIF 目标是去掉对应的元数据结构，图像像素内容属于另一层数据。",
    "aliases": [
      "删除EXIF",
      "元数据清理"
    ],
    "sources": [
      {
        "id": "meta",
        "title": "WIC 元数据概述",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/windows/win32/wic/-wic-about-metadata",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "支持的元数据格式与元数据块"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove EXIF"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove EXIF"
      }
    ],
    "sections": [
      {
        "title": "删标签与重新编码的区别",
        "paragraphs": [
          "移除 EXIF 目标是去掉对应的元数据结构，图像像素内容属于另一层数据。",
          "处理器删除或忽略 EXIF 容器，再输出图片；方向标签消失后显示方向可能变化，因此应核对旋转状态。"
        ],
        "sourceIds": [
          "meta",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "移除 EXIF 不自动等于移除所有 XMP、IPTC、文本块或附加文件，应用后需再检查其他容器。"
        ],
        "sourceIds": [
          "meta",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "EXIF 含 GPS；XMP 另有作者",
            "output": "删除 EXIF 后仍可能保留 XMP 作者",
            "explanation": "不同元数据容器应分别核实。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20Image%20Format",
    "capabilityIds": [
      "op:Convert%20Image%20Format"
    ],
    "relatedIds": [
      "op:Convert%20Image%20Format"
    ],
    "topicGroup": "image",
    "title": "转换图片格式",
    "summary": "格式转换将原图片解码成像素，再由目标格式编码器写出文件；不是改扩展名。",
    "aliases": [
      "图片格式",
      "PNG",
      "JPEG"
    ],
    "sources": [
      {
        "id": "blob",
        "title": "toBlob：输出图片格式与质量",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toBlob",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Convert Image Format"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Image.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Convert Image Format"
      }
    ],
    "sections": [
      {
        "title": "解码像素后再编码到另一种容器",
        "paragraphs": [
          "格式转换将原图片解码成像素，再由目标格式编码器写出文件；不是改扩展名。",
          "PNG 支持无损像素与透明度，JPEG 常用有损压缩且不保存 Alpha。目标格式会决定质量、透明度和元数据能否保留。"
        ],
        "sourceIds": [
          "blob",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "JPEG 转 PNG 不会恢复已经损失的信息；多次有损保存还可能继续改变像素。"
        ],
        "sourceIds": [
          "blob",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "把透明 PNG 转成 JPEG",
            "output": "透明区域必须变成可见背景，目标没有 Alpha 通道",
            "explanation": "PNG 与 JPEG 的表达能力不同。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:fragments",
    "capabilityIds": [
      "native:fragments"
    ],
    "relatedIds": [
      "native:fragments"
    ],
    "topicGroup": "fragments",
    "title": "碎片拼接台",
    "summary": "碎片拼接保存每张图片的独立位置、角度与比例，再按图层顺序合成为一张画布。",
    "aliases": [
      "拼图",
      "仿射变换",
      "碎片"
    ],
    "sources": [
      {
        "id": "konva",
        "title": "Konva 节点变换与拖动",
        "publisher": "Konva 项目",
        "url": "https://konvajs.org/docs/overview.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "节点位置、缩放、旋转与图层"
      },
      {
        "id": "rotate",
        "title": "rotate：旋转变换",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/rotate",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/round4/fragments.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "碎片拼接台"
      }
    ],
    "sections": [
      {
        "title": "每块碎片的平移、旋转与缩放",
        "paragraphs": [
          "碎片拼接保存每张图片的独立位置、角度与比例，再按图层顺序合成为一张画布。",
          "同一点先经过缩放和旋转，再加平移偏移；修改不透明度便于对齐重叠边缘。画布缩放只是观察比例，不会改变碎片在画布中的坐标。"
        ],
        "sourceIds": [
          "konva",
          "rotate",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "拼接台提供人工摆放，不会自动推断未知碎片顺序；导出后结果成为一张平面图。"
        ],
        "sourceIds": [
          "konva",
          "rotate",
          "implementation"
        ],
        "examples": [
          {
            "input": "碎片上点 (10,0)，比例 2，旋转 90°，再平移 (100,50)",
            "output": "对应画布点 (100,70)",
            "explanation": "先变成 (20,0)，再变成 (0,20)，最后加位置偏移。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:model",
    "capabilityIds": [
      "native:model"
    ],
    "relatedIds": [
      "native:model"
    ],
    "topicGroup": "models",
    "title": "三维模型观察",
    "summary": "区分网格几何与 CIF 晶体结构，理解相机、晶胞、分数坐标和对称展开。",
    "aliases": [
      "glTF",
      "网格",
      "顶点",
      "三维",
      "CIF",
      "晶体",
      "晶胞",
      "分数坐标"
    ],
    "sources": [
      {
        "id": "gltf",
        "title": "glTF 2.0 规范",
        "publisher": "Khronos Group",
        "url": "https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html",
        "language": "en",
        "kind": "standard",
        "locator": "meshes、nodes、scenes 与 materials"
      },
      {
        "id": "iucr",
        "title": "CIF Core Dictionary：atom_site_fract",
        "publisher": "国际晶体学联合会 IUCr",
        "url": "https://www.iucr.org/__data/iucr/cifdic_html/1/cif_core.dic/Iatom_site_fract_.html",
        "language": "en",
        "kind": "standard",
        "locator": "分数坐标 x、y、z 与晶胞边长的关系"
      },
      {
        "id": "iucr-symmetry",
        "title": "CIF Core Dictionary：space_group_symop_operation_xyz",
        "publisher": "国际晶体学联合会 IUCr",
        "url": "https://www.iucr.org/__data/iucr/cifdic_html/1/cif_core.dic/Ispace_group_symop_operation_xyz.html",
        "language": "en",
        "kind": "standard",
        "locator": "X′ = WX + w；显式对称操作与晶胞内等价位置"
      },
      {
        "id": "cif-implementation",
        "title": "本站 CIF 解析与晶胞展开",
        "publisher": "迷雾工具箱",
        "url": "/round4/cif.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "parseCIF、parseSymmetry 与 expandCrystal；实际格式和原子限额"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/round4/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "三维模型观察的统一上传、CIF 参数、停止与保留旧模型"
      }
    ],
    "sections": [
      {
        "title": "网格、材质与观察相机",
        "paragraphs": [
          "三维模型以顶点和面描述几何，用节点变换放入场景，材质和纹理决定表面如何呈现。",
          "观察时旋转或移动相机改变视角，模型的本地顶点不一定改变。glTF 将几何数据、材质与场景组织为可交换的结构。"
        ],
        "sourceIds": [
          "gltf",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "可见表面不代表完整内部结构；纹理上的标记、对象坐标和相机方向应分别检查。"
        ],
        "sourceIds": [
          "gltf",
          "implementation"
        ],
        "examples": [
          {
            "input": "三角形顶点 (0,0,0)、(1,0,0)、(0,1,0)",
            "output": "三点决定 z=0 平面上的一张三角面",
            "explanation": "旋转相机后投影改变，但三角形的原始顶点仍相同。",
            "label": "按规则推演"
          }
        ]
      },
      {
        "title": "CIF 晶胞与分数坐标如何构成结构",
        "paragraphs": [
          "CIF 保存的是结构参数和原子位点，不是现成的三角网格。本站读取晶胞边长 a、b、c、夹角 α、β、γ，以及原子位点的分数坐标，再生成三维位置。",
          "分数坐标本身不是米或埃：空间位置为 x·a 向量 + y·b 向量 + z·c 向量。三个晶胞基向量不一定互相垂直，因此不能对任意晶胞都把 x、y、z 分别乘边长后当作直角坐标。"
        ],
        "sourceIds": [
          "iucr",
          "cif-implementation"
        ],
        "examples": [
          {
            "label": "正交晶胞内的位置",
            "input": "a=b=c=4 Å，α=β=γ=90°；分数坐标 (0.5,0,0)",
            "output": "直角坐标 (2 Å,0,0)",
            "explanation": "沿 a 基向量走半个晶胞：0.5×4=2 Å。这是坐标换算示例，不代表某个真实矿物的完整结构。"
          }
        ]
      },
      {
        "title": "显式对称操作与晶胞重复怎样展开",
        "paragraphs": [
          "对称操作用 x、y、z 的线性表达式表示旋转、反射及平移，例如 -x,-y,-z 将位点各分量取负；IUCr 将这一关系写作 X′=WX+w。读取器逐项应用文件列出的操作，把生成位置按晶胞周期归回 0≤分量<1，再按元素和位置去重。",
          "晶胞重复是在已展开的单个晶胞基础上加入整数晶格平移。每条轴重复 n 次会铺出 n³ 个晶胞；不会根据空间群名称猜出文件未提供的完整对称操作，也不会计算化学键。"
        ],
        "sourceIds": [
          "iucr-symmetry",
          "cif-implementation"
        ],
        "examples": [
          {
            "label": "反演与两倍晶胞",
            "input": "一个元素位点 (0.25,0,0)；操作 x,y,z 与 -x,-y,-z；每轴重复 2 次",
            "output": "单胞有 (0.25,0,0)、(0.75,0,0) 两个位点；2×2×2 晶胞共 16 个原子位置",
            "explanation": "反演得到 -0.25，按周期加 1 归为 0.75；两点不重合。每胞 2 个位置乘 8 个晶胞得 16，不把重复晶胞误当成新的物质记录。"
          }
        ]
      },
      {
        "title": "本机 CIF 的参数与适用边界",
        "paragraphs": [
          "从三维模型观察的同一个上传入口选择自己的 CIF，文件只在浏览器解析；本站不附带晶体样本库或矿物检索。CIF 限 1 MB、单个数据块、500 个独立原子位点、192 项显式对称操作，使用分数坐标；只有明确的 P1 可省略对称操作。",
          "每条轴可重复 1–3 次，展开后最多 2,000 个原子。读取可停止，超时或离页会中止，格式错误保留之前的模型。占位率保留并影响显示；球体大小只是示意，不能从图形推断真实原子半径、化学键、电子结构或矿物鉴定结论。"
        ],
        "sourceIds": [
          "cif-implementation",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "旋转相机改变投影，不等于修改文件中的顶点或原子坐标。",
      "CIF 位置必须结合晶胞及显式对称操作理解；本站不根据空间群名称补齐缺失的对称操作。",
      "晶胞重复用于观察周期结构，不新增矿物数据库记录，也不预测化学键。"
    ]
  },
  {
    "id": "function-native:hex-editor",
    "capabilityIds": [
      "native:hex-editor"
    ],
    "relatedIds": [
      "native:hex-editor"
    ],
    "topicGroup": "files",
    "title": "十六进制编辑器",
    "summary": "一个字节取值 0～255，十六进制用两位 00～FF 表示。偏移表示从文件起点计算的字节位置。",
    "aliases": [
      "hex",
      "十六进制",
      "offset"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "view",
        "title": "DataView：字节序与二进制数据",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/hex/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "十六进制编辑器"
      }
    ],
    "sections": [
      {
        "title": "十六进制、偏移与原始字节",
        "paragraphs": [
          "一个字节取值 0～255，十六进制用两位 00～FF 表示。偏移表示从文件起点计算的字节位置。",
          "编辑器把同一组原始字节显示为十六进制和文字两种视图；修改 41 为 42 是修改一个字节，而不是把字符串“41”改成“42”。"
        ],
        "sourceIds": [
          "typed",
          "view",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "UTF-8 的一个汉字通常占多个字节，直接改动其中一个字节可能造成无效文本；长度变化还可能破坏文件内偏移。"
        ],
        "sourceIds": [
          "typed",
          "view",
          "implementation"
        ],
        "examples": [
          {
            "input": "偏移 0 的字节 41；偏移 1 的字节 42",
            "output": "ASCII 文本 AB",
            "explanation": "偏移从 0 开始，十六进制 41 是十进制 65。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Detect%20File%20Type",
    "capabilityIds": [
      "op:Detect%20File%20Type"
    ],
    "relatedIds": [
      "op:Detect%20File%20Type"
    ],
    "topicGroup": "files",
    "title": "识别文件类型",
    "summary": "识别文件类型会检查文件开头或固定位置的特征字节，不仅查看文件名后缀。",
    "aliases": [
      "文件签名",
      "magic bytes"
    ],
    "sources": [
      {
        "id": "zip",
        "title": "ZIP 文件格式 APPNOTE",
        "publisher": "PKWARE",
        "url": "https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT",
        "language": "en",
        "kind": "standard",
        "locator": "本地文件头、中央目录与结束记录"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Detect File Type"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Detect File Type"
      }
    ],
    "sections": [
      {
        "title": "文件签名为什么比扩展名更有用",
        "paragraphs": [
          "识别文件类型会检查文件开头或固定位置的特征字节，不仅查看文件名后缀。",
          "签名与内部结构一起确定候选格式；相同容器可能包裹多种具体类型，例如 ZIP 容器也用于 DOCX 和 EPUB。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "签名可以伪造，短签名会误命中，候选类型应再用对应解析器验证。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "开头字节 50 4B 03 04",
            "output": "常见 ZIP 本地文件头候选",
            "explanation": "不能仅凭 PK 断定具体内容是普通压缩包还是 Office 文档。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Unzip",
    "capabilityIds": [
      "op:Unzip"
    ],
    "relatedIds": [
      "op:Unzip"
    ],
    "topicGroup": "files",
    "title": "解压 ZIP",
    "summary": "ZIP 将每个成员的文件信息与数据写入归档，并用中央目录记录成员的名称、方法、大小和位置。",
    "aliases": [
      "ZIP",
      "解包",
      "中央目录"
    ],
    "sources": [
      {
        "id": "zip",
        "title": "ZIP 文件格式 APPNOTE",
        "publisher": "PKWARE",
        "url": "https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT",
        "language": "en",
        "kind": "standard",
        "locator": "本地文件头、中央目录与结束记录"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Unzip"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Unzip"
      }
    ],
    "sections": [
      {
        "title": "从 ZIP 中央目录找到成员",
        "paragraphs": [
          "ZIP 将每个成员的文件信息与数据写入归档，并用中央目录记录成员的名称、方法、大小和位置。",
          "解压器读取目录与文件头，按每个成员的压缩方法还原字节；密码功能只适用于工具支持的加密形式。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "解压失败可能是密码、加密方法、截断或格式不受支持；不是所有 ZIP 加密方案都能由同一实现处理。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ZIP 包含 note.txt，原内容 ASCII ARG",
            "output": "解压后的 note.txt 字节为 41 52 47",
            "explanation": "文件名属于归档元数据，解压结果才是成员内容。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:file",
    "capabilityIds": [
      "native:file"
    ],
    "relatedIds": [
      "native:file"
    ],
    "topicGroup": "files",
    "title": "文件识别与字节查看",
    "summary": "文件是字节序列；显示为文本必须额外选择字符编码，显示为十六进制则直接观察字节。",
    "aliases": [
      "文件查看",
      "字节",
      "binary"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具实现与操作定义",
        "publisher": "迷雾工具箱",
        "url": "/app.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "文件识别与字节查看"
      }
    ],
    "sections": [
      {
        "title": "文件字节与文本视图如何对应",
        "paragraphs": [
          "文件是字节序列；显示为文本必须额外选择字符编码，显示为十六进制则直接观察字节。",
          "先核对字节长度、签名与可打印片段，再按格式进一步分析。遇到二进制内容时，文本视图出现乱码并不等于数据损坏。"
        ],
        "sourceIds": [
          "typed",
          "implementation"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "换行、空字节和不可打印字节都是可能的有效内容；转成文字再保存可能改变原字节。"
        ],
        "sourceIds": [
          "typed",
          "implementation"
        ],
        "examples": [
          {
            "input": "三个原始字节 41 00 42",
            "output": "字节数 3；文本可见 A 和 B，中间是 NUL",
            "explanation": "不可见字节仍占一个偏移位置。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Compare%20CTPH%20hashes",
    "capabilityIds": [
      "op:Compare%20CTPH%20hashes"
    ],
    "relatedIds": [
      "op:Compare%20CTPH%20hashes"
    ],
    "topicGroup": "files",
    "title": "比较 CTPH 哈希",
    "summary": "CTPH 签名来自内容触发的分段摘要；比较会寻找分段签名序列的共同部分，以估计文件内容相似程度。",
    "aliases": [
      "CTPH",
      "模糊哈希比较"
    ],
    "sources": [
      {
        "id": "ctph",
        "title": "上下文触发分段哈希原始论文",
        "publisher": "Jesse Kornblum / DFRWS",
        "url": "https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/",
        "language": "en",
        "kind": "author-spec",
        "locator": "rolling hash 与分段摘要"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Compare CTPH hashes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Compare CTPH hashes"
      }
    ],
    "sections": [
      {
        "title": "比较分段摘要里的相似片段",
        "paragraphs": [
          "CTPH 签名来自内容触发的分段摘要；比较会寻找分段签名序列的共同部分，以估计文件内容相似程度。",
          "先检查签名使用的块尺度是否可比较，再匹配共同子串或编辑差别。返回分数只描述该模糊哈希算法观察到的相似度。"
        ],
        "sourceIds": [
          "ctph",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它不能验证文件完全相同，也不能把分数直接解释成相同字节的百分比。"
        ],
        "sourceIds": [
          "ctph",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "签名 A 与完全相同的签名 A",
            "output": "比较可得最高相似分数",
            "explanation": "完整性仍需逐字节比较或密码摘要；不同分段尺度可能使比较失效。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Compare%20SSDEEP%20hashes",
    "capabilityIds": [
      "op:Compare%20SSDEEP%20hashes"
    ],
    "relatedIds": [
      "op:Compare%20SSDEEP%20hashes"
    ],
    "topicGroup": "files",
    "title": "比较 SSDEEP 哈希",
    "summary": "SSDEEP 签名形如 blocksize:hash1:hash2，包含两种相关尺度的分段结果。",
    "aliases": [
      "ssdeep",
      "fuzzy hash"
    ],
    "sources": [
      {
        "id": "ssdeep",
        "title": "ssdeep 使用说明",
        "publisher": "ssdeep 项目",
        "url": "https://ssdeep-project.github.io/ssdeep/usage.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "签名格式与匹配分数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Compare SSDEEP hashes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Compare SSDEEP hashes"
      }
    ],
    "sections": [
      {
        "title": "块尺度与相似度分数",
        "paragraphs": [
          "SSDEEP 签名形如 blocksize:hash1:hash2，包含两种相关尺度的分段结果。",
          "比较器检查块尺度和公共片段，返回 0～100 分数；它用于寻找相似样本，不能替代 SHA-256 一类完整性摘要。"
        ],
        "sourceIds": [
          "ssdeep",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "很短、无共同片段或尺度不匹配的输入，即使肉眼相似也可能得低分。"
        ],
        "sourceIds": [
          "ssdeep",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "相同合法签名与自己比较",
            "output": "匹配分数 100",
            "explanation": "分数刻度是算法的评分，不是编辑距离的直接百分比。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Drop%20bytes",
    "capabilityIds": [
      "op:Drop%20bytes"
    ],
    "relatedIds": [
      "op:Drop%20bytes"
    ],
    "topicGroup": "files",
    "title": "丢弃字节",
    "summary": "丢弃字节以起始位置和长度选择一个连续片段，并将它从输入序列移除。",
    "aliases": [
      "字节截取",
      "drop"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Drop bytes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Drop bytes"
      }
    ],
    "sections": [
      {
        "title": "按偏移移除连续字节",
        "paragraphs": [
          "丢弃字节以起始位置和长度选择一个连续片段，并将它从输入序列移除。",
          "原始偏移从 0 开始；移除后后面的字节向前接合，输出长度减少。它不会理解或更新文件结构。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "要删除文件头，须先确定实际头长度；盲目删除可能损坏正文或内部偏移。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "字节 41 42 43 44；从 1 丢弃 2 字节",
            "output": "41 44（AD）",
            "explanation": "偏移 1 和 2 对应 B、C。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Analyse%20hash",
    "capabilityIds": [
      "op:Analyse%20hash"
    ],
    "relatedIds": [
      "op:Analyse%20hash"
    ],
    "topicGroup": "files",
    "title": "分析哈希类型",
    "summary": "哈希字符串通常没有内置算法标签；分析依据长度、字母范围或特定格式提出算法候选。",
    "aliases": [
      "哈希识别",
      "摘要类型"
    ],
    "sources": [
      {
        "id": "md5",
        "title": "MD5 类",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.security.cryptography.md5",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "备注：摘要与碰撞问题"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Analyse hash"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Analyse hash"
      }
    ],
    "sections": [
      {
        "title": "长度和字符集只能给出候选",
        "paragraphs": [
          "哈希字符串通常没有内置算法标签；分析依据长度、字母范围或特定格式提出算法候选。",
          "32 个十六进制字符表示 128 位，可能是 MD5，也可能是其他 128 位结果或截断摘要。带前缀和分隔符的口令哈希则可以提供更多信息。"
        ],
        "sourceIds": [
          "md5",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "候选不是确定鉴定；确认需要已知原文、生成参数或文件格式上下文。"
        ],
        "sourceIds": [
          "md5",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "900150983cd24fb0d6963f7d28e17f72",
            "output": "可作为 MD5 候选；仅凭长度不能唯一认定",
            "explanation": "32×4=128 位，多种摘要能得到这个长度。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Drop%20nth%20bytes",
    "capabilityIds": [
      "op:Drop%20nth%20bytes"
    ],
    "relatedIds": [
      "op:Drop%20nth%20bytes"
    ],
    "topicGroup": "files",
    "title": "间隔丢弃字节",
    "summary": "间隔丢弃根据起始偏移和周期选择字节，不依据字符或行内语义。",
    "aliases": [
      "间隔删除",
      "nth bytes"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Drop nth bytes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Drop nth bytes"
      }
    ],
    "sections": [
      {
        "title": "周期性删除字节的位置",
        "paragraphs": [
          "间隔丢弃根据起始偏移和周期选择字节，不依据字符或行内语义。",
          "起始为 s、周期为 n 时，丢弃 s、s+n、s+2n…；按行应用则在每行重新开始计数。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "n 必须是有效正间隔；对 UTF-8 文本按字节操作可能拆开多字节字符。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII ABCDEF；每 2 字节丢弃；起始 0",
            "output": "BDF",
            "explanation": "丢弃偏移 0、2、4 的 A、C、E。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Take%20nth%20bytes",
    "capabilityIds": [
      "op:Take%20nth%20bytes"
    ],
    "relatedIds": [
      "op:Take%20nth%20bytes"
    ],
    "topicGroup": "files",
    "title": "间隔提取字节",
    "summary": "间隔提取保留每个周期中的一个字节，适合检查交织数据的固定位置。",
    "aliases": [
      "间隔提取",
      "交织"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Take nth bytes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Take nth bytes"
      }
    ],
    "sections": [
      {
        "title": "周期性抽样怎样取出交织信息",
        "paragraphs": [
          "间隔提取保留每个周期中的一个字节，适合检查交织数据的固定位置。",
          "起始为 s、周期为 n 时，保留 s、s+n、s+2n…；其他位置全部移除。若有分行选项，各行分别计数。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "抽样丢失其他字节；周期和起始偏移不对时，会得到另一条数据流。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII ABCDEF；每 2 字节取一次；起始 1",
            "output": "BDF",
            "explanation": "取偏移 1、3、5。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Offset%20checker",
    "capabilityIds": [
      "op:Offset%20checker"
    ],
    "relatedIds": [
      "op:Offset%20checker"
    ],
    "topicGroup": "files",
    "title": "检查偏移量",
    "summary": "偏移检查器把多份样本并排比较，突出所有样本在同一位置出现的相同字符。",
    "aliases": [
      "偏移",
      "样本对比"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Offset checker"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Offset checker"
      }
    ],
    "sections": [
      {
        "title": "在相同字符位置比较样本",
        "paragraphs": [
          "偏移检查器把多份样本并排比较，突出所有样本在同一位置出现的相同字符。",
          "样本按指定分隔符拆分，逐位置比较字符；它是格式结构的辅助检查，不会自动对齐插入或删除造成的位移。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本操作比较字符串位置，不应直接当成二进制文件中 UTF-8 字节偏移。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "样本 ABC123 和 ABC456",
            "output": "偏移 0～2 的 ABC 相同，后 3 位不同",
            "explanation": "可以提示稳定前缀，但不足以证明字段用途。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Swap%20endianness",
    "capabilityIds": [
      "op:Swap%20endianness"
    ],
    "relatedIds": [
      "op:Swap%20endianness"
    ],
    "topicGroup": "files",
    "title": "交换字节序",
    "summary": "多字节整数可按大端或小端存储。交换字节序在选定组宽内反转字节，保留各字节内部的比特顺序。",
    "aliases": [
      "大端",
      "小端",
      "endianness"
    ],
    "sources": [
      {
        "id": "view",
        "title": "DataView：字节序与二进制数据",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Swap endianness"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Swap endianness"
      }
    ],
    "sections": [
      {
        "title": "只交换组内的字节顺序",
        "paragraphs": [
          "多字节整数可按大端或小端存储。交换字节序在选定组宽内反转字节，保留各字节内部的比特顺序。",
          "16 位组每两字节反转，32 位组每四字节反转；组宽必须与数据字段匹配。"
        ],
        "sourceIds": [
          "view",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "反转全文与交换每个整数的字节序不同；文字也不一定由固定宽度整数组成。"
        ],
        "sourceIds": [
          "view",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "32 位组：12 34 56 78",
            "output": "78 56 34 12",
            "explanation": "只反转这一组内的四个字节。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20UNIX%20file%20permissions",
    "capabilityIds": [
      "op:Parse%20UNIX%20file%20permissions"
    ],
    "relatedIds": [
      "op:Parse%20UNIX%20file%20permissions"
    ],
    "topicGroup": "files",
    "title": "解析 UNIX 文件权限",
    "summary": "UNIX 基本权限为所有者、组和其他人各提供读 r、写 w、执行 x 三位。",
    "aliases": [
      "chmod",
      "rwx",
      "权限"
    ],
    "sources": [
      {
        "id": "permissions",
        "title": "健康检查项7322：文件权限数值换算",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/hedex/api/pages/EDOC1100331207/FZM1012J/06/resources/zh-cn_topic_0000002022607466.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "rwx的4+2+1与chmod八进制权限"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse UNIX file permissions"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse UNIX file permissions"
      }
    ],
    "sections": [
      {
        "title": "读、写、执行如何写成八进制",
        "paragraphs": [
          "UNIX 基本权限为所有者、组和其他人各提供读 r、写 w、执行 x 三位。",
          "每组三位分别权重 4、2、1，将置位权限相加便得到一个八进制数字。额外的 setuid、setgid、sticky 位另作表示。"
        ],
        "sourceIds": [
          "permissions",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "目录的执行位表示可遍历，不能直接当作文件的可运行含义；ACL 还可能增加额外权限规则。"
        ],
        "sourceIds": [
          "permissions",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "权限 754",
            "output": "rwxr-xr--",
            "explanation": "7=4+2+1；5=4+1；4=只读。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Luhn%20Checksum",
    "capabilityIds": [
      "op:Luhn%20Checksum"
    ],
    "relatedIds": [
      "op:Luhn%20Checksum"
    ],
    "topicGroup": "files",
    "title": "卢恩校验和",
    "summary": "Luhn 是用于数字编号的校验位算法，按从右端计算的位置交替将数字乘 2。",
    "aliases": [
      "Luhn",
      "校验位"
    ],
    "sources": [
      {
        "id": "luhn",
        "title": "Luhn / Modulus 10 与主账号校验",
        "publisher": "PCI Security Standards Council",
        "url": "https://www.pcisecuritystandards.org/faqs/1137/",
        "language": "en",
        "kind": "official-doc",
        "locator": "主账号校验算法的用途"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Luhn Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Luhn Checksum"
      }
    ],
    "sections": [
      {
        "title": "交替倍增与十进制折叠",
        "paragraphs": [
          "Luhn 是用于数字编号的校验位算法，按从右端计算的位置交替将数字乘 2。",
          "乘 2 后超过 9 就减 9，然后求和；加上校验位后总和应能被 10 整除。生成与校验必须按同一末位约定。"
        ],
        "sourceIds": [
          "luhn",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它检测部分录入错误，不是加密或真实性认证，也不能识别所有换位错误。"
        ],
        "sourceIds": [
          "luhn",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "待生成编号 7992739871",
            "output": "校验位 3；完整编号 79927398713",
            "explanation": "按 Luhn 求和得到总和 70，是 10 的倍数。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parity%20Bit",
    "capabilityIds": [
      "op:Parity%20Bit"
    ],
    "relatedIds": [
      "op:Parity%20Bit"
    ],
    "topicGroup": "files",
    "title": "奇偶校验位",
    "summary": "奇偶校验增加一位，使数据和校验位中的 1 总数符合指定奇偶性。",
    "aliases": [
      "奇偶校验",
      "parity"
    ],
    "sources": [
      {
        "id": "parity",
        "title": "SerialPort.Parity 属性",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.io.ports.serialport.parity?view=net-9.0-pp",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "奇校验与偶校验"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parity Bit"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Parity Bit"
      }
    ],
    "sections": [
      {
        "title": "让 1 的个数为奇数或偶数",
        "paragraphs": [
          "奇偶校验增加一位，使数据和校验位中的 1 总数符合指定奇偶性。",
          "偶校验把总数补成偶数，奇校验补成奇数；工具还可选择加在开头或末尾以及按分隔符逐块处理。"
        ],
        "sourceIds": [
          "parity",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "两个比特同时翻转可能仍保留奇偶性，所以校验不能检测全部错误，更不能纠错。"
        ],
        "sourceIds": [
          "parity",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "数据 101；偶校验位放末尾",
            "output": "1010",
            "explanation": "原数据有两个 1，已是偶数，所以校验位为 0。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Scan%20for%20Embedded%20Files",
    "capabilityIds": [
      "op:Scan%20for%20Embedded%20Files"
    ],
    "relatedIds": [
      "op:Scan%20for%20Embedded%20Files"
    ],
    "topicGroup": "files",
    "title": "扫描内嵌文件",
    "summary": "内嵌扫描在输入多个位置寻找已知格式的魔数字节，提示可能存在的子文件和偏移。",
    "aliases": [
      "嵌入文件",
      "carving"
    ],
    "sources": [
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Scan for Embedded Files"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Scan for Embedded Files"
      }
    ],
    "sections": [
      {
        "title": "逐偏移查找可能的文件头",
        "paragraphs": [
          "内嵌扫描在输入多个位置寻找已知格式的魔数字节，提示可能存在的子文件和偏移。",
          "例如非开头处出现 PNG 签名，会被当作图片候选；是否真是完整文件还要读取结构、长度和结束标记。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "随机数据也可能出现签名；扫描发现候选不等于已经提取出有效文件，大文件扫描会耗时。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "前 20 字节后出现完整 PNG 签名",
            "output": "PNG 候选起始偏移为十进制 20，即 0x14",
            "explanation": "需要进一步检查后续块结构。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CTPH",
    "capabilityIds": [
      "op:CTPH"
    ],
    "relatedIds": [
      "op:CTPH"
    ],
    "topicGroup": "files",
    "title": "上下文触发分段哈希",
    "summary": "上下文触发分段哈希用滚动摘要寻找内容边界，再为每一段生成较短摘要并连接为签名。",
    "aliases": [
      "上下文触发分段哈希"
    ],
    "sources": [
      {
        "id": "ctph",
        "title": "上下文触发分段哈希原始论文",
        "publisher": "Jesse Kornblum / DFRWS",
        "url": "https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/",
        "language": "en",
        "kind": "author-spec",
        "locator": "rolling hash 与分段摘要"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CTPH"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "CTPH"
      }
    ],
    "sections": [
      {
        "title": "用内容决定分段边界",
        "paragraphs": [
          "上下文触发分段哈希用滚动摘要寻找内容边界，再为每一段生成较短摘要并连接为签名。",
          "固定大小分块遇到插入就容易整体错位；内容触发的边界能在插入之后重新同步，因此适合寻找共有片段。"
        ],
        "sourceIds": [
          "ctph",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "不同 CTPH 实现可能有不同签名约定；此操作和 SSDEEP 入口的互通性需按具体实现核实。"
        ],
        "sourceIds": [
          "ctph",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "两文件有同样的长片段，但其中一份中间插入了文字",
            "output": "共有片段可能仍对应相似的分段签名",
            "explanation": "这里只推演边界同步机制，不承诺任意编辑都会得到高分。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20all%20hashes",
    "capabilityIds": [
      "op:Generate%20all%20hashes"
    ],
    "relatedIds": [
      "op:Generate%20all%20hashes"
    ],
    "topicGroup": "files",
    "title": "生成全部哈希",
    "summary": "此操作对同一份输入字节运行多种哈希算法，并列展示它们的结果。",
    "aliases": [
      "全部哈希",
      "digest"
    ],
    "sources": [
      {
        "id": "rfc1321",
        "title": "RFC 1321：MD5",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1321.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "rfc6234",
        "title": "RFC 6234：SHA 系列",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6234.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate all hashes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate all hashes"
      }
    ],
    "sections": [
      {
        "title": "同一输入为什么得到多种摘要",
        "paragraphs": [
          "此操作对同一份输入字节运行多种哈希算法，并列展示它们的结果。",
          "摘要算法、长度和参数不同，结果就不同；校验时必须挑选和对方使用的算法一致的条目。"
        ],
        "sourceIds": [
          "rfc1321",
          "rfc6234",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "算法列表不会增强某个摘要本身的安全性；许多旧算法只是为了格式识别和兼容。"
        ],
        "sourceIds": [
          "rfc1321",
          "rfc6234",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "MD5=900150983cd24fb0d6963f7d28e17f72；SHA-1=a9993e364706816aba3e25717850c26c9cd0d89d",
            "explanation": "两项都来自同样三个字节，但规则不同。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20all%20checksums",
    "capabilityIds": [
      "op:Generate%20all%20checksums"
    ],
    "relatedIds": [
      "op:Generate%20all%20checksums"
    ],
    "topicGroup": "files",
    "title": "生成全部校验和",
    "summary": "校验和汇总对同一输入计算多个校验算法或参数集，方便与未知校验字段逐项比对。",
    "aliases": [
      "校验和汇总"
    ],
    "sources": [
      {
        "id": "rfc1950",
        "title": "RFC 1950：ZLIB 压缩格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1950.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate all checksums"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate all checksums"
      }
    ],
    "sections": [
      {
        "title": "校验参数比结果长度更重要",
        "paragraphs": [
          "校验和汇总对同一输入计算多个校验算法或参数集，方便与未知校验字段逐项比对。",
          "CRC 宽度相同仍可能使用不同多项式、初值、反射规则或最终异或；匹配须核对完整参数集。"
        ],
        "sourceIds": [
          "rfc1950",
          "png",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "只碰巧匹配一个短校验不能唯一确认算法，更不能证明数据完整可靠。"
        ],
        "sourceIds": [
          "rfc1950",
          "png",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "UTF-8 字节 abc",
            "output": "Adler-32=024D0127；CRC-32/ISO-HDLC=352441C2",
            "explanation": "结果代表不同规则；两者长度都为 32 位也不能互换。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20Files",
    "capabilityIds": [
      "op:Extract%20Files"
    ],
    "relatedIds": [
      "op:Extract%20Files"
    ],
    "topicGroup": "files",
    "title": "提取文件",
    "summary": "文件雕刻根据格式头、内容长度和结束规则，从较大字节流中切出候选子文件。",
    "aliases": [
      "文件提取",
      "file carving"
    ],
    "sources": [
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract Files"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract Files"
      }
    ],
    "sections": [
      {
        "title": "从混合字节中雕刻子文件",
        "paragraphs": [
          "文件雕刻根据格式头、内容长度和结束规则，从较大字节流中切出候选子文件。",
          "扫描只找起点，提取还要估计边界。本操作可以按文件类别过滤，并用最小大小减少很短的误命中。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "碎片化、截断或无结束标记的文件可能无法完整提取；成功下载也需要对应解码器再验证。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "混合数据中包含 PNG 签名、完整块和 IEND",
            "output": "可切出这一段 PNG 作为候选文件",
            "explanation": "识别依据来自结构，不是原来是否存在 .png 文件名。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Take%20bytes",
    "capabilityIds": [
      "op:Take%20bytes"
    ],
    "relatedIds": [
      "op:Take%20bytes"
    ],
    "topicGroup": "files",
    "title": "提取字节",
    "summary": "连续提取以起始字节偏移和长度取出一个区间，其余字节不进入输出。",
    "aliases": [
      "连续提取",
      "slice"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Take bytes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Take bytes"
      }
    ],
    "sections": [
      {
        "title": "保留一个连续字节片段",
        "paragraphs": [
          "连续提取以起始字节偏移和长度取出一个区间，其余字节不进入输出。",
          "起始为 s、长度为 n 时，对应区间 [s,s+n)，结束位置不包含在内。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "长度按字节计，与可见字符数可能不同；在 UTF-8 字符内部截断会得到不完整序列。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "41 42 43 44 45；start=1，length=3",
            "output": "42 43 44（BCD）",
            "explanation": "提取偏移 1、2、3 的三个字节。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:File%20Tree",
    "capabilityIds": [
      "op:File%20Tree"
    ],
    "relatedIds": [
      "op:File%20Tree"
    ],
    "topicGroup": "files",
    "title": "文件树",
    "summary": "文件树把具有相同路径前缀的项目放入共同节点，层级来自路径分隔符。",
    "aliases": [
      "目录树",
      "tree"
    ],
    "sources": [
      {
        "id": "tree",
        "title": "tree 命令：目录结构",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/windows-server/administration/windows-commands/tree",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "目录树与文件显示"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "File Tree"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "File Tree"
      }
    ],
    "sections": [
      {
        "title": "路径前缀怎样变成树",
        "paragraphs": [
          "文件树把具有相同路径前缀的项目放入共同节点，层级来自路径分隔符。",
          "a/b.txt 和 a/c.txt 会先共享目录 a，再分为两个文件节点；输入列表分隔符与路径分隔符是两种参数。"
        ],
        "sourceIds": [
          "tree",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "此操作只排版路径文本，不会访问本地目录，也不证明路径真实存在。"
        ],
        "sourceIds": [
          "tree",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "a/b.txt\na/c.txt",
            "output": "a\n├ b.txt\n└ c.txt",
            "explanation": "两个文件共享 a 这一前缀节点。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Raw%20Deflate",
    "capabilityIds": [
      "pair:Raw%20Deflate"
    ],
    "relatedIds": [
      "pair:Raw%20Deflate"
    ],
    "topicGroup": "files",
    "title": "原始 Deflate 编码与解码",
    "summary": "DEFLATE 先用 LZ77 将重复字节串表示为长度和向后距离，再用 Huffman 编码表示字面值、长度和距离。",
    "aliases": [
      "Raw DEFLATE",
      "LZ77",
      "Huffman"
    ],
    "sources": [
      {
        "id": "rfc1951",
        "title": "RFC 1951：DEFLATE 压缩格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1951.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Raw Deflate / Raw Inflate"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Raw Deflate / Raw Inflate"
      }
    ],
    "sections": [
      {
        "title": "回溯引用与 Huffman 编码",
        "paragraphs": [
          "DEFLATE 先用 LZ77 将重复字节串表示为长度和向后距离，再用 Huffman 编码表示字面值、长度和距离。",
          "Raw 表示只有 DEFLATE 数据块，没有 zlib 或 gzip 的外层头尾。可选固定 Huffman、动态 Huffman 或不压缩存储块。"
        ],
        "sourceIds": [
          "rfc1951",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "解压必须选择相同封装层；把 zlib 的头当成 Raw 数据会失败。压缩结果也不保证比原始内容短。"
        ],
        "sourceIds": [
          "rfc1951",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；原始 DEFLATE 的一种固定 Huffman 编码",
            "output": "4B 4C 4A 06 00；解压得 61 62 63",
            "explanation": "这是有效示例，不要求不同压缩器输出完全相同字节。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Zlib%20Deflate",
    "capabilityIds": [
      "pair:Zlib%20Deflate"
    ],
    "relatedIds": [
      "pair:Zlib%20Deflate"
    ],
    "topicGroup": "files",
    "title": "Zlib 编码与解码",
    "summary": "zlib 在 DEFLATE 数据前加方法与标记字段，在后面加原文的 Adler-32 校验。",
    "aliases": [
      "zlib",
      "Deflate"
    ],
    "sources": [
      {
        "id": "rfc1950",
        "title": "RFC 1950：ZLIB 压缩格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1950.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "rfc1951",
        "title": "RFC 1951：DEFLATE 压缩格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1951.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Zlib Deflate / Zlib Inflate"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Zlib Deflate / Zlib Inflate"
      }
    ],
    "sections": [
      {
        "title": "DEFLATE 外的头和 Adler-32",
        "paragraphs": [
          "zlib 在 DEFLATE 数据前加方法与标记字段，在后面加原文的 Adler-32 校验。",
          "头的 CMF 和 FLG 组合应满足整除 31 的检查；可能声明预设字典。解压后应核对校验尾。"
        ],
        "sourceIds": [
          "rfc1950",
          "rfc1951",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "zlib 不是 gzip；两者虽然常用同一 DEFLATE 内核，外层字段和校验不同。"
        ],
        "sourceIds": [
          "rfc1950",
          "rfc1951",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；一种 zlib 编码",
            "output": "78 9C 4B 4C 4A 06 00 02 4D 01 27",
            "explanation": "78 9C 是头，末尾 024D0127 是原文的 Adler-32。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Gzip",
    "capabilityIds": [
      "pair:Gzip"
    ],
    "relatedIds": [
      "pair:Gzip"
    ],
    "topicGroup": "files",
    "title": "Gzip 编码与解码",
    "summary": "gzip 用文件头包裹 DEFLATE 正文，尾部包含原文 CRC-32 和原文大小模 2³²；不是多文件目录格式。",
    "aliases": [
      "gzip",
      "gunzip"
    ],
    "sources": [
      {
        "id": "rfc1952",
        "title": "RFC 1952：GZIP 文件格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1952.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Gzip / Gunzip"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Gzip / Gunzip"
      }
    ],
    "sections": [
      {
        "title": "文件头、压缩正文与校验尾",
        "paragraphs": [
          "gzip 用文件头包裹 DEFLATE 正文，尾部包含原文 CRC-32 和原文大小模 2³²；不是多文件目录格式。",
          "头签名为 1F 8B，常见压缩方法编号 08 表示 DEFLATE；时间戳、名称或注释字段会使相同原文产生不同压缩字节。"
        ],
        "sourceIds": [
          "rfc1952",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "需要多个文件时通常先 TAR 再 gzip；解压文本应先获得原始字节，再按正确字符编码读取。"
        ],
        "sourceIds": [
          "rfc1952",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "gzip 头前三字节 1F 8B 08",
            "output": "gzip 签名 + DEFLATE 方法",
            "explanation": "完整文件还需要头其他字段、压缩正文和 CRC/大小尾。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Bzip2%20Compress",
    "capabilityIds": [
      "pair:Bzip2%20Compress"
    ],
    "relatedIds": [
      "pair:Bzip2%20Compress"
    ],
    "topicGroup": "files",
    "title": "Bzip2 压缩与解压",
    "summary": "bzip2 是无损压缩：按块经过 Burrows–Wheeler 排序变换，再结合移到前面、游程与 Huffman 编码表示数据。",
    "aliases": [
      "bzip2",
      "Burrows-Wheeler",
      "BWT"
    ],
    "sources": [
      {
        "id": "bzip",
        "title": "bzip2 官方手册",
        "publisher": "bzip2 项目",
        "url": "https://sourceware.org/bzip2/manual/manual.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Burrows–Wheeler、Huffman 与块大小"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bzip2 Compress / Bzip2 Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Bzip2 Compress / Bzip2 Decompress"
      }
    ],
    "sections": [
      {
        "title": "块排序怎样集中重复上下文",
        "paragraphs": [
          "bzip2 是无损压缩：按块经过 Burrows–Wheeler 排序变换，再结合移到前面、游程与 Huffman 编码表示数据。",
          "块排序保持可逆，但让相似上下文更集中；更大的块通常能改善压缩率，也会增加内存需求。"
        ],
        "sourceIds": [
          "bzip",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "bzip2 不是 DEFLATE，解压入口不可互换；块头与校验也属于其自己的格式。"
        ],
        "sourceIds": [
          "bzip",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "文件头 BZh9",
            "output": "bzip2；块大小等级 9，约 900 kB",
            "explanation": "BZh 为格式标记，后面的数字指定块级别。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:LZ4%20Compress",
    "capabilityIds": [
      "pair:LZ4%20Compress"
    ],
    "relatedIds": [
      "pair:LZ4%20Compress"
    ],
    "topicGroup": "files",
    "title": "LZ4 压缩与解压",
    "summary": "LZ4 块由字面值串和向后匹配组成，使用 token、长度和偏移表示重复片段，重点是编解码速度。",
    "aliases": [
      "LZ4",
      "literal",
      "match"
    ],
    "sources": [
      {
        "id": "lz4",
        "title": "LZ4 Block Format",
        "publisher": "LZ4 维护者",
        "url": "https://github.com/lz4/lz4/blob/dev/doc/lz4_Block_format.md",
        "language": "en",
        "kind": "author-spec",
        "locator": "token、literal length、match offset 与 match length"
      },
      {
        "id": "lz4-frame",
        "title": "LZ4 Frame Format",
        "publisher": "LZ4 维护者",
        "url": "https://github.com/lz4/lz4/blob/dev/doc/lz4_Frame_format.md",
        "language": "en",
        "kind": "author-spec",
        "locator": "Magic Number、Frame Descriptor、Data Blocks、Checksums"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LZ4 Compress / LZ4 Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LZ4 Compress / LZ4 Decompress"
      }
    ],
    "sections": [
      {
        "title": "快速查找重复串而不做熵编码",
        "paragraphs": [
          "LZ4 块由字面值串和向后匹配组成，使用 token、长度和偏移表示重复片段，重点是编解码速度。",
          "token 的两半分别编码字面长度和匹配长度；长度超出基本范围时追加长度字节。完整帧还可包含头、大小与校验字段。"
        ],
        "sourceIds": [
          "lz4",
          "lz4-frame",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "Raw block 与 frame 的封装不同，必须核对输入形式；匹配偏移从已经输出的数据回溯。"
        ],
        "sourceIds": [
          "lz4",
          "lz4-frame",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "LZ4 frame 起始字节 04 22 4D 18",
            "output": "帧魔数；随后读取帧描述和数据块",
            "explanation": "魔数按文件字节顺序显示，不能把普通块当成有这个头的帧。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:LZMA%20Compress",
    "capabilityIds": [
      "pair:LZMA%20Compress"
    ],
    "relatedIds": [
      "pair:LZMA%20Compress"
    ],
    "topicGroup": "files",
    "title": "LZMA 压缩与解压",
    "summary": "LZMA 结合 Lempel–Ziv 字典匹配、上下文概率模型和范围编码，将重复和预测概率转为较紧凑的比特流。",
    "aliases": [
      "LZMA",
      "范围编码",
      "字典"
    ],
    "sources": [
      {
        "id": "lzma",
        "title": "LZMA SDK",
        "publisher": "Igor Pavlov / 7-Zip",
        "url": "https://www.7-zip.org/sdk.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Lempel–Ziv–Markov chain algorithm"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LZMA Compress / LZMA Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LZMA Compress / LZMA Decompress"
      }
    ],
    "sections": [
      {
        "title": "字典匹配与范围编码",
        "paragraphs": [
          "LZMA 结合 Lempel–Ziv 字典匹配、上下文概率模型和范围编码，将重复和预测概率转为较紧凑的比特流。",
          "压缩模式会影响匹配搜索的速度和效果；解压依赖编码时写入或约定的字典、属性和长度信息。"
        ],
        "sourceIds": [
          "lzma",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "LZMA 数据不是 .xz 或 .7z 容器本身；模式级别不是密码强度。"
        ],
        "sourceIds": [
          "lzma",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "重复串 ABCABCABC",
            "output": "可将后六字节表示为已有 ABC 的重复引用",
            "explanation": "此例解释匹配思想，实际比特流还包含概率编码和格式属性。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:LZNT1%20Decompress",
    "capabilityIds": [
      "op:LZNT1%20Decompress"
    ],
    "relatedIds": [
      "op:LZNT1%20Decompress"
    ],
    "topicGroup": "files",
    "title": "LZNT1解压",
    "summary": "LZNT1 是微软的 LZ77 变体，以独立小块组织数据；每块头说明是否压缩和块内长度。",
    "aliases": [
      "LZNT1",
      "NTFS"
    ],
    "sources": [
      {
        "id": "xca",
        "title": "MS-XCA：Xpress 压缩算法",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/",
        "language": "en",
        "kind": "standard",
        "locator": "Plain LZ77、LZ77+Huffman 与 LZNT1"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LZNT1 Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LZNT1 Decompress"
      }
    ],
    "sections": [
      {
        "title": "4096 字节块内的重复引用",
        "paragraphs": [
          "LZNT1 是微软的 LZ77 变体，以独立小块组织数据；每块头说明是否压缩和块内长度。",
          "压缩块包含标志位组、字面字节和长度/距离 token；token 的位分配随块内位置变化。解压按块恢复原始字节。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "不要与 XPRESS、ZIP 的 DEFLATE 混用；NTFS 压缩相关数据还可能有外层文件系统结构。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "某 token 指示向后距离 3、复制长度 6；已输出 ABC",
            "output": "接着输出 ABCABC",
            "explanation": "这是回溯复制规则，实际 token 要按所在位置的位宽解析。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:LZString%20Compress",
    "capabilityIds": [
      "pair:LZString%20Compress"
    ],
    "relatedIds": [
      "pair:LZString%20Compress"
    ],
    "topicGroup": "files",
    "title": "LZString 压缩与解压",
    "summary": "LZ-String 为 JavaScript 字符串设计可变宽度的字典编码，提供 UTF-16、Base64 等不同输出形式。",
    "aliases": [
      "LZ-String",
      "UTF-16"
    ],
    "sources": [
      {
        "id": "lzstring",
        "title": "LZ-String 官方指南",
        "publisher": "Pieroxy",
        "url": "https://pieroxy.net/blog/pages/lz-string/guide.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "UTF-16 字符串与输出形式"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LZString Compress / LZString Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LZString Compress / LZString Decompress"
      }
    ],
    "sections": [
      {
        "title": "面向 JavaScript 字符串的字典编码",
        "paragraphs": [
          "LZ-String 为 JavaScript 字符串设计可变宽度的字典编码，提供 UTF-16、Base64 等不同输出形式。",
          "字典随读取的字符片段增长，输出保存字典编号；输出包装方式不同，必须用对应的解压方法读取。"
        ],
        "sourceIds": [
          "lzstring",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它不是任意文件的通用 LZMA 或 gzip；编码成 Base64 也只是包装压缩结果，不是加密。"
        ],
        "sourceIds": [
          "lzstring",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "同一字符串压缩为 Base64 形式，再按同一形式解压",
            "output": "恢复同一字符串",
            "explanation": "切换到 UTF-16 解压方法不保证能解释 Base64 文本。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XPRESS%20Decompress",
    "capabilityIds": [
      "op:XPRESS%20Decompress"
    ],
    "relatedIds": [
      "op:XPRESS%20Decompress"
    ],
    "topicGroup": "files",
    "title": "XPRESS解压",
    "summary": "XPRESS Plain LZ77 使用标志位区分字面字节和向后匹配，把重复片段改写为偏移与长度。",
    "aliases": [
      "XPRESS",
      "Plain LZ77"
    ],
    "sources": [
      {
        "id": "xca",
        "title": "MS-XCA：Xpress 压缩算法",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/",
        "language": "en",
        "kind": "standard",
        "locator": "Plain LZ77、LZ77+Huffman 与 LZNT1"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XPRESS Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "XPRESS Decompress"
      }
    ],
    "sections": [
      {
        "title": "Plain LZ77 的字面与匹配",
        "paragraphs": [
          "XPRESS Plain LZ77 使用标志位区分字面字节和向后匹配，把重复片段改写为偏移与长度。",
          "解压遇字面就输出原字节，遇匹配就从已输出内容按距离复制；长度字段可以带扩展信息。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它没有 XPRESS Huffman 版本的熵编码层，两种算法虽然名称相似也不能混用。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "已输出 ABC，匹配距离 3、长度 3",
            "output": "继续得到 ABC，合计 ABCABC",
            "explanation": "复制源在输出缓冲区，而不是输入压缩字节的位置。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XPRESS%20LZ77%2BHuffman%20Decompress",
    "capabilityIds": [
      "op:XPRESS%20LZ77%2BHuffman%20Decompress"
    ],
    "relatedIds": [
      "op:XPRESS%20LZ77%2BHuffman%20Decompress"
    ],
    "topicGroup": "files",
    "title": "XPRESS LZ77+Huffman解压",
    "summary": "XPRESS LZ77+Huffman 在重复字符串匹配之外增加 Huffman 编码，使符号按频率使用不同长度的编码。",
    "aliases": [
      "XPRESS Huffman"
    ],
    "sources": [
      {
        "id": "xca",
        "title": "MS-XCA：Xpress 压缩算法",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/",
        "language": "en",
        "kind": "standard",
        "locator": "Plain LZ77、LZ77+Huffman 与 LZNT1"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XPRESS LZ77+Huffman Decompress"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "XPRESS LZ77+Huffman Decompress"
      }
    ],
    "sections": [
      {
        "title": "先解码符号再展开重复串",
        "paragraphs": [
          "XPRESS LZ77+Huffman 在重复字符串匹配之外增加 Huffman 编码，使符号按频率使用不同长度的编码。",
          "解压先恢复块的 Huffman 表，读取符号，再解释字面值或匹配长度/距离并复制输出。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "不能用 Plain XPRESS 的标志位规则直接读取此流；Huffman 表损坏会影响整个块。"
        ],
        "sourceIds": [
          "xca",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "编码表给常见字面值较短码、少见字面值较长码",
            "output": "先按表恢复字面值，再按 LZ77 规则展开匹配",
            "explanation": "这是两个层次的还原，实际表由输入数据块提供。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Tar",
    "capabilityIds": [
      "pair:Tar"
    ],
    "relatedIds": [
      "pair:Tar"
    ],
    "topicGroup": "files",
    "title": "Tar",
    "summary": "TAR 把文件名、属性、大小等头信息和成员内容顺序放进一个归档；基础记录大小为 512 字节。",
    "aliases": [
      "TAR",
      "归档",
      "打包"
    ],
    "sources": [
      {
        "id": "tar",
        "title": "GNU tar 的标准格式",
        "publisher": "GNU 项目",
        "url": "https://www.gnu.org/software/tar/manual/html_node/Standard.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "512 字节头与数据记录"
      },
      {
        "id": "tar-cn",
        "title": "文件压缩：tar打包后再gzip压缩",
        "publisher": "阿里云帮助中心",
        "url": "https://help.aliyun.com/zh/ecs/user-guide/file-compression",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "Windows压缩tar.gz的两步流程"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Tar / Untar"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Tar / Untar"
      }
    ],
    "sections": [
      {
        "title": "归档记录与压缩算法的区别",
        "paragraphs": [
          "TAR 把文件名、属性、大小等头信息和成员内容顺序放进一个归档；基础记录大小为 512 字节。",
          "每个头后面接成员数据并补齐到 512 字节边界；后续成员继续排列。打包不会天然压缩成员内容；本工具 Tar 入口一次创建一个成员。"
        ],
        "sourceIds": [
          "tar",
          "tar-cn",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "tar.gz 是 TAR 外面再套 gzip；解包前要先还原对应压缩层，文件名不等于真实路径许可。"
        ],
        "sourceIds": [
          "tar",
          "tar-cn",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "一个成员内容长度 600 字节",
            "output": "内容记录占用 1024 字节，加上至少 512 字节头",
            "explanation": "600 需要两块 512 字节；具体扩展格式可能再加头。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Zip",
    "capabilityIds": [
      "op:Zip"
    ],
    "relatedIds": [
      "op:Zip"
    ],
    "topicGroup": "files",
    "title": "ZIP 压缩",
    "summary": "ZIP 将成员分别压缩或原样存储，并维护中央目录；这允许同一归档内每个成员使用自己的压缩方法。",
    "aliases": [
      "ZIP",
      "PKZIP",
      "Store"
    ],
    "sources": [
      {
        "id": "zip",
        "title": "ZIP 文件格式 APPNOTE",
        "publisher": "PKWARE",
        "url": "https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT",
        "language": "en",
        "kind": "standard",
        "locator": "本地文件头、中央目录与结束记录"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Zip"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Compression.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Zip"
      }
    ],
    "sections": [
      {
        "title": "独立成员与中央目录的容器",
        "paragraphs": [
          "ZIP 将成员分别压缩或原样存储，并维护中央目录；这允许同一归档内每个成员使用自己的压缩方法。",
          "本操作从一份输入建立一个指定名称的成员。Deflate 方法压缩内容，Store 方法保持成员字节。密码与注释是另外的参数。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "压缩与加密不是同一件事；本入口创建单成员 ZIP，不代表所有 ZIP 扩展和加密方式均受支持。"
        ],
        "sourceIds": [
          "zip",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Filename=note.txt；Store；输入 ASCII ARG",
            "output": "归档成员 note.txt 的数据仍为 41 52 47",
            "explanation": "ZIP 仍会增加文件头和目录，所以归档会比三字节原文大。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Adler-32%20Checksum",
    "capabilityIds": [
      "op:Adler-32%20Checksum"
    ],
    "relatedIds": [
      "op:Adler-32%20Checksum"
    ],
    "topicGroup": "files",
    "title": "Adler-32校验和",
    "summary": "Adler-32 使用两个和：s1 从 1 开始累计字节，s2 从 0 开始累计每一步的 s1，二者都模 65521。",
    "aliases": [
      "Adler32"
    ],
    "sources": [
      {
        "id": "rfc1950",
        "title": "RFC 1950：ZLIB 压缩格式",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1950.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Adler-32 Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Adler-32 Checksum"
      }
    ],
    "sections": [
      {
        "title": "两次累加与素数模数",
        "paragraphs": [
          "Adler-32 使用两个和：s1 从 1 开始累计字节，s2 从 0 开始累计每一步的 s1，二者都模 65521。",
          "最终值为 s2×65536＋s1。第二个和让位置影响结果，常作为 zlib 解压后完整性检查。"
        ],
        "sourceIds": [
          "rfc1950",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "这不是密码摘要；很短的数据分布和抗篡改能力都不适合安全认证。"
        ],
        "sourceIds": [
          "rfc1950",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc：97、98、99",
            "output": "s1=295，s2=589；024D0127",
            "explanation": "s1 依次 98、196、295；s2=98+196+295=589。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CRC%20Checksum",
    "capabilityIds": [
      "op:CRC%20Checksum"
    ],
    "relatedIds": [
      "op:CRC%20Checksum"
    ],
    "topicGroup": "files",
    "title": "CRC校验和",
    "summary": "CRC 把数据比特当作二元多项式，以约定生成多项式做除法，使用余数生成校验字段。",
    "aliases": [
      "CRC",
      "多项式",
      "冗余校验"
    ],
    "sources": [
      {
        "id": "png",
        "title": "PNG 第三版规范",
        "publisher": "W3C",
        "url": "https://www.w3.org/TR/png-3/",
        "language": "en",
        "kind": "standard",
        "locator": "文件签名、数据块与 CRC"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CRC Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "CRC Checksum"
      }
    ],
    "sections": [
      {
        "title": "多项式余数与参数集",
        "paragraphs": [
          "CRC 把数据比特当作二元多项式，以约定生成多项式做除法，使用余数生成校验字段。",
          "宽度、多项式、初值、输入输出反射和最终异或共同定义一种 CRC；同样叫 CRC-32 也可能有不同结果。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "CRC 适合误码检测，容易人为调整，不能验证发送者身份或防止恶意篡改。"
        ],
        "sourceIds": [
          "png",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII 123456789；CRC-32/ISO-HDLC",
            "output": "CBF43926",
            "explanation": "这是常用检查向量，换 CRC-32C 等参数会得到不同值。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fletcher-8%20Checksum",
    "capabilityIds": [
      "op:Fletcher-8%20Checksum"
    ],
    "relatedIds": [
      "op:Fletcher-8%20Checksum"
    ],
    "topicGroup": "files",
    "title": "Fletcher-8校验和",
    "summary": "Fletcher-8 使用两级累计和，将数据顺序的信息加入校验；本入口返回 8 位结果。",
    "aliases": [
      "Fletcher8"
    ],
    "sources": [
      {
        "id": "rfc1146",
        "title": "RFC 1146：Fletcher 校验和",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1146.txt",
        "language": "en",
        "kind": "standard",
        "locator": "APPENDIX I/II；RFC按累加器位宽命名，本工具按总输出宽度命名"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-8 Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-8 Checksum"
      }
    ],
    "sections": [
      {
        "title": "两个累计和形成 8 位校验",
        "paragraphs": [
          "Fletcher-8 使用两级累计和，将数据顺序的信息加入校验；本入口返回 8 位结果。",
          "本实现逐字节累加，两个和各模 15，最终用两个 4 位字段拼成 8 位结果。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本工具名称指总输出位数；RFC 1146 的 8/16-bit 指单个累加器位宽，两种命名不能直接等同。分组与端序也必须一致。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "01 02",
            "output": "43",
            "explanation": "两个输入值为 1、2：s1 最终为 3，s2=1+3=4。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fletcher-16%20Checksum",
    "capabilityIds": [
      "op:Fletcher-16%20Checksum"
    ],
    "relatedIds": [
      "op:Fletcher-16%20Checksum"
    ],
    "topicGroup": "files",
    "title": "Fletcher-16校验和",
    "summary": "Fletcher-16 使用两级累计和，将数据顺序的信息加入校验；本入口返回 16 位结果。",
    "aliases": [
      "Fletcher16"
    ],
    "sources": [
      {
        "id": "rfc1146",
        "title": "RFC 1146：Fletcher 校验和",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1146.txt",
        "language": "en",
        "kind": "standard",
        "locator": "APPENDIX I/II；RFC按累加器位宽命名，本工具按总输出宽度命名"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-16 Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-16 Checksum"
      }
    ],
    "sections": [
      {
        "title": "两个累计和形成 16 位校验",
        "paragraphs": [
          "Fletcher-16 使用两级累计和，将数据顺序的信息加入校验；本入口返回 16 位结果。",
          "每字节更新 s1=(s1+x) mod 255，再更新 s2=(s2+s1) mod 255，最终 s2 在高八位、s1 在低八位。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本工具名称指总输出位数；RFC 1146 的 8/16-bit 指单个累加器位宽，两种命名不能直接等同。分组与端序也必须一致。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "01 02",
            "output": "0403",
            "explanation": "两个输入值为 1、2：s1 最终为 3，s2=1+3=4。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fletcher-32%20Checksum",
    "capabilityIds": [
      "op:Fletcher-32%20Checksum"
    ],
    "relatedIds": [
      "op:Fletcher-32%20Checksum"
    ],
    "topicGroup": "files",
    "title": "Fletcher-32校验和",
    "summary": "Fletcher-32 使用两级累计和，将数据顺序的信息加入校验；本入口返回 32 位结果。",
    "aliases": [
      "Fletcher32"
    ],
    "sources": [
      {
        "id": "rfc1146",
        "title": "RFC 1146：Fletcher 校验和",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1146.txt",
        "language": "en",
        "kind": "standard",
        "locator": "APPENDIX I/II；RFC按累加器位宽命名，本工具按总输出宽度命名"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-32 Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-32 Checksum"
      }
    ],
    "sections": [
      {
        "title": "两个累计和形成 32 位校验",
        "paragraphs": [
          "Fletcher-32 使用两级累计和，将数据顺序的信息加入校验；本入口返回 32 位结果。",
          "本实现以小端 16 位字读取输入，两个累加和各模 65535，最终拼成高低两个 16 位字段。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本工具名称指总输出位数；RFC 1146 的 8/16-bit 指单个累加器位宽，两种命名不能直接等同。分组与端序也必须一致。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "01 00 02 00",
            "output": "00040003",
            "explanation": "两个输入值为 1、2：s1 最终为 3，s2=1+3=4。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fletcher-64%20Checksum",
    "capabilityIds": [
      "op:Fletcher-64%20Checksum"
    ],
    "relatedIds": [
      "op:Fletcher-64%20Checksum"
    ],
    "topicGroup": "files",
    "title": "Fletcher-64校验和",
    "summary": "Fletcher-64 使用两级累计和，将数据顺序的信息加入校验；本入口返回 64 位结果。",
    "aliases": [
      "Fletcher64"
    ],
    "sources": [
      {
        "id": "rfc1146",
        "title": "RFC 1146：Fletcher 校验和",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1146.txt",
        "language": "en",
        "kind": "standard",
        "locator": "APPENDIX I/II；RFC按累加器位宽命名，本工具按总输出宽度命名"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-64 Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Fletcher-64 Checksum"
      }
    ],
    "sections": [
      {
        "title": "两个累计和形成 64 位校验",
        "paragraphs": [
          "Fletcher-64 使用两级累计和，将数据顺序的信息加入校验；本入口返回 64 位结果。",
          "本实现以小端 32 位字读取输入，两个累加和各模 2³²−1，输出先 s2 后 s1，各占 32 位。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本工具名称指总输出位数；RFC 1146 的 8/16-bit 指单个累加器位宽，两种命名不能直接等同。分组与端序也必须一致。"
        ],
        "sourceIds": [
          "rfc1146",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "01 00 00 00 02 00 00 00",
            "output": "0000000400000003",
            "explanation": "两个输入值为 1、2：s1 最终为 3，s2=1+3=4。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:TCP%2FIP%20Checksum",
    "capabilityIds": [
      "op:TCP%2FIP%20Checksum"
    ],
    "relatedIds": [
      "op:TCP%2FIP%20Checksum"
    ],
    "topicGroup": "files",
    "title": "TCP/IP 校验和",
    "summary": "Internet 校验和将数据按 16 位字累加，把高位进位回卷加到低 16 位，最后按位取反。",
    "aliases": [
      "Internet checksum",
      "反码和"
    ],
    "sources": [
      {
        "id": "rfc1071",
        "title": "RFC 1071：Internet 校验和",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1071.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "TCP/IP Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "TCP/IP Checksum"
      }
    ],
    "sections": [
      {
        "title": "十六位反码和与进位回卷",
        "paragraphs": [
          "Internet 校验和将数据按 16 位字累加，把高位进位回卷加到低 16 位，最后按位取反。",
          "奇数长度时计算用零补齐；TCP/UDP 的实际校验还包括伪首部，因此对裸载荷计算不能代替完整包校验。"
        ],
        "sourceIds": [
          "rfc1071",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "此入口计算输入字节的校验；若要验证传输层字段，须提供正确头、载荷和伪首部布局。"
        ],
        "sourceIds": [
          "rfc1071",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "网络字节 00 01 00 02",
            "output": "FFFC",
            "explanation": "16 位和为 0003，按位取反为 FFFC。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MD5",
    "capabilityIds": [
      "op:MD5"
    ],
    "relatedIds": [
      "op:MD5"
    ],
    "topicGroup": "files",
    "title": "MD5 哈希",
    "summary": "MD5 将消息填充到 512 位分块，加入原文长度，经过四轮非线性混合生成 128 位摘要。",
    "aliases": [
      "MD5",
      "message digest"
    ],
    "sources": [
      {
        "id": "rfc1321",
        "title": "RFC 1321：MD5",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1321.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "md5",
        "title": "MD5 类",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.security.cryptography.md5",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "备注：摘要与碰撞问题"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "MD5"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "MD5"
      }
    ],
    "sections": [
      {
        "title": "512 位分块与 128 位摘要",
        "paragraphs": [
          "MD5 将消息填充到 512 位分块，加入原文长度，经过四轮非线性混合生成 128 位摘要。",
          "它使用小端 32 位字，64 步更新四个工作寄存器。摘要展示为十六进制时需要 32 个字符。"
        ],
        "sourceIds": [
          "rfc1321",
          "md5",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "MD5 已存在实际碰撞，不适合安全签名或抗篡改证明；仍可用于旧格式兼容和已知摘要核对。"
        ],
        "sourceIds": [
          "rfc1321",
          "md5",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "900150983cd24fb0d6963f7d28e17f72",
            "explanation": "输入只有 61 62 63，不包含结尾换行。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SHA2",
    "capabilityIds": [
      "op:SHA2"
    ],
    "relatedIds": [
      "op:SHA2"
    ],
    "topicGroup": "files",
    "title": "SHA2 哈希",
    "summary": "SHA-2 是一组分块密码哈希：SHA-224/256 使用 32 位字和 512 位块，SHA-384/512 使用 64 位字和 1024 位块。",
    "aliases": [
      "SHA-256",
      "SHA-512",
      "SHA-2"
    ],
    "sources": [
      {
        "id": "rfc6234",
        "title": "RFC 6234：SHA 系列",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6234.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "sha2",
        "title": "SHA-256 类",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.security.cryptography.sha256",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "哈希长度与 HashData"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA2"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA2"
      }
    ],
    "sections": [
      {
        "title": "32 位与 64 位分支的摘要族",
        "paragraphs": [
          "SHA-2 是一组分块密码哈希：SHA-224/256 使用 32 位字和 512 位块，SHA-384/512 使用 64 位字和 1024 位块。",
          "填充时追加 1、零和原始长度，再用消息扩展、轮常量与寄存器更新压缩每块。输出长度由所选算法确定，不是同一摘要任意截短。"
        ],
        "sourceIds": [
          "rfc6234",
          "sha2",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "先明确 SHA-256、SHA-512 或截断变体；输入编码和换行也会改变摘要。"
        ],
        "sourceIds": [
          "rfc6234",
          "sha2",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；SHA-256",
            "output": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            "explanation": "256 位对应 32 字节或 64 个十六进制字符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Ascon%20Hash",
    "capabilityIds": [
      "op:Ascon%20Hash"
    ],
    "relatedIds": [
      "op:Ascon%20Hash"
    ],
    "topicGroup": "files",
    "title": "Ascon 哈希",
    "summary": "本操作实现 NIST SP 800-232 标准的 Ascon-Hash256，使用 320 位状态和轻量排列生成固定 256 位摘要。",
    "aliases": [
      "Ascon-Hash256",
      "SP800-232"
    ],
    "sources": [
      {
        "id": "ascon",
        "title": "Ascon 算法规范",
        "publisher": "Ascon 设计团队",
        "url": "https://ascon.isec.tugraz.at/specification.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Ascon-Hash / Hasha 与版本差异"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Ascon Hash"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Ascon Hash"
      }
    ],
    "sections": [
      {
        "title": "轻量海绵结构的固定输出",
        "paragraphs": [
          "本操作实现 NIST SP 800-232 标准的 Ascon-Hash256，使用 320 位状态和轻量排列生成固定 256 位摘要。",
          "状态由五个 64 位字组成；输入以 64 位块吸收，进行 12 轮排列，再按 64 位块挤出摘要。标准版与早期竞赛提交版的初始化和位序不同。"
        ],
        "sourceIds": [
          "ascon",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "不能把早期 Ascon-Hash 测试向量当成标准版的结果；此功能是哈希，不是 Ascon 加密。"
        ],
        "sourceIds": [
          "ascon",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Ascon-Hash256 固定输出长度",
            "output": "256 位 = 32 字节 = 64 个十六进制字符",
            "explanation": "四次 64 位输出块合成摘要，长度本身不透露原文。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:BLAKE2b",
    "capabilityIds": [
      "op:BLAKE2b"
    ],
    "relatedIds": [
      "op:BLAKE2b"
    ],
    "topicGroup": "files",
    "title": "BLAKE2b 哈希",
    "summary": "BLAKE2b 使用 64 位字的加法、异或和旋转混合，按 128 字节块处理，最多输出 64 字节。",
    "aliases": [
      "BLAKE2b"
    ],
    "sources": [
      {
        "id": "rfc7693",
        "title": "RFC 7693：BLAKE2",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7693.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE2b"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE2b"
      }
    ],
    "sections": [
      {
        "title": "64 位字、可选密钥与长度参数",
        "paragraphs": [
          "BLAKE2b 使用 64 位字的加法、异或和旋转混合，按 128 字节块处理，最多输出 64 字节。",
          "参数块把摘要长度和密钥长度纳入初始化；可选密钥模式直接得到带密钥的认证结果，而不必另套 HMAC。"
        ],
        "sourceIds": [
          "rfc7693",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "BLAKE2b-256 不等于 BLAKE2b-512 简单截前 32 字节；长度本身参与算法。"
        ],
        "sourceIds": [
          "rfc7693",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；BLAKE2b-512；无密钥",
            "output": "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923",
            "explanation": "默认 64 字节结果写成 128 个十六进制字符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:BLAKE2s",
    "capabilityIds": [
      "op:BLAKE2s"
    ],
    "relatedIds": [
      "op:BLAKE2s"
    ],
    "topicGroup": "files",
    "title": "BLAKE2s 哈希",
    "summary": "BLAKE2s 使用 32 位字，按 64 字节块处理，最多输出 32 字节，更适合较小字长平台。",
    "aliases": [
      "BLAKE2s"
    ],
    "sources": [
      {
        "id": "rfc7693",
        "title": "RFC 7693：BLAKE2",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7693.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE2s"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE2s"
      }
    ],
    "sections": [
      {
        "title": "32 位字与较小分块",
        "paragraphs": [
          "BLAKE2s 使用 32 位字，按 64 字节块处理，最多输出 32 字节，更适合较小字长平台。",
          "混合函数同样使用模加、异或和旋转，但字宽、旋转量及轮数与 BLAKE2b 不同；长度和密钥可纳入参数。"
        ],
        "sourceIds": [
          "rfc7693",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "BLAKE2s 与 BLAKE2b 即使输出长度相同也不是同一算法；不能交叉核对结果。"
        ],
        "sourceIds": [
          "rfc7693",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；BLAKE2s-256；无密钥",
            "output": "508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982",
            "explanation": "输出 32 字节，十六进制为 64 字符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:BLAKE3",
    "capabilityIds": [
      "op:BLAKE3"
    ],
    "relatedIds": [
      "op:BLAKE3"
    ],
    "topicGroup": "files",
    "title": "BLAKE3 哈希",
    "summary": "BLAKE3 把输入分成最多 1024 字节的块，对块和父节点做带域标记的混合，形成可并行计算的树。",
    "aliases": [
      "BLAKE3",
      "哈希树"
    ],
    "sources": [
      {
        "id": "blake3",
        "title": "The BLAKE3 Hashing Framework",
        "publisher": "BLAKE3 设计团队 / C2SP",
        "url": "https://c2sp.org/BLAKE3@v1.0.0",
        "language": "en",
        "kind": "author-spec",
        "locator": "分块树、默认摘要与扩展输出"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE3"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "BLAKE3"
      }
    ],
    "sections": [
      {
        "title": "1024 字节分块组成哈希树",
        "paragraphs": [
          "BLAKE3 把输入分成最多 1024 字节的块，对块和父节点做带域标记的混合，形成可并行计算的树。",
          "它可输出任意长度；规范默认 32 字节，本工具 Size 以字节计且默认 16。密钥模式与无密钥模式是不同用途。"
        ],
        "sourceIds": [
          "blake3",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "本工具 16 字节默认值不等于规范默认 256 位；比较外部摘要时先对齐输出长度。"
        ],
        "sourceIds": [
          "blake3",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Size=16 字节",
            "output": "输出十六进制长度 32 字符",
            "explanation": "每字节两位；设置 32 字节才是常见 256 位摘要长度。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:GOST%20Hash",
    "capabilityIds": [
      "op:GOST%20Hash"
    ],
    "relatedIds": [
      "op:GOST%20Hash"
    ],
    "topicGroup": "files",
    "title": "GOST 哈希",
    "summary": "本入口可选 1994 版 GOST 摘要或 2012 版 Streebog；1994 版用基于 GOST 分组密码的压缩过程输出 256 位。",
    "aliases": [
      "GOST94",
      "GOST R34.11-94"
    ],
    "sources": [
      {
        "id": "rfc5831",
        "title": "RFC 5831：GOST R 34.11-94",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5831.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "rfc6986",
        "title": "RFC 6986：GOST R 34.11-2012",
        "publisher": "RFC Editor",
        "url": "https://www.rfc-editor.org/rfc/rfc6986.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Hash"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Hash"
      }
    ],
    "sections": [
      {
        "title": "1994 与 2012 两版 GOST 摘要",
        "paragraphs": [
          "本入口可选 1994 版 GOST 摘要或 2012 版 Streebog；1994 版用基于 GOST 分组密码的压缩过程输出 256 位。",
          "1994 版按 256 位块处理，并加入长度和块累加和；2012 版改用 512 位块及替换、排列、线性变换，并可选 256/512 位。"
        ],
        "sourceIds": [
          "rfc5831",
          "rfc6986",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "必须先明确 Algorithm、年份和长度；1994 版的替换表也影响兼容，不能只按“GOST”这个名称比对。"
        ],
        "sourceIds": [
          "rfc5831",
          "rfc6986",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "GOST R 34.11-94 的 256 位摘要",
            "output": "32 字节；64 个十六进制字符",
            "explanation": "这里只推演长度，完整结果还依赖输入和算法参数。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HAS-160",
    "capabilityIds": [
      "op:HAS-160"
    ],
    "relatedIds": [
      "op:HAS-160"
    ],
    "topicGroup": "files",
    "title": "HAS-160 哈希",
    "summary": "HAS-160 是韩国数字签名体系相关的 160 位摘要算法，以 512 位输入块迭代更新状态。",
    "aliases": [
      "HAS160"
    ],
    "sources": [
      {
        "id": "rhash",
        "title": "RHash 支持的哈希函数",
        "publisher": "RHash 项目",
        "url": "https://sourceforge.net/p/rhash/wiki/HashFunctions/",
        "language": "en",
        "kind": "author-spec",
        "locator": "HAS-160、Snefru、Whirlpool 的规格与长度"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "HAS-160"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "HAS-160"
      }
    ],
    "sections": [
      {
        "title": "与 SHA-1 相关但规则不同",
        "paragraphs": [
          "HAS-160 是韩国数字签名体系相关的 160 位摘要算法，以 512 位输入块迭代更新状态。",
          "它采用 32 位工作字和 80 轮处理，消息扩展、循环移位和字序与 SHA-1 不同；不能因长度相同直接当作 SHA-1。"
        ],
        "sourceIds": [
          "rhash",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "已有 HAS-160 摘要只能用同一算法核对；工具给出的旧算法支持不代表现代安全推荐。"
        ],
        "sourceIds": [
          "rhash",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "HAS-160 输出长度 160 位",
            "output": "20 字节，40 个十六进制字符",
            "explanation": "160/8=20；每字节用两位十六进制。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Keccak",
    "capabilityIds": [
      "op:Keccak"
    ],
    "relatedIds": [
      "op:Keccak"
    ],
    "topicGroup": "files",
    "title": "Keccak 哈希",
    "summary": "Keccak 通过海绵结构吸收消息并挤出摘要：一部分状态用于输入输出，另一部分提供容量。",
    "aliases": [
      "Keccak256",
      "海绵"
    ],
    "sources": [
      {
        "id": "keccak",
        "title": "Keccak 规范与说明",
        "publisher": "Keccak 设计团队",
        "url": "https://keccak.team/keccak_specs_summary.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "海绵函数、状态排列与填充"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Keccak"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Keccak"
      }
    ],
    "sections": [
      {
        "title": "原始海绵与 SHA-3 的域区分",
        "paragraphs": [
          "Keccak 通过海绵结构吸收消息并挤出摘要：一部分状态用于输入输出，另一部分提供容量。",
          "本操作选择容量 c=2d 的 Keccak 变体；相同摘要长度的 SHA-3 使用不同域分隔/填充，所以二者结果不同。"
        ],
        "sourceIds": [
          "keccak",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "Keccak-256 和 SHA3-256 不是同名同结果的替换；外部协议指定哪一种就必须用哪一种。"
        ],
        "sourceIds": [
          "keccak",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Keccak-256：输出长度 d=256",
            "output": "容量 c=512；1600 位状态中的速率 r=1088",
            "explanation": "r+c=1600；速率决定每次吸收多少比特。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:LM%20Hash",
    "capabilityIds": [
      "op:LM%20Hash"
    ],
    "relatedIds": [
      "op:LM%20Hash"
    ],
    "topicGroup": "files",
    "title": "LM 哈希",
    "summary": "LM 哈希是旧 Windows 口令表示：将口令转为大写并补到 14 字节，再拆成两段 7 字节。",
    "aliases": [
      "LAN Manager",
      "LM"
    ],
    "sources": [
      {
        "id": "ntlm",
        "title": "NTLM v1 Authentication",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/464551a8-9fc4-428e-b3d3-bc5bfb2e73a5",
        "language": "en",
        "kind": "standard",
        "locator": "NTOWFv1 与 LMOWFv1"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LM Hash"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LM Hash"
      }
    ],
    "sections": [
      {
        "title": "大写口令分段后的 DES 结果",
        "paragraphs": [
          "LM 哈希是旧 Windows 口令表示：将口令转为大写并补到 14 字节，再拆成两段 7 字节。",
          "两段各扩展为 DES 密钥，分别加密固定的八字节常量，再连接两个结果为 16 字节。它不保存大小写区别。"
        ],
        "sourceIds": [
          "ntlm",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "超过长度、非 ASCII 字符和代码页会带来兼容问题；LM 已不适合安全口令存储。"
        ],
        "sourceIds": [
          "ntlm",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "口令 password 与 PASSWORD",
            "output": "LM 规则下得到相同表示",
            "explanation": "因为算法先统一转为大写；这揭示了大小写信息丢失。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:NT%20Hash",
    "capabilityIds": [
      "op:NT%20Hash"
    ],
    "relatedIds": [
      "op:NT%20Hash"
    ],
    "topicGroup": "files",
    "title": "NT 哈希",
    "summary": "NT 哈希是口令的 UTF-16LE 字节经过 MD4 后的 128 位结果；大小写和所有编码字节都参与。",
    "aliases": [
      "NTLM",
      "NTOWFv1",
      "UTF-16LE"
    ],
    "sources": [
      {
        "id": "ntlm",
        "title": "NTLM v1 Authentication",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/464551a8-9fc4-428e-b3d3-bc5bfb2e73a5",
        "language": "en",
        "kind": "standard",
        "locator": "NTOWFv1 与 LMOWFv1"
      },
      {
        "id": "rfc1320",
        "title": "RFC 1320：MD4",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1320.txt",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "NT Hash"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "NT Hash"
      }
    ],
    "sections": [
      {
        "title": "UTF-16LE 口令经过 MD4",
        "paragraphs": [
          "NT 哈希是口令的 UTF-16LE 字节经过 MD4 后的 128 位结果；大小写和所有编码字节都参与。",
          "先将口令转换为小端 UTF-16，再计算 MD4，输出通常写作 32 个十六进制字符。不要先计算 UTF-8 的 MD4。"
        ],
        "sourceIds": [
          "ntlm",
          "rfc1320",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "NT 哈希不是完整 NTLM 身份验证报文，也没有每用户随机盐；它不适合新系统保存口令。"
        ],
        "sourceIds": [
          "ntlm",
          "rfc1320",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "口令 A",
            "output": "MD4 的输入字节是 41 00",
            "explanation": "字符 A 的 UTF-16LE 编码是两字节，不能只输入 41。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MD2",
    "capabilityIds": [
      "op:MD2"
    ],
    "relatedIds": [
      "op:MD2"
    ],
    "topicGroup": "files",
    "title": "MD2 哈希",
    "summary": "MD2 是 128 位摘要算法，按 16 字节处理并使用固定替换表混合字节。",
    "aliases": [
      "MD2"
    ],
    "sources": [
      {
        "id": "rfc1319",
        "title": "RFC 1319：MD2",
        "publisher": "RFC Editor",
        "url": "https://www.rfc-editor.org/rfc/rfc1319.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "MD2"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "MD2"
      }
    ],
    "sections": [
      {
        "title": "16 字节分块、替换表与校验块",
        "paragraphs": [
          "MD2 是 128 位摘要算法，按 16 字节处理并使用固定替换表混合字节。",
          "它先用补字节填满最后一块，再追加一个依赖消息的 16 字节校验块，最后更新内部状态得到摘要；结构与 MD4/MD5 不同。"
        ],
        "sourceIds": [
          "rfc1319",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "MD2 是遗留算法，不能因摘要长度与 MD5 相同就认为兼容或安全。"
        ],
        "sourceIds": [
          "rfc1319",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "da853b0d3f88d99b30283a69e6ded6bb",
            "explanation": "RFC 1319 测试向量；原文为三个 ASCII 字节。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MD4",
    "capabilityIds": [
      "op:MD4"
    ],
    "relatedIds": [
      "op:MD4"
    ],
    "topicGroup": "files",
    "title": "MD4 哈希",
    "summary": "MD4 将消息填充为 512 位块，使用小端 32 位字和三轮压缩，最终输出 128 位。",
    "aliases": [
      "MD4"
    ],
    "sources": [
      {
        "id": "rfc1320",
        "title": "RFC 1320：MD4",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1320.txt",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "MD4"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "MD4"
      }
    ],
    "sections": [
      {
        "title": "三轮混合的 128 位摘要",
        "paragraphs": [
          "MD4 将消息填充为 512 位块，使用小端 32 位字和三轮压缩，最终输出 128 位。",
          "填充追加 1 和零到合适长度，再加小端原文长度；三轮分别用不同逻辑函数、访问顺序和移位更新四个寄存器。"
        ],
        "sourceIds": [
          "rfc1320",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "MD4 已被密码分析破坏，只适合遗留协议或资料识别；不应用于新安全方案。"
        ],
        "sourceIds": [
          "rfc1320",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "a448017aaf21d8525fc10ae87aa6729d",
            "explanation": "RFC 1320 测试向量，换成 abc 加换行会改变结果。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MD6",
    "capabilityIds": [
      "op:MD6"
    ],
    "relatedIds": [
      "op:MD6"
    ],
    "topicGroup": "files",
    "title": "MD6 哈希",
    "summary": "MD6 将消息块按树形模式组合，使用面向 64 位字的压缩函数，便于长输入并行计算。",
    "aliases": [
      "MD6",
      "Merkle tree"
    ],
    "sources": [
      {
        "id": "md6",
        "title": "The MD6 hash function",
        "publisher": "Ronald Rivest 等 · MIT CSAIL",
        "url": "https://people.csail.mit.edu/rivest/pubs/RABCx08.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "树形模式与压缩函数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "MD6"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "MD6"
      }
    ],
    "sections": [
      {
        "title": "树形组合与可调摘要长度",
        "paragraphs": [
          "MD6 将消息块按树形模式组合，使用面向 64 位字的压缩函数，便于长输入并行计算。",
          "输出长度、树层级和可选密钥都参与计算；本工具默认输出 256 位、Levels=64。它是 SHA-3 竞赛候选，而非 SHA-3 标准。"
        ],
        "sourceIds": [
          "md6",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "改 Levels 或密钥就不能和原参数摘要直接比较；MD6 不是 MD5 的可互换升级模式。"
        ],
        "sourceIds": [
          "md6",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Size=256 位",
            "output": "摘要为 32 字节，十六进制 64 字符",
            "explanation": "此参数以位计，与本工具 BLAKE3 的字节长度参数不同。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MurmurHash3",
    "capabilityIds": [
      "op:MurmurHash3"
    ],
    "relatedIds": [
      "op:MurmurHash3"
    ],
    "topicGroup": "files",
    "title": "MurmurHash3 哈希",
    "summary": "MurmurHash3 为快速散列表设计，使用乘法、旋转和异或混合输入块，并在最后做雪崩混合。",
    "aliases": [
      "Murmur3",
      "非密码哈希"
    ],
    "sources": [
      {
        "id": "murmur",
        "title": "MurmurHash3 原始实现",
        "publisher": "Austin Appleby",
        "url": "https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp",
        "language": "en",
        "kind": "author-spec",
        "locator": "x86_32、x86_128、x64_128"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "MurmurHash3"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "MurmurHash3"
      }
    ],
    "sections": [
      {
        "title": "非密码散列的块混合与雪崩",
        "paragraphs": [
          "MurmurHash3 为快速散列表设计，使用乘法、旋转和异或混合输入块，并在最后做雪崩混合。",
          "本入口返回 32 位结果，种子改变初始状态；Convert to Signed 只改变同一 32 位模式的数字解释。"
        ],
        "sourceIds": [
          "murmur",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它不提供密码学抗碰撞或抗攻击保证；用于安全完整性应选密码摘要。"
        ],
        "sourceIds": [
          "murmur",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "32 位模式 FFFFFFFF",
            "output": "无符号为 4294967295；有符号为 −1",
            "explanation": "两个数字表示同一组 32 个比特，不是重新计算两个哈希。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RIPEMD",
    "capabilityIds": [
      "op:RIPEMD"
    ],
    "relatedIds": [
      "op:RIPEMD"
    ],
    "topicGroup": "files",
    "title": "RIPEMD 哈希",
    "summary": "RIPEMD 是一组摘要算法；RIPEMD-160 用两条并行链处理同一消息块，再合并更新状态。",
    "aliases": [
      "RIPEMD160"
    ],
    "sources": [
      {
        "id": "ripemd",
        "title": "RIPEMD-160 算法与测试向量",
        "publisher": "KU Leuven / RIPEMD 设计团队",
        "url": "https://homes.esat.kuleuven.be/~bosselae/ripemd160.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "并行双链与摘要长度"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RIPEMD"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "RIPEMD"
      }
    ],
    "sections": [
      {
        "title": "两条并行处理链的摘要族",
        "paragraphs": [
          "RIPEMD 是一组摘要算法；RIPEMD-160 用两条并行链处理同一消息块，再合并更新状态。",
          "不同分支采用不同逻辑函数、消息顺序和轮常量；本工具可选择 128、160、256、320 位，算法变体并非简单截断。"
        ],
        "sourceIds": [
          "ripemd",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "只有算法和位数一致才能核对摘要；不要把 160 位 RIPEMD 与 SHA-1 混同。"
        ],
        "sourceIds": [
          "ripemd",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；RIPEMD-160",
            "output": "8eb208f7e05d987a9b044a8e98c6b087f15a0bfc",
            "explanation": "160 位输出 40 个十六进制字符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SHA0",
    "capabilityIds": [
      "op:SHA0"
    ],
    "relatedIds": [
      "op:SHA0"
    ],
    "topicGroup": "files",
    "title": "SHA0 哈希",
    "summary": "SHA-0 通常指 1993 版 FIPS 180 的原始 SHA，使用 512 位消息块和 160 位状态输出。",
    "aliases": [
      "SHA-0",
      "SHA1993"
    ],
    "sources": [
      {
        "id": "sha0",
        "title": "FIPS 180：原版 SHA",
        "publisher": "NIST",
        "url": "https://csrc.nist.gov/pubs/fips/180/final",
        "language": "en",
        "kind": "standard",
        "locator": "1993 原版 SHA；已被替代"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA0"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA0"
      }
    ],
    "sections": [
      {
        "title": "1993 版 SHA 与后续版差在哪里",
        "paragraphs": [
          "SHA-0 通常指 1993 版 FIPS 180 的原始 SHA，使用 512 位消息块和 160 位状态输出。",
          "后续 SHA-1 在消息扩展中增加了一次循环左移；这个改动使相同消息的 SHA-0 和 SHA-1 结果不同。"
        ],
        "sourceIds": [
          "sha0",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "SHA-0 已被替代并有碰撞攻击，只用于历史协议识别，不能当作现代安全摘要。"
        ],
        "sourceIds": [
          "sha0",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "SHA-0 和 SHA-1 都输出 160 位",
            "output": "两者结果都为 40 个十六进制字符，但不能互换",
            "explanation": "长度相同不能推断算法相同。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SHA1",
    "capabilityIds": [
      "op:SHA1"
    ],
    "relatedIds": [
      "op:SHA1"
    ],
    "topicGroup": "files",
    "title": "SHA1 哈希",
    "summary": "SHA-1 将消息填充到 512 位块，扩展为 80 个工作字，再以逻辑函数、常量和循环移位更新五个 32 位寄存器。",
    "aliases": [
      "SHA-1"
    ],
    "sources": [
      {
        "id": "rfc6234",
        "title": "RFC 6234：SHA 系列",
        "publisher": "RFC Editor · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6234.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "sha1",
        "title": "SHA-1 函数",
        "publisher": "阿里云帮助中心",
        "url": "https://help.aliyun.com/zh/maxcompute/user-guide/sha1",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "返回值与示例"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA1"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA1"
      }
    ],
    "sections": [
      {
        "title": "五个工作字与 80 轮压缩",
        "paragraphs": [
          "SHA-1 将消息填充到 512 位块，扩展为 80 个工作字，再以逻辑函数、常量和循环移位更新五个 32 位寄存器。",
          "结果为 160 位；按标准顺序输出字节，常显示为 40 个十六进制字符。输入是原始字节而非页面显示格式。"
        ],
        "sourceIds": [
          "rfc6234",
          "sha1",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "SHA-1 已有实际碰撞，不适合新的安全签名；旧校验值核对须严格保持编码与换行。"
        ],
        "sourceIds": [
          "rfc6234",
          "sha1",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "a9993e364706816aba3e25717850c26c9cd0d89d",
            "explanation": "只计算三个字节 61 62 63。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SHA3",
    "capabilityIds": [
      "op:SHA3"
    ],
    "relatedIds": [
      "op:SHA3"
    ],
    "topicGroup": "files",
    "title": "SHA3 哈希",
    "summary": "SHA-3 是 FIPS 202 标准的 Keccak 海绵实例，以 1600 位状态进行吸收、排列和挤出，输出固定长度。",
    "aliases": [
      "SHA3-256",
      "SHA-3"
    ],
    "sources": [
      {
        "id": "sha3",
        "title": "FIPS 202：SHA-3 与 SHAKE",
        "publisher": "NIST",
        "url": "https://csrc.nist.gov/pubs/fips/202/final",
        "language": "en",
        "kind": "standard",
        "locator": "海绵结构、SHA3 与 XOF"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA3"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SHA3"
      }
    ],
    "sections": [
      {
        "title": "带域区分的 Keccak 海绵摘要",
        "paragraphs": [
          "SHA-3 是 FIPS 202 标准的 Keccak 海绵实例，以 1600 位状态进行吸收、排列和挤出，输出固定长度。",
          "SHA3-224/256/384/512 使用对应的速率和容量，并采用 SHA-3 的域区分填充；与 SHA-2 的分块压缩结构不同。"
        ],
        "sourceIds": [
          "sha3",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "SHA3-256 与原始 Keccak-256 不同；不是对 SHA-256 再运行一次哈希。"
        ],
        "sourceIds": [
          "sha3",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；SHA3-256",
            "output": "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
            "explanation": "256 位是固定输出长度。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Shake",
    "capabilityIds": [
      "op:Shake"
    ],
    "relatedIds": [
      "op:Shake"
    ],
    "topicGroup": "files",
    "title": "Shake 哈希",
    "summary": "SHAKE 是可扩展输出函数，可从海绵状态连续生成指定长度的字节；SHAKE128 和 SHAKE256 的名称对应安全强度。",
    "aliases": [
      "SHAKE128",
      "SHAKE256",
      "XOF"
    ],
    "sources": [
      {
        "id": "sha3",
        "title": "FIPS 202：SHA-3 与 SHAKE",
        "publisher": "NIST",
        "url": "https://csrc.nist.gov/pubs/fips/202/final",
        "language": "en",
        "kind": "standard",
        "locator": "海绵结构、SHA3 与 XOF"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Shake"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Shake"
      }
    ],
    "sections": [
      {
        "title": "从同一海绵挤出可变长度",
        "paragraphs": [
          "SHAKE 是可扩展输出函数，可从海绵状态连续生成指定长度的字节；SHAKE128 和 SHAKE256 的名称对应安全强度。",
          "本工具 Size 参数以位计；先选 SHAKE 变体，再设置所需输出位数。较长输出不能使安全强度无限增大。"
        ],
        "sourceIds": [
          "sha3",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "这里不是固定长度 SHA-3 的任意截断；比较时需同时对齐变体、输出长度和输入。"
        ],
        "sourceIds": [
          "sha3",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc；SHAKE128；Size=128 位",
            "output": "5881092dd818bf5cf8a3ddb793fbcba7",
            "explanation": "128 位输出为 16 字节，十六进制共 32 字符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SM3",
    "capabilityIds": [
      "op:SM3"
    ],
    "relatedIds": [
      "op:SM3"
    ],
    "topicGroup": "files",
    "title": "SM3 哈希",
    "summary": "SM3 是我国商用密码杂凑算法，输入按 512 位块处理，生成 256 位摘要。",
    "aliases": [
      "国密",
      "SM3",
      "杂凑"
    ],
    "sources": [
      {
        "id": "sm3",
        "title": "SM3 密码杂凑算法",
        "publisher": "国家密码管理局",
        "url": "https://oscca.gov.cn/sca/xxgk/2010-12/17/1002389/files/302a3ada057c4a73830536d03e683110.pdf",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "第5章算法描述与附录A测试示例"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SM3"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SM3"
      }
    ],
    "sections": [
      {
        "title": "512 位分块与消息扩展",
        "paragraphs": [
          "SM3 是我国商用密码杂凑算法，输入按 512 位块处理，生成 256 位摘要。",
          "填充包含原始长度，消息扩展产生 W 和 W′ 序列，再用逻辑函数、常量与循环移位完成 64 轮压缩。"
        ],
        "sourceIds": [
          "sm3",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "SM3 是杂凑算法，不能“解密”还原原文；认证仍需要配合密钥机制或签名。"
        ],
        "sourceIds": [
          "sm3",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "ASCII abc",
            "output": "66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0",
            "explanation": "这是国家密码管理局规范的常见测试消息。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Snefru",
    "capabilityIds": [
      "op:Snefru"
    ],
    "relatedIds": [
      "op:Snefru"
    ],
    "topicGroup": "files",
    "title": "Snefru 哈希",
    "summary": "Snefru 是 Ralph Merkle 设计的历史摘要算法，利用替换表和字旋转混合状态与消息。",
    "aliases": [
      "Snefru",
      "Merkle"
    ],
    "sources": [
      {
        "id": "rhash",
        "title": "RHash 支持的哈希函数",
        "publisher": "RHash 项目",
        "url": "https://sourceforge.net/p/rhash/wiki/HashFunctions/",
        "language": "en",
        "kind": "author-spec",
        "locator": "HAS-160、Snefru、Whirlpool 的规格与长度"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Snefru"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Snefru"
      }
    ],
    "sections": [
      {
        "title": "替换表与多轮字混合",
        "paragraphs": [
          "Snefru 是 Ralph Merkle 设计的历史摘要算法，利用替换表和字旋转混合状态与消息。",
          "本操作提供 128/256 位输出和 2/4/8 轮选项。轮数参与摘要规则，不是只改变运行速度；不同设置不能直接互查。"
        ],
        "sourceIds": [
          "rhash",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "早期低轮版本已有攻击；本工具保留参数用于兼容和研究，不应作为新安全认证方案。"
        ],
        "sourceIds": [
          "rhash",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Size=128 与 Size=256",
            "output": "分别输出 16 字节和 32 字节",
            "explanation": "轮数另作参数，两种长度和不同轮数都应明确记录。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SSDEEP",
    "capabilityIds": [
      "op:SSDEEP"
    ],
    "relatedIds": [
      "op:SSDEEP"
    ],
    "topicGroup": "files",
    "title": "SSDEEP 模糊哈希",
    "summary": "SSDEEP 用滚动哈希选择内容边界，将每段结果编码为字符，形成 blocksize:hash1:hash2 格式。",
    "aliases": [
      "SSDEEP",
      "模糊摘要"
    ],
    "sources": [
      {
        "id": "ssdeep",
        "title": "ssdeep 使用说明",
        "publisher": "ssdeep 项目",
        "url": "https://ssdeep-project.github.io/ssdeep/usage.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "签名格式与匹配分数"
      },
      {
        "id": "ctph",
        "title": "上下文触发分段哈希原始论文",
        "publisher": "Jesse Kornblum / DFRWS",
        "url": "https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/",
        "language": "en",
        "kind": "author-spec",
        "locator": "rolling hash 与分段摘要"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SSDEEP"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "SSDEEP"
      }
    ],
    "sections": [
      {
        "title": "内容触发的双尺度签名",
        "paragraphs": [
          "SSDEEP 用滚动哈希选择内容边界，将每段结果编码为字符，形成 blocksize:hash1:hash2 格式。",
          "两个摘要对应相关的块尺度，便于在文件轻微编辑后比较共有片段；它的输出长度不是固定密码摘要长度。"
        ],
        "sourceIds": [
          "ssdeep",
          "ctph",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "短文件或不匹配块尺度可能无法找到高分；相似签名不是文件安全或完全相同的证明。"
        ],
        "sourceIds": [
          "ssdeep",
          "ctph",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "签名形如 96:第一段摘要:第二段摘要",
            "output": "96 是块尺度参数，后两项为不同尺度的签名",
            "explanation": "真实字串来自输入内容，不能任意填写后当作有效签名。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Streebog",
    "capabilityIds": [
      "op:Streebog"
    ],
    "relatedIds": [
      "op:Streebog"
    ],
    "topicGroup": "files",
    "title": "Streebog 哈希",
    "summary": "Streebog 是 GOST R 34.11-2012，按 512 位消息块经过替换、排列和线性变换，输出 256 或 512 位。",
    "aliases": [
      "GOST2012",
      "Streebog256"
    ],
    "sources": [
      {
        "id": "rfc6986",
        "title": "RFC 6986：GOST R 34.11-2012",
        "publisher": "RFC Editor",
        "url": "https://www.rfc-editor.org/rfc/rfc6986.html",
        "language": "en",
        "kind": "standard",
        "locator": "算法与格式定义"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Streebog"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Hashing.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Streebog"
      }
    ],
    "sections": [
      {
        "title": "2012 版 GOST 的线性与替换变换",
        "paragraphs": [
          "Streebog 是 GOST R 34.11-2012，按 512 位消息块经过替换、排列和线性变换，输出 256 或 512 位。",
          "最终处理纳入消息长度和块累加和；256 位与 512 位模式的初始化不同，256 位版不能只截断 512 位结果。"
        ],
        "sourceIds": [
          "rfc6986",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "它不是 GOST R 34.11-94；核对资料时要保留标准年份与输出长度。"
        ],
        "sourceIds": [
          "rfc6986",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "选择 Streebog-256",
            "output": "输出 32 字节；Streebog-512 输出 64 字节",
            "explanation": "两个模式使用各自初始化规则。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Whirlpool",
    "capabilityIds": [
      "op:Whirlpool"
    ],
    "relatedIds": [
      "op:Whirlpool"
    ],
    "topicGroup": "files",
    "title": "Whirlpool 哈希",
    "summary": "Whirlpool 使用类分组密码结构的非线性替换、排列和线性混合，将每个 512 位消息块压缩进状态。",
    "aliases": [
      "Whirlpool512"
    ],
    "sources": [
      {
        "id": "whirlpool",
        "title": "Whirlpool 摘要算法",
        "publisher": "OpenSSL 官方文档",
        "url": "https://docs.openssl.org/3.3/man3/EVP_whirlpool/",
        "language": "en",
        "kind": "official-doc",
        "locator": "ISO/IEC 10118-3 与 512 位输出"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Whirlpool"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Whirlpool"
      }
    ],
    "sections": [
      {
        "title": "基于分组变换的 512 位摘要",
        "paragraphs": [
          "Whirlpool 使用类分组密码结构的非线性替换、排列和线性混合，将每个 512 位消息块压缩进状态。",
          "按消息块迭代，最后输出 512 位；格式识别应区分历史 Whirlpool 变体与最终标准化算法。"
        ],
        "sourceIds": [
          "whirlpool",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "512 位长度只确定输出大小，不意味着它是 SHA-512；算法、填充和压缩结构各自不同。"
        ],
        "sourceIds": [
          "whirlpool",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Whirlpool 固定 512 位输出",
            "output": "64 字节，即 128 个十六进制字符",
            "explanation": "输入长度可变，输出长度固定。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ELF%20Info",
    "capabilityIds": [
      "op:ELF%20Info"
    ],
    "relatedIds": [
      "op:ELF%20Info"
    ],
    "topicGroup": "files",
    "title": "ELF 文件信息",
    "summary": "ELF 是类 UNIX 可执行文件、共享库和目标文件的格式，文件头描述位数、字节序、目标机器和各类表的位置。",
    "aliases": [
      "ELF",
      "section",
      "segment"
    ],
    "sources": [
      {
        "id": "elf",
        "title": "ELF 文件头",
        "publisher": "Linux man-pages",
        "url": "https://man7.org/linux/man-pages/man5/elf.5.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "e_ident、class、data 与 sections"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ELF Info"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "ELF Info"
      }
    ],
    "sections": [
      {
        "title": "文件头如何描述可执行结构",
        "paragraphs": [
          "ELF 是类 UNIX 可执行文件、共享库和目标文件的格式，文件头描述位数、字节序、目标机器和各类表的位置。",
          "起始标识含 7F 45 4C 46；class 区分 32/64 位，data 区分小端/大端。程序头表描述加载段，节头表描述链接和分析用的节。"
        ],
        "sourceIds": [
          "elf",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "解析信息不等于运行程序，也不保证能自动识别全部源码语言；损坏偏移或截断表会导致解析失败。"
        ],
        "sourceIds": [
          "elf",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "7F 45 4C 46 02 01",
            "output": "ELF 签名；02 为 64 位，01 为小端",
            "explanation": "机器体系还要读 e_machine 等后续字段。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Disassemble%20ARM",
    "capabilityIds": [
      "op:Disassemble%20ARM"
    ],
    "relatedIds": [
      "op:Disassemble%20ARM"
    ],
    "topicGroup": "files",
    "title": "ARM 反汇编",
    "summary": "反汇编将机器编码按指令集解析成助记符。Arm 的 A32、T32 和 A64 使用不同编码规则。",
    "aliases": [
      "ARM",
      "Thumb",
      "AArch64",
      "反汇编"
    ],
    "sources": [
      {
        "id": "arm",
        "title": "Arm A 系列架构",
        "publisher": "Arm",
        "url": "https://www.arm.com/zh-cn/architecture/cpu/a-profile",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "AArch32 的 A32/T32 与 AArch64 的 A64 指令集"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Disassemble ARM"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Shellcode.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Disassemble ARM"
      }
    ],
    "sections": [
      {
        "title": "同一字节流必须选对指令状态",
        "paragraphs": [
          "反汇编将机器编码按指令集解析成助记符。Arm 的 A32、T32 和 A64 使用不同编码规则。",
          "A32 常用固定 32 位指令，T32 混合 16/32 位；选择架构、指令状态、端序和基地址后才有可解释的结果。"
        ],
        "sourceIds": [
          "arm",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "数据可能被误当成指令；反汇编不会恢复原变量名或完整源码，选错状态会产生看似合法但错误的指令。"
        ],
        "sourceIds": [
          "arm",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "A32 小端字节 00 00 A0 E1",
            "output": "MOV R0, R0",
            "explanation": "32 位指令值为 E1A00000；实际格式可能显示为等价助记符。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Disassemble%20x86",
    "capabilityIds": [
      "op:Disassemble%20x86"
    ],
    "relatedIds": [
      "op:Disassemble%20x86"
    ],
    "topicGroup": "files",
    "title": "x86 反汇编",
    "summary": "x86 指令由可选前缀、操作码以及可能的寻址和立即数字段组成，长度可变。",
    "aliases": [
      "x86",
      "x64",
      "机器码"
    ],
    "sources": [
      {
        "id": "x86",
        "title": "Intel 体系结构开发手册",
        "publisher": "Intel",
        "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "IA-32 与 Intel 64 的指令编码"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Disassemble x86"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Shellcode.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Disassemble x86"
      }
    ],
    "sections": [
      {
        "title": "变长指令与执行模式",
        "paragraphs": [
          "x86 指令由可选前缀、操作码以及可能的寻址和立即数字段组成，长度可变。",
          "反汇编从选定起点逐条消费字节，并按 16/32/64 位模式解释操作数与地址大小；基地址影响显示的绝对或相对目标。"
        ],
        "sourceIds": [
          "x86",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "从一条指令的中间开始也可能解析出另一组指令，不能把任何字节流都认作真实程序。"
        ],
        "sourceIds": [
          "x86",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "x86 字节 90 C3",
            "output": "NOP；RET",
            "explanation": "90 是空操作，C3 是近返回；完整程序含义还依赖上下文。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:YARA%20Rules",
    "capabilityIds": [
      "op:YARA%20Rules"
    ],
    "relatedIds": [
      "op:YARA%20Rules"
    ],
    "topicGroup": "files",
    "title": "YARA 规则扫描",
    "summary": "YARA 规则先声明文本、十六进制或正则模式，再用 condition 描述怎样的命中组合算符合规则。",
    "aliases": [
      "YARA",
      "规则扫描"
    ],
    "sources": [
      {
        "id": "yara",
        "title": "Writing YARA rules",
        "publisher": "YARA 项目",
        "url": "https://yara.readthedocs.io/en/stable/writingrules.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "strings、condition、十六进制模式"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "YARA Rules"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Yara.js",
        "language": "en",
        "kind": "implementation",
        "locator": "YARA Rules"
      }
    ],
    "sections": [
      {
        "title": "字符串模式与条件怎样配合",
        "paragraphs": [
          "YARA 规则先声明文本、十六进制或正则模式，再用 condition 描述怎样的命中组合算符合规则。",
          "字符串名称如 $a 是条件中的布尔值；十六进制模式可用 ?? 表示未知字节，用 [n-m] 表示长度范围。"
        ],
        "sourceIds": [
          "yara",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "命中是满足规则，不等于证明文件恶意；规则质量和误命中范围需要结合上下文检查。"
        ],
        "sourceIds": [
          "yara",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "rule clue { strings: $a = \"ARG\" condition: $a }\n文件内容：xxARGyy",
            "output": "规则 clue 命中",
            "explanation": "模式 ARG 出现一次即使 $a 为真，condition 因而满足。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Render%20PDF",
    "capabilityIds": [
      "op:Render%20PDF"
    ],
    "relatedIds": [
      "op:Render%20PDF"
    ],
    "topicGroup": "files",
    "title": "显示 PDF",
    "summary": "PDF 保存对象、页面树、字体和绘图内容流；渲染器解释这些对象后生成页面画面。",
    "aliases": [
      "PDF",
      "页面渲染"
    ],
    "sources": [
      {
        "id": "pdf",
        "title": "PDF 格式规范",
        "publisher": "Adobe",
        "url": "https://opensource.adobe.com/dc-acrobat-sdk-docs/standards/pdfstandards/pdf/PDF32000_2008.pdf",
        "language": "en",
        "kind": "standard",
        "locator": "对象、交叉引用表、页面与内容流"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Render PDF"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/File.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Render PDF"
      }
    ],
    "sections": [
      {
        "title": "页面描述怎样被渲染",
        "paragraphs": [
          "PDF 保存对象、页面树、字体和绘图内容流；渲染器解释这些对象后生成页面画面。",
          "文本可能是真实字符，也可能是扫描图片或字形路径；看起来相同的页面，底层结构可能完全不同。"
        ],
        "sourceIds": [
          "pdf",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "看见文字不保证能复制文本，渲染预览也不能代替对隐藏对象、附件或元数据的检查。"
        ],
        "sourceIds": [
          "pdf",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "PDF 页面含图片形式的字母 ARG",
            "output": "画面显示 ARG，但未必有可选文本",
            "explanation": "图片像素与 PDF 文本对象不是同一种数据。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20null%20bytes",
    "capabilityIds": [
      "op:Remove%20null%20bytes"
    ],
    "relatedIds": [
      "op:Remove%20null%20bytes"
    ],
    "topicGroup": "files",
    "title": "移除空字节",
    "summary": "空字节是数值 0x00，通常不可见；数字字符 0 的 ASCII 字节是 0x30。",
    "aliases": [
      "NUL",
      "空字节"
    ],
    "sources": [
      {
        "id": "typed",
        "title": "Uint8Array：无符号字节数组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove null bytes"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove null bytes"
      }
    ],
    "sections": [
      {
        "title": "NUL 字节与字符 0 的区别",
        "paragraphs": [
          "空字节是数值 0x00，通常不可见；数字字符 0 的 ASCII 字节是 0x30。",
          "本操作删除所有 0x00，而不是删除空格或文字中的零。删除会改变输出长度及后续偏移。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "UTF-16 和二进制整数经常合法包含 00，移除它们可能改变编码或破坏结构。"
        ],
        "sourceIds": [
          "typed",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "41 00 30 00 42",
            "output": "41 30 42，ASCII A0B",
            "explanation": "两个 NUL 被删，数字 0 被保留。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XOR%20Checksum",
    "capabilityIds": [
      "op:XOR%20Checksum"
    ],
    "relatedIds": [
      "op:XOR%20Checksum"
    ],
    "topicGroup": "files",
    "title": "异或校验和",
    "summary": "异或校验把同宽的输入块逐位 XOR：相同位得 0，不同位得 1。块大小决定校验值宽度。",
    "aliases": [
      "XOR",
      "异或校验"
    ],
    "sources": [
      {
        "id": "bits-xor",
        "title": "按位异或：逐位组合两个值",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "值与参数"
      },
      {
        "id": "implementation",
        "title": "本工具输入、参数与输出定义",
        "publisher": "迷雾工具箱 · CyberChef 官方上游",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XOR Checksum"
      },
      {
        "id": "engine",
        "title": "随站官方引擎实现",
        "publisher": "CyberChef 官方上游",
        "url": "/vendor/cyberchef/modules/Crypto.js",
        "language": "en",
        "kind": "implementation",
        "locator": "XOR Checksum"
      }
    ],
    "sections": [
      {
        "title": "按固定块逐位异或",
        "paragraphs": [
          "异或校验把同宽的输入块逐位 XOR：相同位得 0，不同位得 1。块大小决定校验值宽度。",
          "逐块累积不保留顺序；相同块出现两次会相互抵消，因此它只能检测部分变化。"
        ],
        "sourceIds": [
          "bits-xor",
          "implementation",
          "engine"
        ]
      },
      {
        "title": "读法、例子与边界",
        "paragraphs": [
          "交换两个块不会改变结果，不能当作密码哈希或可靠抗篡改校验。"
        ],
        "sourceIds": [
          "bits-xor",
          "implementation",
          "engine"
        ],
        "examples": [
          {
            "input": "Blocksize=1；字节 41 42",
            "output": "03",
            "explanation": "01000001 XOR 01000010 = 00000011。",
            "label": "按规则推演"
          }
        ]
      }
    ],
    "misconceptions": []
  }
];
