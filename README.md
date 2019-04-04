# aws-virtual-device-js 

## Requirements  
- Node 8 (+ npm)
- make
- cmake
- g++

use `installENV.sh` to install all this stuff

## Getting started
### templates
- [sine wave generator master](https://github.com/uniquid/aws-virtual-device-js/) or [sine wave generator develop](https://github.com/uniquid/aws-virtual-device-js/tree/develop)
- [in/out valve](https://github.com/uniquid/aws-virtual-device-js/tree/template/valve)

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
`npx ltc-backup install testnet -t data` Installs in aws-virtual-device's node-home the latest testnet headers from UQ's headers' backup repos   
checkout [https://github.com/uniquid/uidcore-js#ltc-backup-cli-tool](https://github.com/uniquid/uidcore-js#ltc-backup-cli-tool)

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
or 
```
export AWS_AGENT_CONFIG=path/configfile_from_cli.json
```
#### data to send to AWS IoT

It's possible to send any kind of data using `device.publish`.    
The second parameter of the function is the `string` that will be sent to AWS IoT.    
You can create your own function that returns a `string` or `json object` (to stringify) that will be sent to AWS.

#### sinewave template
``template/sinewave`` allows to run a ``sine wave generator`` using ``sineWave.start(amplitude, frequency, phase, sampling)``
##### example
With ``sineWave.start(1, 50, 0, 0.5)`` it's possibile start a sine wave generator that has an amplitude of 1@50Hz with phase of 0°.

This sine wave is sampled every 0.5 seconds.
##### output
```{ timestamp: Date.now(), sin: sineWave.sin }```

#### valve template
``template/valve`` allows to run a ``valve`` to increase ``level`` of tank every x seconds by a ``delta`` using ``valve.start(limit, seconds, delta)``
##### example
With ``valve.start(100, 1, 2)`` it's possibile start a valve that every 1 second incrase tank level by 2 up to 100, when the tank reaches the limit, the valve will answer again with 100 and then the valve will empty the tank up to 0 with the same mode as before.
##### output
```{ timestamp: Date.now(), level: valve.level, flow: valve.flow, limit: valve.limit }```

``valve.flow`` reais the flow direction of the valve
```
0 = the valve is filling
1 = the valve is emptying
```
