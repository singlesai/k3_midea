<template>
  <div class="hello">
    <div class="block">
      <span class="demonstration">同步时间</span>
      <el-date-picker
        v-model="filter.date"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="query">
      </el-date-picker>
    </div>
    <el-table :data="data.filter(data => !filter.str || data.FNumber.toLowerCase().includes(filter.str.toLowerCase()) || data.FName.toLowerCase().includes(filter.str.toLowerCase()) || data.FModel.toLowerCase().includes(filter.str.toLowerCase()))">
      <el-table-column label="日期" prop="FSyncTime"></el-table-column>
      <el-table-column label="产品代码" prop="FNumber"></el-table-column>
      <el-table-column label="产品名称" prop="FName"></el-table-column>
      <el-table-column label="规格" prop="FModel"></el-table-column>
      <el-table-column label="数量" prop="FQty"></el-table-column>
      <el-table-column label="同步状态" prop="FSyncSuccess"></el-table-column>
      <el-table-column label="同步信息" prop="FSyncInfo"></el-table-column>
      <el-table-column align="right">
        <template slot="header" slot-scope="scope">
          <el-input v-model="filter.str" size="mini" placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button v-if="scope.row.FSyncSuccess>0 && scope.row.FReSync===0" size="mini" @click="handleEdit(scope.$index, scope.row)">重新同步</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'SyncStatus',
  data () {
    return {
      url: '', // '//127.0.0.1:8089',
      filter: {
        date: undefined,
        str: ''
      },
      data: []
    }
  },
  mounted () {
    this.query()
  },
  methods: {
    format (d, fmt) { 
      var o = { 
          "M+" : d.getMonth()+1,                 //月份 
          "d+" : d.getDate(),                    //日 
          "h+" : d.getHours(),                   //小时 
          "m+" : d.getMinutes(),                 //分 
          "s+" : d.getSeconds(),                 //秒 
          "q+" : Math.floor((d.getMonth()+3)/3), //季度 
          "S"  : d.getMilliseconds()             //毫秒 
      }; 
      if(/(y+)/.test(fmt)) {
              fmt=fmt.replace(RegExp.$1, (d.getFullYear()+"").substr(4 - RegExp.$1.length)); 
      }
      for(var k in o) {
          if(new RegExp("("+ k +")").test(fmt)){
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
          }
      }
      return fmt; 
    },
    async query () {
      var url = this.url+'/status?beg='+(this.filter.date?this.format(this.filter.date[0],'yyyy-MM-dd hh:mm:ss'):'')+'&end='+(this.filter.date?this.format(this.filter.date[1],'yyyy-MM-dd hh:mm:ss'):'')
      var rst = await axios.get(url)
      console.log(rst.data)
      this.data = rst.data
    },
    async handleEdit(idx, row) {
      var url = this.url+'/resync?id='+row.FItemID
      var rst = await axios.get(url)
      console.log(rst.data)
      row.FReSync = 1
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
