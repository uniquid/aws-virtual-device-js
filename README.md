# aws-virtual-device-js 

## Requirements  
- Node 8 (+ npm)
- make
- cmake
- g++

use `installENV.sh` to install all this stuff

## Getting started
### clone
`git clone https://github.com/uniquid/aws-virtual-device-js -b develop`

### install
```
cd ./aws-virtual-device-js
npm install
```

### configure
update `config.js` file and add your private-key file (PEM format) in `secure` directory

`config.js` has some default values

### run
`npm run virtual-device -- --config=./yourconfigfile.js` if you want change the config file name

or

`npm start` to start with config.js (same as `npm run virtual-device -- --config=./config.js`)

add `--noenv` to avoid using environmental variables

#### environmental variables
```
export AWS_AGENT_CONFIG=$(cat configfile_from_cli.json)
```
or

```
export AWS_AGENT_CONFIG='
{
  "orgId": "...",
  "mqttUrl": "tcp://...:1883",
  "mqttTopic": "...",
  "registryUrl": "http://...:...",
  "awsAuthorizerName": "...",
  "awsPrivateKey": [
    "-----BEGIN RSA PRIVATE KEY-----",
    "...",
    "...",
    "...",
    "-----END RSA PRIVATE KEY-----"
  ],
  "awsTokenKey": "...",
  "awsAgentName": "...",
  "awsEndpointAddress": "...",
  "network": "..."
}
'
```

## Push to AWS repository    
`./docker-build` builds an image named `aws-virtual-device-js`    
then you may exec    

```
./docker-login
./docker-tag-latest aws-virtual-device-js
./docker-push-latest aws-virtual-device-js
```

directly from https://github.com/uniquid/tenant-task-definition/ root folder, 
as those 2 commands point to image name    
