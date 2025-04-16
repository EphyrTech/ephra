FROM node:18-bullseye

# Set working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    unzip \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    build-essential \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p ${ANDROID_HOME} \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -O /tmp/android-sdk.zip \
    && unzip -q /tmp/android-sdk.zip -d ${ANDROID_HOME} \
    && rm /tmp/android-sdk.zip \
    && mkdir -p ${ANDROID_HOME}/cmdline-tools/latest \
    && mv ${ANDROID_HOME}/cmdline-tools/* ${ANDROID_HOME}/cmdline-tools/latest/ \
    && mv ${ANDROID_HOME}/cmdline-tools/latest/cmdline-tools/* ${ANDROID_HOME}/cmdline-tools/latest/ \
    && rm -rf ${ANDROID_HOME}/cmdline-tools/latest/cmdline-tools

# Set Android SDK environment variables
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Accept Android SDK licenses
RUN mkdir -p ${ANDROID_HOME}/licenses \
    && echo "8933bad161af4178b1185d1a37fbf41ea5269c55" > ${ANDROID_HOME}/licenses/android-sdk-license \
    && echo "d56f5187479451eabf01fb78af6dfcb131a6481e" >> ${ANDROID_HOME}/licenses/android-sdk-license \
    && echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" >> ${ANDROID_HOME}/licenses/android-sdk-license

# Install Android SDK components
RUN sdkmanager --update \
    && yes | sdkmanager "platform-tools" \
    "platforms;android-33" \
    "build-tools;33.0.0" \
    "extras;android;m2repository" \
    "extras;google;m2repository"

# Install Expo CLI globally
RUN npm install -g expo-cli eas-cli

# Install Watchman
RUN git clone https://github.com/facebook/watchman.git \
    && cd watchman \
    && git checkout v2023.05.01.00 \
    && ./autogen.sh \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf watchman

# Create a non-root user
RUN groupadd --gid 1000 node \
    && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# Set ownership for the workspace
RUN chown -R node:node /workspace

# Switch to non-root user
USER node

# Set environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Expose ports
EXPOSE 19000 19001 19002 19006 8081

# Set the default command
CMD ["bash"]
