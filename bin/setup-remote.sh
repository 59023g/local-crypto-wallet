#!/bin/bash

# ssh-keygen; ssh-copy-id -p 3022 root@localhost
# vi /etc/ssh/sshd_config permitRootLogin yes

# VB NAT settings: Host: 3022, Guest: 22
#
# ssh -p 3022 root@localhost "bash -s" < ./setup-remote.sh 'coin_wallet'
#
# scp -r -P 3022 ../zip/ root@localhost:~/zip
# ssh -p 3022 root@localhost "bash -s" < ./deploy.sh 'coin_wallet'


# set -e


RUNDIR=$( dirname $0 )
APP_NAME=$1

echo "-- installing $APP_NAME dependencies on remote machine --"

apt-get update -y
apt-get install -y make git unzip

echo "deb http://ftp.debian.org/debian stretch-backports main" >> /etc/apt/sources.list.d/sources.list
apt-get update
apt-get install -y python-certbot-nginx ufw  -t stretch-backports

echo "-- certbot and nginx installed --"

git clone https://github.com/tj/n && \
  cd n && \
  make install && \
  n 8.6.0 && \
  cd .. && \
  rm -rf n

echo "-- node $(node -v) installed  --"

echo "-- configuring nginx -- "
# note the app is not in there yet
mkdir -p /var/www/$APP_NAME
chown -R $USER:$USER /var/www/$APP_NAME
chmod -R 755 /var/www

echo "

upstream app {
  server localhost:3000 weight=1 fail_timeout=60s;
}

server {
    listen 80;
    server_name $APP_NAME;
    access_log /var/log/nginx/app.log;

    # gzip on;
    # gzip_comp_level 6;
    # gzip_vary on;
    # gzip_min_length  1000;
    # gzip_proxied any;
    # gzip_types text/plain text/html text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
    # gzip_buffers 16 8k;

    # pass the request to the node.js server with te correct headers and much more can be added, see nginx config options
    location / {
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header Host \$http_host;
      proxy_set_header X-NginX-Proxy true;

      # websocket
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection \"upgrade\";

      # pass to upstream
      proxy_pass http://app/;
      proxy_redirect off;

      # proxy_cache cache;
      # proxy_cache_valid 200 1d;
      # proxy_cache_use_stale  error timeout invalid_header updating http_500 http_502 http_503 http_504;
      # proxy_cache_bypass \$http_upgrade;
    }

     location /public/ {
       proxy_set_header X-Real-IP \$remote_addr;
       proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
       proxy_set_header Host \$http_host;
       proxy_set_header X-NginX-Proxy true;

       # Pass to upstream
       proxy_pass http://app/;
       proxy_redirect off;

     }
 }
" >> /etc/nginx/sites-available/$APP_NAME

ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

rm /etc/nginx/sites-available/default

systemctl restart nginx


# if prod
# TODO self sign test cert
# https://certbot.eff.org/docs/using.html#certbot-command-line-options
echo "-- obtain and install certificates -- "

# certbot --nginx \
#   --non-interactive \
#   --agree-tos \
#   --email hi@mep.im \
#   --domains $APP_NAME \
#   --test-cert \
