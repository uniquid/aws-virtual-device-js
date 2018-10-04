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
var config
if (typeof argv.config != 'undefined')
    config = require(argv.config);
else
    config = require('./config.js');

if(typeof argv.noenv == 'undefined'){
    var aws_agent_config = JSON.parse(process.env.AWS_AGENT_CONFIG);
    config.aws.cauth.host = aws_agent_config.awsEndpointAddress;
    config.aws.awsNode = aws_agent_config.awsAgentName;
    config.aws.tokenKey = aws_agent_config.awsTokenKey;
    config.aws.cauth.authorizerName = aws_agent_config.awsAuthorizerName

    var skey = JSON.stringify(aws_agent_config.awsPrivateKey)
    var jkey = JSON.parse(skey);
    config.aws.key = jkey.join('\n');

    config.node.mqttHost = aws_agent_config.mqttUrl
    config.node.announceTopic = aws_agent_config.mqttTopic
    config.node.registryUrl = aws_agent_config.registryUrl
    
    var snet = aws_agent_config.network.split('-')

    delete config.node.nodenamePrefix
} else {
    var snet = config.node.network.split('-')
}

if(snet[1]=="regtest")
    config.node.network = "uqregtest"
else 
    config.node.network = snet[1]

delete config.node.bcSeeds

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
        console.log('MY PUB IS:', uq.id.getBaseXpub());
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

var awsDevice = function (tokenkey, options, key, token) {
    if(typeof argv.noenv != 'undefined'){
        var pem = fs.readFileSync(key); 
        var _key = pem.toString('ascii');
    } else {
        var _key = key
    } 
    var sign = crypto.createSign('RSA-SHA256');
    var synco2 = false;
    sign.update(token);
    var signed_token = sign.sign(_key, 'base64');
    options.customAuthHeaders['x-amz-customauthorizer-signature'] = signed_token;
    options.customAuthHeaders[tokenkey] = token;

    var device = new awsIot.device(options);

    device.on('connect', function () {
        console.log('connect');
        device.subscribe(config.aws.awsTopic);
        synco2 = true
        device.emit('publish') //publish message after che connection
    });

    // @ts-ignore
    device.on('publish', function () {
        //console.log('publish');
        setTimeout(function () { //publish message every 5 seconds
            if (synco2 === true) {
                var data = { timestamp: Date.now() }
                device.publish(config.aws.awsTopic, JSON.stringify(data));
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
        synco = false;
        synco2 = false;
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

        config.aws.awsTopic = uq.nodename; 
        config.aws.cauth.clientId = uq.nodename;
        config.aws.cauth.customAuthHeaders['x-amz-customAuthorizer-name'] = config.aws.cauth.authorizerName;

        awsDevice(config.aws.tokenKey, config.aws.cauth, config.aws.key, JSON.stringify({
            userAddress: contract[0].identity.address,
            timestamp: _ts,
            signature: _tsSigned.toString('base64')
        }));
    } else {
        console.log("There is not a valid contract.");
    }
});
