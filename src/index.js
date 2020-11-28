const fs = require('fs')
var path = require('path')
var url = require('url')
var express = require('express')

var schedule = require('node-schedule')
var sc = require('./sync')
var k3 = require('./k3/index')
var cfg = require('../config.json')

var app = express()
var k3Api = new k3()
k3Api.init()

app.use(express.static(path.resolve(__dirname, '../vueclient/dist')))

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})

app.get('/status', async function(req,res){
    var filter = {}
    filter.begTime = req.query['beg']
    filter.endTime = req.query['end']
    if(!filter.begTime) {
        filter.begTime = '1900-01-01'
    }
    if(!filter.endTime) {
        filter.endTime = '2100-01-01'
    }
    var rst = await k3Api.syncLog(filter)
    res.end(JSON.stringify(rst))
})

app.get('/resync', async function(req,res){
    var filter = {}
    filter.id = req.query['id']
    if(!filter.id) filter.id=0
    var rst = await k3Api.reSync(filter)
    res.end(JSON.stringify(rst))
})

var sync = new sc()
app.get('/sync', async function(req,res){
    try {
        var rst = await sync.Inv()
        res.end(JSON.stringify(rst))
    } catch(ex) {
        res.end(JSON.stringify(ex))
    }
})

sync.Inv().then(()=>{
}).catch(ex=>{
    console.log('sync error', ex)
})

var server = app.listen(cfg.port, function(){
    var host=server.address().address
    var port = server.address().port
    console.log('Your Server is running here : http://%s:%s', host, port)

    var rule = new schedule.RecurrenceRule()
    var times = [1,3,5,7,9,11,13,15,17,19,21,23]
    // rule.hour = times
    rule.second=30
    schedule.scheduleJob(rule, ()=>{
        sync.Inv().then(()=>{
            console.log('sync success')
        }).catch(ex=>{
            console.log('sync error', ex)
        })
    }) 
    console.log('Your Task is running')
})

