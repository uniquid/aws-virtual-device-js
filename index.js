const config = require("./myconfig.js");
const { standardUQNodeFactory } = require('@uniquid/uidcore')
var awsIot = require('aws-iot-device-sdk');
var crypto = require('crypto'), fs = require('fs');
var events = require('events');

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
standardUQNodeFactory(config.node).then(uq => {
        console.log('MY NAME IS :', uq.nodename);

        setInterval(function(){
            console.log("I'm looking for a contract with", config.aws.awsNode);
            var contract = uq.db.findUserContractsByProviderName(config.aws.awsNode); //to set AWS name
            console.log(contract);
            contract = ["ciaoooooookjhaefjkhajhf"]
            eventEmitter.emit('locked', contract);
        }, 5000);
    }, error => {
        console.log(error);
})






/*cli = function(uq){
    inquirer.prompt(  {
        type: 'confirm',
        name: 'startup',
        message: "Do you want try to connect to AWS IoT?",
        default: true
    }).then(answers => {
        if(answers.startup == true) {
        inquirer.prompt({
            type: 'input',
            name: 'aws',
            message: "What's the AWS IoT name?",
            default: function() {
            return 'AWS-JSF54EB8A2C913';
            }
        }).then(answers => {
                       
            if( contract.length>0 && contract[0].identity.role == 'USER') {
            
            var _timestamp = Math.floor(new Date()/1000)
            var b_timestamp = Buffer.from(_timestamp.toString(), 'utf8');
            var b_signed = uq.id.signFor({role: contract[0].identity.role, index: contract[0].identity.index, ext: contract[0].identity.ext}, b_timestamp)
            config.aws.cauth.clientId = uq.nodename;
            config.aws.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = config.aws.cauth.authorizerName;
            awsDevice(config.aws.tokenKey, config.aws.cauth, config.aws.keyFile, JSON.stringify({
                useraddress:contract[0].identity.address,
                timestamp:_timestamp,
                signature:b_signed.toString('base64')
            }));
            
        
            } else {
                console.log("There is not a valid contract.");
            }
        });
        }
    });
}*/

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
        device.publish('mytopic', JSON.stringify({Hello:'World'}));
    });
            
    device.on('message', function(topic, payload) {
        console.log('message', topic, payload.toString());
        });

    device.on('error', function(error) {
        console.log('error', error);
        device.end();
    });

    device.on('reconnect', function(error) {
        console.log('error', error);
        device.end();
    });

    device.on('close', function(error) {
        console.log('error', error);
    });

    device.on('offline', function(error) {
        console.log('error', error);
        device.end();
    });

}

eventEmitter.on('locked', function(contract){
    console.log(contract)
    if( contract.length>0 && typeof contract[0].identity != 'undefined' && typeof contract[0].identity.role != 'undefined' &&  contract[0].identity.role == 'USER') {
        console.log("There is a valid contract. I'm connecting to", answers.aws); //

    } else {
        console.log("There is not a valid contract.");
    }
});
