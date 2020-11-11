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
        if (!rst) {
            await this.Inv()
        } else if (rst.retCode === '0') {
            for(var idx in inv) {
                inv[idx]['success'] = 0
                inv[idx]['info'] = ''
            }
            await k3Api.syncRet(inv)
            console.log('Sync Success:' + inv.length + ' Records')
        } else if (rst.retCode === '-1') {
            var farr = []
            for(var idx in inv) {
                if (rst.detail[idx].retCode != 0) {
                    inv[idx]['success'] = rst.detail[idx].retCode
                    inv[idx]['info'] = rst.detail[idx].msg
                    farr.push(JSON.parse(JSON.stringify(inv[idx])))
                }
            }
            await k3Api.syncRet(farr)
            console.log('Sync Error:' + farr.length + ' Records')
            await this.Inv()
        } else if (rst.retCode === '14') {
            console.log('Sync Err:', rst)
            throw(rst.msg)
        }else {
            console.log('Sync Err:', rst)
            throw(rst.msg)
        }
    }
}

module.exports = sync