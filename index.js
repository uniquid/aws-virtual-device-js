const config = require("./config.js");
const { standardUQNodeFactory } = require('@uniquid/uidcore')

// create some handlers for bitmask rpc over mqtt
const RPC_METHOD_ECHO = 34
config.node.rpcHandlers = [
  {
    m: RPC_METHOD_ECHO,  // the bit number associated to method
    h: (params ) => `ECHO: ${params}`  // function to call when bitmask method is invoked
  }
]

// Use standard UQ node factory to create an UQ Node:   
standardUQNodeFactory(config.node)
.then(uq => {
  
}, error => {
  // initialization error
})
