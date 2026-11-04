FROM debian:bookworm-slim AS build
RUN sed -i 's|http://deb.debian.org/debian|http://mirrors.tuna.tsinghua.edu.cn/debian|g' /etc/apt/sources.list.d/debian.sources
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl build-essential golang-go && rm -rf /var/lib/apt/lists/*
WORKDIR /build
ENV GOPROXY=https://goproxy.cn,direct
RUN curl -fL --retry 3 https://api.github.com/repos/lukechampine/jsteg/tarball/cf206c26c711db215c11cb61bb479113ae8be275 -o jsteg.tgz && mkdir jsteg && tar xzf jsteg.tgz -C jsteg --strip-components=1 && cd jsteg && go build -o /build/jsteg-bin ./cmd/jsteg
RUN curl -fL --retry 3 https://api.github.com/repos/h3xx/jphs/tarball/33a11e1bad146f5e9c0d3fe6475812a1cedb9b7e -o jphs.tgz && mkdir jphs && tar xzf jphs.tgz -C jphs --strip-components=1
COPY upstream/aperisolve-single/docker/config.guess upstream/aperisolve-single/docker/config.sub /build/jphs/jpeg-8a/
RUN cd jphs/jpeg-8a && chmod +x config.guess config.sub && ./configure && make -j1
RUN cd jphs && sed -i 's/open(seekfilename,O_WRONLY|O_TRUNC|O_CREAT)/open(seekfilename,O_WRONLY|O_TRUNC|O_CREAT, 0644)/' jpseek.c && sed -i 's/^LIBS = .*/JPEG_OBJS = $(filter-out jpeg-8a\/cjpeg.o jpeg-8a\/djpeg.o jpeg-8a\/jpegtran.o jpeg-8a\/rdjpgcom.o jpeg-8a\/wrjpgcom.o,$(wildcard jpeg-8a\/*.o))/' Makefile && sed -i 's/^LDFLAGS = .*/LDFLAGS =/' Makefile && sed -i 's/^jphide: \(.*\)$/jphide: \1 $(JPEG_OBJS)/' Makefile && sed -i 's/^jpseek: \(.*\)$/jpseek: \1 $(JPEG_OBJS)/' Makefile && make -j1 all
COPY upstream/aperisolve-single/openstego_0.8.6-1_all.deb /build/openstego.deb

FROM debian:bookworm-slim
RUN sed -i 's|http://deb.debian.org/debian|http://mirrors.tuna.tsinghua.edu.cn/debian|g' /etc/apt/sources.list.d/debian.sources
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 python3-pil python3-numpy python3-flask python3-flask-sqlalchemy expect default-jre-headless file ruby p7zip-full binwalk foremost libimage-exiftool-perl steghide binutils outguess pngcheck ffmpeg poppler-utils graphicsmagick graphicsmagick-imagemagick-compat unzip xz-utils bzip2 gzip tar && gem install zsteg -v 0.2.13 --no-document && rm -rf /var/lib/apt/lists/*
COPY --from=build /build/openstego.deb /tmp/openstego.deb
RUN apt-get update && apt-get install -y --no-install-recommends default-jre && dpkg -i /tmp/openstego.deb && rm /tmp/openstego.deb && rm -rf /var/lib/apt/lists/*
COPY --from=build /build/jsteg-bin /usr/local/bin/jsteg
COPY --from=build /build/jphs/jpseek /build/jphs/jphide /usr/local/bin/
COPY --from=build /build/jphs /opt/sources/jphs
COPY --from=build /build/jsteg /opt/sources/jsteg
COPY upstream/aperisolve-single /opt/upstream
COPY upstream/aperisolve-single/docker/pdfid.py /usr/local/bin/pdfid
COPY services/forensics/runner.py /opt/runner.py
COPY services/forensics/fixtures.py /opt/fixtures.py
COPY services/forensics/notices.py /opt/notices.py
RUN chmod +x /usr/local/bin/pdfid && python3 /opt/runner.py --prepare
WORKDIR /work
ENV HOME=/work TMPDIR=/work LC_ALL=C.UTF-8 PYTHONUNBUFFERED=1
ENV JAVA_TOOL_OPTIONS="-Duser.home=/work -Djava.io.tmpdir=/work -Djava.awt.headless=true -XX:ActiveProcessorCount=1 -XX:MaxRAMPercentage=50.0"
USER 65534:65534
ENTRYPOINT ["python3", "/opt/runner.py"]
