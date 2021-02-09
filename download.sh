apt-get update
apt-get install ffmpeg -y
apt-get install libogg0 -y
apt-get install libopus0 -y
apt-get install opus-tools -y
apt-get install sox -y

ffmpeg -i test.ogg -f wav - | opusenc - output.ogg

FILE=output.ogg
if test -f "$FILE"; then
    echo "$FILE exists."
fi