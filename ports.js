var findPort = require("find-free-port")

//-----------------------------------------------------------------------------

function getTCPport(port) {
    return findPort(port).then((port) => port[0]);
}

//-----------------------------------------------------------------------------

module.exports = getTCPport;