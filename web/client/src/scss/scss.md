Установить sass 
    apt-get -y install ruby-full
    gem install sass
    gem install sass-json-vars

Это общие файлы, их надо добавить в билд. В локальной копии я их собираю с помощью PhpStorm в папку 
assets/css
Название файла w.css
Так же я его подключаю в dev версии в шаблоны напрямую. В prod конкатенировать в 1 файл

Не мешать с SASS!!!!
Для PhpStorm
Вотчер настраивается по scope на папку(обязательно рекурсивный скоуп, иначе не будут обновляться вложенные файлы). 
В корне папки обязательно для вотчера нужен файл app.scss(можно любой другой, 
тогда нужно редактировать аргументы вотчера)
Arguments - "-r sass-json-vars --no-cache --update app.scss:$ProjectFileDir$/web/client/assets/css/w.css"

Так же настроить файл который будет отслеживать обновление
$ProjectFileDir$/web/client/assets/css/w.css
