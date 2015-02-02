###Nginx рестарт под макосью
sudo launchctl unload -F /Library/LaunchDaemons/homebrew.mxcl.nginx.plist
sudo launchctl load -F /Library/LaunchDaemons/homebrew.mxcl.nginx.plist



server {
    gzip on;
    gzip_comp_level 6;
    gzip_vary on;
    gzip_min_length  1000;
    gzip_proxied any;
    gzip_types text/plain text/css application/octet-stream application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_buffers 16 8k;

listen 80;
server_name avtogiper.ru www.avtogiper.ru autogiper.com autogiper.ru;

location / {
proxy_pass http://127.0.0.1:81;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
if ($request_method = 'GET') {
add_header 'Access-Control-Allow-Origin' "$http_origin";
#add_header Access-Control-Allow-Origin *;
add_header 'Access-Control-Allow-Credentials' 'true';
add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since';
}

if ($request_method = 'OPTIONS') {
add_header Access-Control-Allow-Origin *;
add_header 'Access-Control-Max-Age' 1728000;
add_header 'Access-Control-Allow-Credentials' 'true';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since';
add_header 'Content-Length' 0;
add_header 'Content-Type' 'text/plain charset=UTF-8';
return 204;
}

charset utf-8;
}

location ~* \.(html|jpeg|jpg|gif|png|css|js|pdf|txt|tar|ico)$ {
root /var/www/autogiper.ru/public_html;
expires 60d;
}
}

