var schedule = require('node-schedule')
var sc = require('./sync')
var k3 = require('./k3/index')

var sync = new sc()
var k3Api = new k3()
k3Api.init()
sync.Inv().then(()=>{
}).catch(ex=>{
    console.log('sync error', ex)
})
var rule = new schedule.RecurrenceRule()
var times = [1,3,5,7,9,11,13,15,17,19,21,23]
rule.hour = times
schedule.scheduleJob((rule)=>{
    sync.Inv().then(()=>{

    }).catch(ex=>{
        console.log('sync error', ex)
    })
}) 