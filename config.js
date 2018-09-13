var config = { node:{} };

config.node.home = "./data";
config.node.mqttHost = "tcp://159.65.192.164:1883";
config.node.bcSeeds = ["testnet-seed.litecointools.com","seed-b.litecoin.loshan.co.uk","dnsseed-testnet.thrasher.io"];
config.node.registryUrl = "http://159.65.192.164:8080";
config.node.requestTimeout = 10000;
config.node.nodenamePrefix = "AWS-JS";

module.exports = config;