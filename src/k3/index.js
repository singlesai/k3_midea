"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var sql = require('mssql')
const util = require('util')
const cfg = require('../../config.json')

class k3 {
    constructor(options) {
        this.init()
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
        create table SL_InvHis(FStockID int,FSPID int,FItemID int,FBatchNo varchar(255),FAuxPropID int,FQty decimal(28,10))`
        await this.query(strSql)
    }

    async getInv() {
        var strSql = `select k.f_101 custItemNo,case k2.fname when '大烤箱' then 'M23' else 'M29' end category,k1.fnumber itemNo,k1.fname itemName,k1.fmodel itemModel,sum(i.FQty) qty
        from icinventory i left join SL_InvHis j on j.FStockID=i.FStockID and j.FSPID=i.FStockPlaceID
            and j.FItemID=i.FItemID and j.FAuxPropID=i.FAuxPropID and j.FBatchNo=i.FBatchNo
            and i.FQty<>isnull(j.FQty,0)
            join t_icitemcustom k on k.fitemid=i.fitemid
            join t_icitemcore k1 on k1.fitemid=i.fitemid
            join t_submessage k2 on k2.finterid=k.f_103
        where isnull(k.f_101,'')<>'' and isnull(k2.fname,'') in ('微波炉','大烤箱')
        group by k.f_101,k1.fnumber,k1.fname,k1.fmodel,case k2.fname when '大烤箱' then 'M23' else 'M29' end`
        return await (await this.query(strSql)).recordset
    }
}

module.exports = k3