# JAVA 
JAVA 17
tar -xvf openjdk-17.0.2_linux-x64_bin.tar.gz
sudo mv jdk-17.0.2 /usr/lib/jvm/

echo "export JAVA_HOME=/usr/lib/jvm/jdk-17.0.2" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
source ~/.bashrc

# Android Studio (sdk 34 - for now)
export ANDROID_HOME=/home/vitaliykorzenkoua/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools


# Gradle 8.7
export GRADLE_HOME=/opt/gradle/gradle-8.7
export PATH=$PATH:$GRADLE_HOME/bin


# react build

npm run build


# react start

npm run start

# build anroid

cordova run android (in emulator chromebook)

cordova build android (build apk file in outputs for phone)


#Deploy To Server
# pm2 resurrect
(посмотреть все процессы)


