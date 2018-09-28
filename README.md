# aws-virtual-device-js 

## Requirements  
- Node 8 (+ npm)
- make
- cmake
- g++

use `installENV.sh` to install all this stuff

## Getting started
### clone
`git clone https://github.com/uniquid/aws-virtual-device-js -b september-hack`

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

add `--noenv` to avoid using environmental variables

or

`npm start` to start with config.js (same as `npm run virtual-device -- --config=./config.js`)
