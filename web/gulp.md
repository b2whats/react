Установить sass 
    apt-get -y install ruby-full
    gem install sass
    gem install sass-json-vars

Установить галп плагины

Для watchify 
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
