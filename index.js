const config = require("./myconfig.js");
const { standardUQNodeFactory } = require('@uniquid/uidcore')
var awsIot = require('aws-iot-device-sdk');
var crypto = require('crypto'), fs = require('fs'), events = require('events');
var synco = false;

// create some handlers for bitmask rpc over mqtt
const RPC_METHOD_ECHO = 34
config.node.rpcHandlers = [
  {
    m: RPC_METHOD_ECHO,  // the bit number associated to method
    h: (params ) => `ECHO: ${params}`  // function to call when bitmask method is invoked
  }
]

var eventEmitter = new events.EventEmitter();

// Use standard UQ node factory to create an UQ Node:   
standardUQNodeFactory(config.node)
    .then(uq => {
        console.log('MY NAME IS:', uq.nodename);

        var si = setInterval(function(){
            console.log("I'm looking for a contract with", config.aws.awsNode);
            var contract = uq.db.findUserContractsByProviderName(config.aws.awsNode);
            if(contract.length>0){
                eventEmitter.emit('locked', uq, contract);
            }
        }, 10000);
    }, error => {
        console.log(error);
})

awsDevice = function(tokenkey, options, keyfile, token){
    var pem = fs.readFileSync(keyfile);
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(token);
    var signed_token = sign.sign(pem.toString('ascii'), 'base64');
    options.customAuthHeaders['x-amz-customauthorizer-signature'] = signed_token;
    options.customAuthHeaders[tokenkey] = token;

    var device = awsIot.device(options);
                
    device.on('connect', function() {
        console.log('connect');
        device.subscribe('mytopic');
        device.publish('mytopic', JSON.stringify({timestamp:'World'}));
    });
            
    device.on('message', function(topic, payload) {
        console.log('message', topic, payload.toString());
    });

    device.on('error', function(error) {
        console.log('error-error', error);
        device.end();
    });

    device.on('reconnect', function(error) {
        console.log('error-reconnect', error);
        device.end();
    });

    device.on('close', function(error) {
        console.log('error-close', error);
        synco = false;
    });

    device.on('offline', function(error) {
        console.log('error-offline', error);
        device.end();
    });

}

eventEmitter.on('locked', function(uq, contract){
    if( synco == false && contract.length>0 && typeof contract[0].identity != 'undefined' && typeof contract[0].identity.role != 'undefined' &&  contract[0].identity.role == 'USER') {

        console.log(contract)

        synco = true;

        console.log("There is a valid contract. I'm connecting to", contract[0].providerName);
        var _timestamp = new Date();
        var b_timestamp = Buffer.from(_timestamp.toString(), 'utf8');
        var b_signed = uq.id.signFor({role: contract[0].identity.role, index: contract[0].identity.index, ext: contract[0].identity.ext}, b_timestamp)
        config.aws.cauth.clientId = uq.nodename;
        config.aws.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = config.aws.cauth.authorizerName;

        awsDevice(config.aws.tokenKey, config.aws.cauth, config.aws.keyFile, JSON.stringify({
            userAddress: contract[0].identity.address,
            timestamp:_timestamp,
            signature: b_signed.toString('base64')
        }));
    } else {
        console.log("There is not a valid contract.");
    }
});
