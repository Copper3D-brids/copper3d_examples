import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  createWebHistory,
} from "vue-router";
// import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "index" */ "../pages/index.vue"),
  },
  {
    path: "/example01",
    name: "Example01",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "example01" */ "../pages/example01.vue"),
  },
  {
    path: "/example02",
    name: "Example02",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "example01" */ "../pages/example02.vue"),
  },
  {
    path: "/example03",
    name: "Example03",
    component: () =>
      import(/* webpackChunkName: "example01" */ "../pages/example03.vue"),
  },
  {
    path: "/example04",
    name: "Example04",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example04_setupModelPosition.vue"
      ),
  },
  {
    path: "/example05",
    name: "Example05",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example05_kiwrious.vue"
      ),
  },
  {
    path: "/example06",
    name: "Example06",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example06_drag_Nrrd.vue"
      ),
  },
  {
    path: "/example07",
    name: "Example07",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example07_whole_nrrd.vue"
      ),
  },
  // {
  //   path: "/example08",
  //   name: "Example08",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "example01" */ "../pages/example08_dragAnddraw_Nrrd.vue"
  //     ),
  // },
  {
    path: "/example09",
    name: "Example09",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example09_2d_texture.vue"
      ),
  },
  // {
  //   path: "/example10",
  //   name: "Example10",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "example01" */ "../pages/example10_segmentaion_v1.vue"
  //     ),
  // },
  // {
  //   path: "/example11",
  //   name: "Example11",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "example01" */ "../pages/example10_segmentaion_v2.vue"
  //     ),
  // },
  {
    path: "/example12",
    name: "Example12",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example12_2d_texture_heart.vue"
      ),
  },
  {
    path: "/example13",
    name: "Example13",
    component: () =>
      import(
        /* webpackChunkName: "example01" */ "../pages/example13_segmentation_CS.vue"
      ),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
