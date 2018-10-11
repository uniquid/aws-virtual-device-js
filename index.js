/**!
 *
 * Copyright 2016-2018 Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

const argv = require('minimist')(process.argv.slice(2));
console.log(argv);

if (typeof argv.config != 'undefined'){
    var config = require(argv.config);
} else {
    var config = require('./config.js');
}

if(typeof argv.noenv == 'undefined'){
    var aws_agent_config = JSON.parse(process.env.AWS_AGENT_CONFIG);
    config.aws.cauth.host = aws_agent_config.awsEndpointAddress;
    config.aws.awsNode = aws_agent_config.awsAgentName;
    config.aws.tokenKey = aws_agent_config.awsTokenKey;
    config.aws.cauth.authorizerName = aws_agent_config.awsAuthorizerName;

    var skey = JSON.stringify(aws_agent_config.awsPrivateKey);
    var jkey = JSON.parse(skey);
    config.aws.key = jkey.join('\n');

    config.node.mqttHost = aws_agent_config.mqttUrl;
    config.node.announceTopic = aws_agent_config.mqttTopic;
    config.node.registryUrl = aws_agent_config.registryUrl;
    
    var snet = aws_agent_config.network.split('-');

    delete config.node.nodenamePrefix;
} else {
    var snet = config.node.network.split('-');
}

if(snet[1]=="regtest") {
    config.node.network = "uqregtest";
} else {
    config.node.network = snet[1];
}

delete config.node.bcSeeds;

const { standardUQNodeFactory } = require('@uniquid/uidcore');
var awsIot = require('aws-iot-device-sdk');
var crypto = require('crypto'), fs = require('fs'), events = require('events');
var oshootLookingLog = false, awsRunned = false, f = 0, t = 0;

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
        console.log('MY PUB IS:', uq.id.getBaseXpub());
        var si = setInterval(function () {
            eventEmitter.emit('looking', config.aws, uq);
        }, 5000);
    }, error => {
        console.log(error);
    })

var awsDevice = function (awsConfig, token) {
    if(typeof argv.noenv != 'undefined') {
        var pem = fs.readFileSync(awsConfig.key); 
        var _key = pem.toString('ascii');
    } else {
        var _key = awsConfig.key;
    } 
    var sign = crypto.createSign('RSA-SHA256');
    var synco = false;
    sign.update(token);
    var signed_token = sign.sign(_key, 'base64');
    awsConfig.cauth.customAuthHeaders['x-amz-customauthorizer-signature'] = signed_token;
    awsConfig.cauth.customAuthHeaders[awsConfig.tokenKey] = token;

    var device = new awsIot.device(awsConfig.cauth);

    device.on('connect', function () {
        console.log('connect');
        device.subscribe(awsConfig.awsTopic);
        synco = true;
        device.emit('publish'); //publish message after che connection
    });

    // @ts-ignore
    device.on('publish', function () {
        //console.log('publish');
        setTimeout(function () { //publish message every 5 seconds
            if (synco === true) {
                var data = { timestamp: Date.now(), sin: f }
                device.publish(awsConfig.awsTopic, JSON.stringify(data));
                device.emit('publish')
            }
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
        awsRunned = false;
        synco = false;
        oshootLookingLog = false;
    });

    device.on('offline', function (error) {
        console.log('error-offline');
        device.end();
    });
}

eventEmitter.on('looking', function (awsConfig, uq) {
    if(oshootLookingLog == false) {
        console.log("I'm looking for a contract with", awsConfig.awsNode);
        oshootLookingLog = true;
    }
    if(awsRunned == false) {
        var contract = uq.db.findUserContractsByProviderName(awsConfig.awsNode);
        if (contract.length > 0){
            if(typeof contract[0].identity != 'undefined' && typeof contract[0].identity.role != 'undefined' && contract[0].identity.role == 'USER') {
                eventEmitter.emit('locked', awsConfig, uq, contract);
                awsRunned = true;
            } else {
                console.log("There is a contract but it is not valid.");
                oshootLookingLog = false;
            }
        } 
    }
});

eventEmitter.on('locked', function (awsConfig, uq, contract) {
    console.log("There is a valid contract. I'm connecting to", contract[0].providerName);
    var _ts = Date.now();

    var _tsSigned = uq.id.signMessage(_ts.toString(), contract[0].identity)
    console.log(_tsSigned.toString('base64'))

    awsConfig.awsTopic = uq.nodename; 
    awsConfig.cauth.clientId = uq.nodename;
    awsConfig.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = awsConfig.cauth.authorizerName;

    awsDevice(awsConfig, JSON.stringify({
        userAddress: contract[0].identity.address,
        timestamp: _ts,
        signature: _tsSigned.toString('base64')
    }));
});

var sinw_looper = setInterval(function(){
    var _f = 1*Math.sin(50*t+0);
    f = _f;
    t=t+0.5;
}, 500)