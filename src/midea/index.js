"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var util = require('util')
var https = require('https')
const cfg = require('../../config.json');
const { default: Axios } = require('axios');

class midea {
    constructor(options) {

    }

    dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }

    async sendInv(vals) {
        var date = new Date()
        var timestamp = date.valueOf()
        var data = {
            timestamp:timestamp,
            serialnum:this.dateFormat("YYYYmmdd",date)+parseInt(date.getHours()/2),
            vendorCode: cfg.midea.supno,
            token: cfg.midea.token,
            data:[]
        }
        for (var val in vals) {
            var rec = vals[val]
            data.data.push({
                dataType: 'TRANSACTION',
                demandItemCode:rec.custItemNo,
                itemDescription:rec.itemModel,
                organizationCode:rec.category,
                qty:rec.qty,
                reference:'',
                sourceBill:'',
                sourceCode:'',
                sourceId:timestamp,
                supplyItemCode:rec.itemNo,
                transactionDate:timestamp
            })
        }
        // console.log('post', JSON.stringify(data))
        try{
            /*
            const ignoreSSL = axios.create({
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            })
            ignoreSSL.get(cfg.midea.url)
            */
            const agent = new https.Agent({
                rejectUnauthorized: false
            })
            //var rst = await Axios.post(cfg.midea.url, data)
            var rst = await Axios.post(cfg.midea.url, data, {httpsAgent: agent})
            /*
            var config = {
                method: 'post',
                url: cfg.midea.url,
                strictSSL: false,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : data
            }
            var rst = await Axios(config)
            */
           return rst.data.data
            console.log('rst', data, rst)
        }catch(ex){
            console.log('ex', ex)
        }
    }
}

module.exports = midea