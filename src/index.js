const fs = require('fs')
var path = require('path')
var express = require('express')

var schedule = require('node-schedule')
var sc = require('./sync')
var k3 = require('./k3/index')
var cfg = require('../config.json')

var app = express()

app.use(express.static(path.resolve(__dirname, '../vueclient/dist')))
app.get('/vue/*', function(req,res){
    const html = fs.readFileSync(path.resolve(__dirname,'../vueclient/dist/index.html'), 'utf-8')
    res.send(html)
})

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})

app.get('/', function(req, res){
    res.end('test')
})

app.get('status', async function(req,res){

})

var sync = new sc()
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
    rule.hour = times
    schedule.scheduleJob((rule)=>{
        sync.Inv().then(()=>{

        }).catch(ex=>{
            console.log('sync error', ex)
        })
    }) 
    console.log('Your Task is running')
})

