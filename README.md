# Dockerized gilda
This project have 3 parts:
1. Node.js backend
2. Angular client app
3. Ngnix Gateway

Because this project uses `docker-compose` instead of `Kuberenetes`, 
it will deploy an `ETCD` and `etcdkeeper` as UI.

Project architecture looks like this:
