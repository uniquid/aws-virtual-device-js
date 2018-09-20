const argv = require('minimist')(process.argv.slice(2));
console.log(argv);
if(typeof argv.config != 'undefined' )
    var config = require(argv.config);
else
    var config = require('./config.js');

const { standardUQNodeFactory } = require('@uniquid/uidcore')
var awsIot = require('aws-iot-device-sdk');
var crypto = require('crypto'), fs = require('fs'), events = require('events');
var synco = false;

// create some handlers for bitmask rpc over mqtt
const RPC_METHOD_ECHO = 34
config.node.rpcHandlers = [
    {
        m: RPC_METHOD_ECHO,  // the bit number associated to method
        h: (params) => `ECHO: ${params}`  // function to call when bitmask method is invoked
    }
]

var eventEmitter = new events.EventEmitter();

// Use standard UQ node factory to create an UQ Node:   
standardUQNodeFactory(config.node)
    .then(uq => {
        console.log('MY NAME IS:', uq.nodename);
        var si = setInterval(function () {
            console.log("I'm looking for a contract with", config.aws.awsNode);
            var contract = uq.db.findUserContractsByProviderName(config.aws.awsNode);
            if (contract.length > 0) {
                eventEmitter.emit('locked', uq, contract);
            }
        }, 5000);
    }, error => {
        console.log(error);
    })

awsDevice = function (tokenkey, options, keyfile, token) {
    var pem = fs.readFileSync(keyfile);
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(token);
    var signed_token = sign.sign(pem.toString('ascii'), 'base64');
    options.customAuthHeaders['x-amz-customauthorizer-signature'] = signed_token;
    options.customAuthHeaders[tokenkey] = token;

    var device = awsIot.device(options);

    device.on('connect', function () {
        console.log('connect');
        device.subscribe(config.aws.awsTopic);
        device.emit('publish') //publish message after che connection
    });

    device.on('publish', function () {
        //console.log('publish');
        setTimeout(function () { //publish message every 5 seconds
            data = { timestamp: Date.now() }
            device.publish(config.aws.awsTopic, JSON.stringify(data));
            device.emit('publish')
        }, 5000);
    });

    device.on('message', function (topic, payload) {
        console.log('message', topic, payload.toString());
    });

    device.on('error', function (error) {
        console.log('error-error', error);
        device.end();
    });

    device.on('reconnect', function (error) {
        console.log('error-reconnect');
        device.end();
    });

    device.on('close', function (error) {
        console.log('error-close');
        synco = false;
    });

    device.on('offline', function (error) {
        console.log('error-offline');
        device.end();
    });
}

eventEmitter.on('locked', function (uq, contract) {
    if (synco == true)
        console.log("AWS IoT connection already exist.");
    else if (synco == false && contract.length > 0 && typeof contract[0].identity != 'undefined' && typeof contract[0].identity.role != 'undefined' && contract[0].identity.role == 'USER') {
        synco = true;
        console.log("There is a valid contract. I'm connecting to", contract[0].providerName);
        var _ts = Date.now();

        var _tsSigned = uq.id.signMessage(_ts.toString(), contract[0].identity)
        console.log(_tsSigned.toString('base64'))

        config.aws.cauth.clientId = uq.nodename;
        config.aws.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = config.aws.cauth.authorizerName;

        awsDevice(config.aws.tokenKey, config.aws.cauth, config.aws.keyFile, JSON.stringify({
            userAddress: contract[0].identity.address,
            timestamp: _ts,
            signature: _tsSigned.toString('base64')
        }));
    } else {
        console.log("There is not a valid contract.");
    }
});
