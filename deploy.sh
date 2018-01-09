set -e

apt-get update -y

apt-get install -y git

git clone https://github.com/59023g/local-crypto-wallet

curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

add-apt-repository -y\
   "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
   $(lsb_release -cs) \
   stable"

   apt-get update

   apt-get install -y docker-ce docker-compose


   docker-compose up -d
