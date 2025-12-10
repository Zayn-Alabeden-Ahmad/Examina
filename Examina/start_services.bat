@echo off
start cmd /k "redis-server"
start cmd /k "cd /d C:\Users\zayna\Desktop\ExaminaProject\Examina && python -m celery -A Examina worker --pool=solo -l info"
start cmd /k "cd /d C:\Users\zayna\Desktop\ExaminaProject\Examina && python manage.py runserver"
