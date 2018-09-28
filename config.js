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
    mqttHost: "tcp://MQTT_HOST:1883",
    bcSeeds: ["testnet-seed.litecointools.com","seed-b.litecoin.loshan.co.uk","dnsseed-testnet.thrasher.io"],
    registryUrl: "http://REGISTRY_URL:8080",
    requestTimeout: 10000,
    nodenamePrefix: "AWS-JS",
    announceTopic: "TOPIC_ANNOUNCE",
    network: "NETWORK"
}

module.exports = config;