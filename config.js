var config = { aws:{}, node:{} };

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
    tokenKey: "xxx",
    awsNode: "AWS-NODE",
    awsTopic: 'home'
}

config.node = {
    home: "./data",
    mqttHost: "tcp://xxx:1883",
    bcSeeds: ["testnet-seed.litecointools.com","seed-b.litecoin.loshan.co.uk","dnsseed-testnet.thrasher.io"],
    registryUrl: "http://xxx:8080",
    requestTimeout: 10000,
    nodenamePrefix: "xxx"
}

module.exports = config;