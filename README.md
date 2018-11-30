# Pinaka App API

#### Requirments : 

  - SSH login details of `p_pinaka` user
  - node @ 10
  - Open Port `4001`
  - PM2 is installed on server


#### How to start :
Clone repository and do below steps
```sh
$ npm install
$ npm start
```
PM2 Run : 
```sh
pm2 start npm --name api_pinaka -- start
```
