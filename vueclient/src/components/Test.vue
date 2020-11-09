<template>
  <div class="contains">
    <el-form>
      <el-form-item>
        <el-col :span="2">
           物料：
        </el-col>
        <el-col :span="4">
         <el-input title="物料" v-model="query.material"/>
        </el-col>
        <el-col :span="2">
          订单：
        </el-col>
        <el-col :span="4"><el-input title="订单" v-model="query.ord"/>
        </el-col>
        <el-col :span="2">
          <el-button value="查询" @click="onQuery">查询</el-button>
        </el-col>
        <el-col :span="2">
          <el-button value="导出" @click="onExp">导出</el-button>
        </el-col>
      </el-form-item>
    </el-form>
    <el-tabs>
      <el-tab-pane label="总览" name="main">
        <div style="width: fit-content;padding: 20px;">
          分类：<el-select v-model="query.categ" @change="onCategChange">
            <el-option v-for="(o,k) in query.categs" :key="k" :value="o" :label="o">{{o}}</el-option>
          </el-select>
          材料金额：{{data.amt}}
        </div>
        <tree-table ref="recTree" :list.sync="data.dsp" :header="header" @actionFunc="actionFunc" @deleteFunc="deleteFunc" @handlerExpand="handlerExpand" @orderByFunc="orderByFunc"></tree-table>
      </el-tab-pane>
      <el-tab-pane v-for="(o,k) in data.categTotal" :key="k" :label='k' :name="k">
        <el-table :data="o" show-summary>
          <el-table-column prop="物料编码" label="物料编码" sortable></el-table-column>
          <el-table-column prop="物料名称" label="物料名称" sortable></el-table-column>
          <el-table-column prop="物料属性" label="物料属性" sortable></el-table-column>
          <el-table-column prop="计量单位" label="计量单位" sortable></el-table-column>
          <el-table-column prop="理论整体用量" label="理论用量" sortable></el-table-column>
          <el-table-column prop="实际用量" label="实际用量" sortable></el-table-column>
          <el-table-column prop="实际材料单价" label="材料单价" sortable></el-table-column>
          <el-table-column prop="理论材料金额" label="理论金额" sortable></el-table-column>
          <el-table-column prop="实际材料金额" label="实际金额" sortable></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import treeTable from '@/components/TreeTable/tree-table.vue'
import axios from 'axios'
export default {
  mounted () {
    this.onQuery()
  },
  data () {
    return {
      header: {
        Bom编码: {caption: 'Bom编码', width: 250},
        物料大类: {caption: '物料大类', width: 100},
        物料编码: {caption: '物料编码', width: 200},
        物料名称: {caption: '物料名称', width: 300},
        物料属性: {caption: '物料属性', width: 100},
        生产部门: {caption: '生产部门', width: 100},
        计量单位: {caption: '计量单位', width: 100},
        理论单位用量: {caption: '理论单位用量', width: 100},
        理论整体用量: {caption: '理论整体用量', width: 100},
        实际用量: {caption: '实际用量', width: 100},
        理论物料单价: {caption: '理论物料单价', width: 100},
        加工单价: {caption: '加工单价', width: 100},
        理论材料金额: {caption: '理论材料金额', width: 100},
        实际材料金额: {caption: '实际材料金额', width: 100},
        加工金额: {caption: '加工金额', width: 100},
        合计加工金额: {caption: '合计加工金额', width: 100},
        总金额: {caption: '总金额', width: 100},
        备注: {caption: '备注', width: 500}
      },
      query: {
        material: '1.05.01.01302',
        ord: 'LZ2404',
        categ: '',
        categs: []
      },
      data: {
        data: [],
        categTotal: {},
        dsp: [],
        amt: 0
      }
    }
  },
  components: {
    treeTable
  },
  methods: {
    async onQuery () {
      // var url = '//127.0.0.1:8989/cost?material='+this.query.material+'&ord='+this.query.ord
      var url = '/cost?material='+this.query.material+'&ord='+this.query.ord
      var rst = await axios.get(url)
      console.log(rst.data)
      this.query.categs = []
      this.data.categTotal = {}
      var dic = {}
      for (var idx in rst.data) {
        var rec = rst.data[idx]
        rec['children'] = []
        if (dic[rec.FInterID] === undefined){
          dic[rec.FInterID] = rec
        }
      }
      for (var idx in rst.data) {
        var rec = rst.data[idx]
        if (dic[rec.FParentID] !== undefined && rec.FParentID !== null){
          dic[rec.FParentID]['children'].push(rec)
          if (this.query.categs.indexOf(rec.物料大类) < 0) {
            this.query.categs.push(rec.物料大类)
          }
          if (rec.物料大类 === null) {
            rec.物料大类 = '其他'
          }
          if (this.data.categTotal[rec.物料大类] === undefined) {
            this.data.categTotal[rec.物料大类] = []
          }
          this.data.categTotal[rec.物料大类].push(rec)
        }
      }
      this.data.data = []
      this.data.dsp = []
      for (var key in dic) {
        if (dic[key].FParentID === null) {
          this.data.data.push(dic[key])
          this.data.dsp.push(dic[key])
        }
      }
      console.log('categTotal', this.data.categTotal)
    },
    onExp () {
      alert('待开放')
    },
    getDsp (node, categ) {
      var rst = []
      for (var idx in node) {
        if (node.length <= 0) {
          return []
        } else {
          var cd = this.getDsp(node[idx].children, categ)
        }
        var nn = JSON.parse(JSON.stringify(node[idx]))
        nn.children = cd
        if (nn.物料大类 === categ || cd.length > 0) {
          rst.push(nn)
          if (nn.物料大类 === categ) {
            this.data.amt += nn.材料金额
          }
        }
      }
      return rst
    },
    onCategChange () {
      this.data.amt = 0
      this.data.dsp = this.getDsp(this.data.data, this.query.categ)
      this.data.amt = this.data.amt.toFixed(2)
    },
    orderByFunc (val) {
      alert('排序')
      alert(val)
    },
    actionFunc (m) {
      alert('编辑')
    },
    deleteFunc (m) {
      alert('删除')
    },
    handlerExpand (m) {
      console.log('展开/收缩')
      m.isExpand = !m.isExpand
    }
    // getTreeData() {
    //   // 取父节点
    //   let parentArr = this.list.filter(l => l.parentId === 0)
    //   this.treeDataSource = this.getTreeData(this.list, parentArr)
    // },
    // // 这里处理没有children结构的数据
    // getTreeData(list, dataArr) {
    //   dataArr.map((pNode, i) => {
    //     let childObj = []
    //     list.map((cNode, j) => {
    //       if (pNode.Id === cNode.parentId) {
    //         childObj.push(cNode)
    //       }
    //     })
    //     pNode.children = childObj
    //     if (childObj.length > 0) {
    //       this.getTreeData(list, childObj)
    //     }
    //   })
    //   return dataArr
    // }
  }
}
</script>

<style>
.contains {
    width: 960px;
}
</style>
