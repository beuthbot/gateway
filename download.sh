apt-get update
apt-get install ffmpeg -y
apt-get install libogg0 -y
apt-get install libopus0 -y
apt-get install opus-tools -y
apt-get install sox -y

ffmpeg -i test.ogg -f wav - | opusenc - output.ogg