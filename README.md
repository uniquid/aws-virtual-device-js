# aws-virtual-device-js 

## Requirements  
- Node 8 (+ npm)
- make
- cmake
- g++

use `installENV.sh` to install all this stuff

## Getting started
### clone
`git clone https://github.com/uniquid/aws-virtual-device-js`

### install
```
cd ./aws-virtual-device-js
npm install
```

### configure
update `config.js` file and add your private-key file (PEM format) in `secure` directory

`config.js` has some default values

#### network
```
- ltc-main -> main
- ltc-testnet -> testnet
- ltc-regtest -> uqregtest

default in config file: ltc-testnet
default in lcoin settings: main
the configuration file has higher priority
```
#### lcoin log level (bcLogLevel)
```
- error
- warning
- info
- debug
- spam

default: error 
```

### install latest header's DB
`npm run install-headers` Installs in aws-virtual-device's node-home the latest testnet headers from UQ's headers' backup repos

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
