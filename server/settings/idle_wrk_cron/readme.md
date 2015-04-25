Вобщем есть ощущение что другие вирталки вытесняют нашу виртуалку если она долго не пашет (idle).
И по итогам простейшие запросы идут по много секунд. Порой в 1000раз медленнее чем должны.

Как вариант держать сервер все время разогретым, используя wrk
бонус wrk что можно написать свой скрипт который при прогоне 
будет опрашивать нужные url - что позволит держать разогретыми и свои внутренние сервисы
типа groonga и тп

Надо установить https://github.com/wg/wrk
например в папку /home/ice/cron/wrk

Затем правим файл
`sudo vi /etc/rsyslog.d/50-default.conf`
в нем раскомменчиваем
`cron.*                          /var/log/cron.log`
сохраняем и 
`sudo service rsyslog restart`

добавить задачу в крон
`crontab -e`
и там пока раз в минуту запускаем
`* * * * * /home/ice/cron/wrk/wrk -t1 -c2 -d10s -s /home/ice/ext/tehnopark/server/settings/idle_wrk_cron/idle.lua http://127.0.0.1:3080 >> /home/ice/wrk.log`


на сервере можно смотреть `cat /home/ice/wrk.log`
или так
`cat ~/wrk.log | grep requests`

посмотреть лог докера (nginx в него пишет)
`docker logs -f --tail=30 tehno`

посмотреть логи не убили ли все дисковое просранство
`df -h`

