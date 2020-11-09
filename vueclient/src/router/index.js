import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import SyncStatus from '@/components/SyncStatus'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SyncStatus',
      component: SyncStatus
    }
  ]
})
