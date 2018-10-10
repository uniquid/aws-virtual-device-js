/**!
 *
 * Copyright 2016-2018 Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

var config = { aws:{}, node:{} };

config.aws = {
    cauth: {
        host: "HOST",
        clientId: "",
        authorizerName: "UniquIDCustomAuth",
        debug: false,
        protocol: 'wss-custom-auth',
        customAuthHeaders:  {
            'x-amz-customAuthorizer-name': '',
            'x-amz-customauthorizer-signature':''
        }
    },
    key: "",
    tokenKey: "UniquIDToken",
    awsNode: "AWS-NODE",
    awsTopic: 'home'
}

config.node = {
    home: "./data",
    mqttHost: "tcp://appliance4.uniquid.co:1883",
    bcSeeds: ["testnet-seed.litecointools.com","seed-b.litecoin.loshan.co.uk","dnsseed-testnet.thrasher.io"],
    registryUrl: "http://REGISTRY_URL:8080",
    requestTimeout: 10000,
    nodenamePrefix: "AWS-JS",
    announceTopic: "TOPIC_ANNOUNCE",
    bcLogLevel: 'info',
    network: "ltc-testnet"
}

module.exports = config;