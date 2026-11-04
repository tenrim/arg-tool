构建环境：Python 3、Emscripten 3.1.67。解压本目录各源码包：core.tar.gz、gmp.tar.xz、mpfr.tar.xz、xml.tar.xz。将 emsdk 3.1.67 安装在 compiler/emsdk-3.1.67，执行 emsdk install 3.1.67 和 activate 3.1.67。
已附 GMP/MPFR/libxml2 的静态 WASM 库及匹配头文件，来自固定 OCI 层 a4f8acc948abda3617365997e2a8d3de11ee8729eb7825da548ea6230963afbc 与 06f5486916fbb508dc5b393506d45b379eea91d8ad15e2a885d1f8c769172141；不使用该镜像旧版 libqalculate.a。完整依赖源码随包，可按照 dependencies.Dockerfile 的 configure/make 参数重新生成依赖。
运行 python -X utf8 generate-options.py，再运行 python -X utf8 build-core.py 和 python -X utf8 link.py。编译所有 41 个官方 .cc 与完整 definitions.cc，没有选取函数或单位子集。generate-options.py 只生成 settings.h，不改官方源代码。bridge.cc 为本站新增 API 适配（GPL-3.0-or-later）。官方核心源文件未经修改。
Gnuplot 采用原网页编译版，其精确构建配方见 gnuplot-build.mk，对应源码及摘要见 NOTICE.txt。
