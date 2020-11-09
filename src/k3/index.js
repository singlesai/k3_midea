"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var sql = require('mssql')
const util = require('util')
const cfg = require('../../config.json')

class k3 {
    constructor(options) {
    }

    async getPool() {
        if (this.pool === undefined) {
            var conn = new sql.ConnectionPool(cfg.k3db)
            this.pool = await conn.connect()
        }
        return this.pool
    }

    async query(strSql) {
        await this.getPool()
        return await this.pool.query(strSql)
    }

    async init() {
        var strSql = `if not exists(select 1 from sysobjects where type='u' and name='SL_InvHis')
        create table SL_InvHis(FSyncTime datetime,FItemID int,FQty decimal(28,10),FLastSync int,FSyncSuccess int,FSyncInfo varchar(1024),FReSync int)`
        await this.query(strSql)
    }

    async getInv() {
        var strSql = `
        select i.* from
        (select i.FItemID itemId,k3.fshortnumber custItemNo,case k2.fname when '大烤箱' then 'M23' else 'M19' end category,k1.fnumber itemNo,k1.fname itemName,k1.fmodel itemModel,sum(i.FQty) qty
        from icinventory i
            join t_icitemcustom k on k.fitemid=i.fitemid
            join t_icitemcore k1 on k1.fitemid=i.fitemid
            join t_submessage k2 on k2.finterid=k.f_103
            join t_item k3 on k3.fitemid=i.fitemid
        where isnull(k2.fname,'') in ('微波炉','大烤箱') --and k1.fnumber='1.01.12270000000274'
        group by i.FItemID,k3.fshortnumber,k1.fnumber,k1.fname,k1.fmodel,case k2.fname when '大烤箱' then 'M23' else 'M19' end) i 
            left join SL_InvHis j on j.FItemID=i.itemId and j.FLastSync=1 
        where (isnull(j.FSyncSuccess,1)=1 and i.qty<>isnull(j.FQty,0)) or isnull(j.FReSync,0) = 1
        order by i.itemNo`
        return await (await this.query(strSql)).recordset
    }

    async syncRet(val) {
        for(var idx in val) {
            var strSql = `update SL_InvHis set FLastSync=0,FReSync=0 where FLastSync=1 and FItemID=`+val[idx].itemId+`
            insert into SL_InvHis(FSyncTime,FItemID,FQty,FLastSync,FSyncSuccess,FSyncInfo,FReSync)
            select getdate(),`+val[idx].itemId+`,`+val[idx].qty+`,1,`+val[idx].success+`,'`+val[idx].info+`',0`
            await this.query(strSql)
        }
    }

    async syncLog(filter) {
        var strSql = `select i.FItemID,j.FNumber,j.FName,j.FModel,i.FQty,i.FSyncTime,i.FSyncSuccess,i.FSyncInfo,i.FReSync
        from SL_InvHis i join t_ICItemCore j on j.FItemID=i.FItemID
        where i.FLastSync=1 and i.FSyncTime>='`+filter.begTime+`' and i.FSyncTime<='`+filter.endTime+`'
        order by i.FSyncTime desc`
        var rst = this.query(strSql)
        return (await rst).recordset
    }

    async reSync(filter) {
        var strSql = "update SL_InvHis set FReSync=1 where FLastSync=1 and FItemID=" + filter.id
        var rst = await this.query(strSql)
        return rst
    }
}

module.exports = k3