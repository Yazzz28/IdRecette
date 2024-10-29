php bin/console d:d:d -f --no-interaction
php bin/console d:d:c --no-interaction
rm -rf migrations/*
php bin/console make:migration --no-interaction
php bin/console d:m:m --no-interaction