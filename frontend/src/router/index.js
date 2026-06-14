import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 静态路由
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', icon: 'User' }
      },
      {
        path: 'park/overview',
        name: 'ParkOverview',
        component: () => import('@/views/park/Overview.vue'),
        meta: { title: '园区概览', icon: 'HomeFilled', permission: 'park:overview:list' }
      },
      {
        path: 'park/building',
        name: 'ParkBuilding',
        component: () => import('@/views/park/Building.vue'),
        meta: { title: '楼宇管理', icon: 'OfficeBuilding', permission: 'park:building:list' }
      },
      {
        path: 'park/floor',
        name: 'ParkFloor',
        component: () => import('@/views/park/Floor.vue'),
        meta: { title: '楼层管理', icon: 'Grid', permission: 'park:floor:list' }
      },
      {
        path: 'park/dashboard',
        name: 'ParkDashboard',
        component: () => import('@/views/park/Dashboard.vue'),
        meta: { title: '统计看板', icon: 'DataAnalysis', permission: 'park:dashboard:list' }
      },
      {
        path: 'park/building/detail/:id',
        name: 'ParkBuildingDetail',
        component: () => import('@/views/park/BuildingDetail.vue'),
        meta: { title: '楼宇详情', icon: 'OfficeBuilding', permission: 'park:building:list', hidden: true }
      },
      {
        path: 'park/floor/detail/:id',
        name: 'ParkFloorDetail',
        component: () => import('@/views/park/FloorDetail.vue'),
        meta: { title: '楼层详情', icon: 'Grid', permission: 'park:floor:list', hidden: true }
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/User.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'system:user:list' }
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理', icon: 'Avatar', permission: 'system:role:list' }
      },
      {
        path: 'system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/Menu.vue'),
        meta: { title: '菜单管理', icon: 'Menu', permission: 'system:menu:list' }
      },
      {
        path: 'system/dataPerm',
        name: 'SystemDataPerm',
        component: () => import('@/views/system/DataPermission.vue'),
        meta: { title: '数据权限', icon: 'Lock', permission: 'system:dataPerm:list' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '404', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智慧园区物业管理系统` : '智慧园区物业管理系统'
  
  const userStore = useUserStore()
  const token = userStore.token
  
  // 不需要认证的页面
  if (to.meta.requiresAuth === false) {
    if (token && to.path === '/login') {
      next('/')
    } else {
      next()
    }
    return
  }
  
  // 需要认证的页面
  if (!token) {
    next('/login')
    return
  }
  
  // 检查用户信息是否已加载
  if (!userStore.user) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      userStore.logout()
      next('/login')
      return
    }
  }
  
  // 检查权限
  if (to.meta.permission) {
    const hasPermission = userStore.hasPermission(to.meta.permission)
    if (!hasPermission) {
      next('/dashboard')
      return
    }
  }
  
  next()
})

export default router
