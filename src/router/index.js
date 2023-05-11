import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes =
  [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/example',
      name: 'example',
      component: () => import('../views/Learn/learn.vue')
    },
  ]

const router = new VueRouter({ routes })

export default router
