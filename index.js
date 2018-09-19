const config = require("./myconfig.js");
const { standardUQNodeFactory } = require('@uniquid/uidcore')
var awsIot = require('aws-iot-device-sdk');
var crypto = require('crypto'), fs = require('fs'), events = require('events');
var synco = false;
const secp256k1 = require('secp256k1');
const sha265 = require('lcoin/lib/crypto/sha256');
var varuint = require('varuint-bitcoin')

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
        }, 5000);
    }, error => {
        console.log(error);
})

awsDevice = function(tokenkey, options, keyfile, token){
    var pem = fs.readFileSync(keyfile);
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(token);
    var signed_token = sign.sign(pem.toString('ascii'), 'base64');
    options.customAuthHeaders['x-amz-customauthorizer-signature'] = 0; //= signed_token;
    options.customAuthHeaders[tokenkey] = token;

    var device = awsIot.device(options);
                
    device.on('connect', function() {
        console.log('connect');
        device.subscribe('mytopic');
        device.emit('publish')
    });
            
    device.on('publish', function() {
        //console.log('publish');
        setTimeout(function(){
            data = {timestamp:Date.now()}
            device.publish('mytopic', JSON.stringify(data));
            device.emit('publish')
        },5000);
    });

    device.on('message', function(topic, payload) {
        console.log('message', topic, payload.toString());
    });

    device.on('error', function(error) {
        console.log('error-error', error);
        device.end();
    });

    device.on('reconnect', function(error) {
        console.log('error-reconnect');
        device.end();
    });

    device.on('close', function(error) {
        console.log('error-close');
        synco = false;
    });

    device.on('offline', function(error) {
        console.log('error-offline');
        device.end();
    });
}

eventEmitter.on('locked', function(uq, contract){
    if( synco == true)
        console.log("AWS IoT connection already exist.");
    else if( synco == false && contract.length>0 && typeof contract[0].identity != 'undefined' && typeof contract[0].identity.role != 'undefined' &&  contract[0].identity.role == 'USER') {
        synco = true;
        console.log("There is a valid contract. I'm connecting to", contract[0].providerName);
        var _ts = Date.now();
        var message = _ts.toString();

        messagePrefix = '\u0018Bitcoin Signed Message:\n'
        if (!Buffer.isBuffer(messagePrefix)) messagePrefix = Buffer.from(messagePrefix, 'utf8')
          
        var messageVISize = varuint.encodingLength(message.length)
        var buffer = Buffer.allocUnsafe(messagePrefix.length + messageVISize + message.length)
        messagePrefix.copy(buffer, 0)
        varuint.encode(message.length, buffer, messagePrefix.length)
        buffer.write(message, messagePrefix.length + messageVISize)
        var hs = sha265.hash256(buffer)
        
    var rolePath = contract[0].identity.role ? '0' : '1';
    var extOrInt = contract[0].identity.ext || (contract[0].identity.role ? '1' : '0');
    var subPath = [rolePath, extOrInt, "" + contract[0].identity.index];


    var x = uq.id.identityFor({role: contract[0].identity.role, index: contract[0].identity.index, ext: contract[0].identity.ext})
console.log(x)
        var sigObj = secp256k1.sign(hs, x.privateKey)
        //function encodeSignature (signature, recovery, compressed) {
            sigObj.recovery += 4
            var _tsSigned = Buffer.concat([Buffer.alloc(1, sigObj.recovery + 27), sigObj.signature])
         // }
        
         /*   return encodeSignature(sigObj.signature, sigObj.recovery, compressed)
          }*/

    
        


        //Buffer.from(_ts.toString(), 'utf8'); 
        console.log(_tsSigned.toString('base64'))
        
        

       // hs2 = sha265.hash256(_tsBuffer)
        //var _tsSigned = uq.id.signFor({role: contract[0].identity.role, index: contract[0].identity.index, ext: contract[0].identity.ext}, hs2)

        config.aws.cauth.clientId = uq.nodename;
        config.aws.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = config.aws.cauth.authorizerName;

        awsDevice(config.aws.tokenKey, config.aws.cauth, config.aws.keyFile, JSON.stringify({
            userAddress: contract[0].identity.address,
            timestamp:_ts,
            signature: _tsSigned.toString('base64')
        }));
    } else {
        console.log("There is not a valid contract.");
    }
});
