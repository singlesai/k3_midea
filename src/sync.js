"use strict";
Object.defineProperty(exports, "__esModule", {value:true});

var k3 = require('./k3/index')
var midea = require('./midea/index')

var k3Api = new k3()
var mideaApi = new midea()

class sync {
    constructor(options) {

    }

    async Inv() {
        var inv = await k3Api.getInv()
        await mideaApi.sendInv(inv)
    }
}

module.exports = sync