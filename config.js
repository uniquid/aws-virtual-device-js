var config = { aws:{}, node:{}, crypto:{} };

config.aws = {
    cauth: {
        host: "xxx",
        clientId: "",
        authorizerName: "xxx",
        debug: false,
        protocol: 'wss-custom-auth',
        customAuthHeaders:  {
            'x-amz-customAuthorizer-name': '',
            'x-amz-customauthorizer-signature':''
        }
    },
    keyFile: "./secure/xxx",
    tokenKey: "xxx"
}

config.node.home = "./data";
config.node.mqttHost = "tcp://xxx:1883";
config.node.bcSeeds = ["testnet-seed.litecointools.com","seed-b.litecoin.loshan.co.uk","dnsseed-testnet.thrasher.io"];
config.node.registryUrl = "http://xxx:8080";
config.node.requestTimeout = 10000;
config.node.nodenamePrefix = "xxx";

module.exports = config;