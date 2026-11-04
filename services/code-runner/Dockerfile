# Maintenance build only. No downloads or dependency installation during execution.
FROM dart:3.6.0 AS dart
FROM swift:6.0.3-noble
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 ca-certificates curl unzip build-essential default-jdk-headless \
    golang-go rustc php-cli ruby r-base-core perl bash nodejs npm dotnet-sdk-8.0 \
    libicu74 libssl3t64 libunwind8 libuuid1 zlib1g \
    && rm -rf /var/lib/apt/lists/*
COPY --from=dart /usr/lib/dart /opt/dart
ENV PATH="/opt/dart/bin:/opt/kotlin/bin:/opt/scala/bin:/opt/powershell:${PATH}"
COPY kotlin-lib/ /opt/kotlin/lib/
COPY scala-official.tgz powershell.deb /tmp/compilers/
RUN npm install --global --ignore-scripts typescript@5.7.2 @types/node@18.19.70 \
    && tar -xzf /tmp/compilers/scala-official.tgz -C /opt \
    && mv /opt/scala-2.13.16 /opt/scala \
    && dpkg-deb -x /tmp/compilers/powershell.deb /tmp/powershell-package \
    && mv /tmp/powershell-package/opt/microsoft/powershell/7 /opt/powershell \
    && chmod +x /opt/powershell/pwsh && rm -rf /tmp/compilers /tmp/powershell-package
COPY runner.py profiles.json /opt/mist-code/
RUN python3 /opt/mist-code/runner.py --manifest > /opt/mist-code/manifest.json
RUN python3 /opt/mist-code/runner.py --notices > /opt/mist-code/NOTICE.txt
ENV HOME=/work TMPDIR=/work LANG=C.UTF-8 DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 DOTNET_NOLOGO=1 \
    POWERSHELL_TELEMETRY_OPTOUT=1 DOTNET_GCHeapHardLimit=0x10000000 \
    JAVA_TOOL_OPTIONS="-Xmx256m -XX:ActiveProcessorCount=1" \
    GOCACHE=/work/go-cache GOMAXPROCS=1 DART_SUPPRESS_ANALYTICS=true CI=true
USER 65534:65534
WORKDIR /work
ENTRYPOINT ["python3", "/opt/mist-code/runner.py"]
