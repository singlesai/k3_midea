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
        var rst = await mideaApi.sendInv(inv)
        for(var idx in inv) {
            inv[idx]['success'] = rst.detail[idx].retCode
            inv[idx]['info'] = rst.detail[idx].msg
        }
        await k3Api.syncRet(inv)
    }
}

module.exports = sync