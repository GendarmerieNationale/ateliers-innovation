import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import store from '@/store';
import MaPage from '@/views/MaPage.vue';

// On va rechercher tous les outils
/* eslint-disable */
const outils = require.context(
  './outils/',
  false,
  /^((?!(js)).){3,}$/,
)
  .keys()
  .map((o) => require(`./outils/${o.split('/')[1]}`).chemins)
  .flat();
/* eslint-ensable */

const routes = [
  {
    path: '/force',
    name: 'AccueilForce',
    component: () => import('@/views/Accueil.vue'),
    meta: {
      title: 'Accueil',
    },
  },
  {
    path: '/',
    name: 'Accueil',
    component: () => import(/* webpackChunkName: "accueil" */ '@/views/Accueil.vue'),
    meta: {
      title: 'Accueil',
    },
  },
  {
    path: '/introuvable',
    name: 'Introuvable',
    component: () => import(/* webpackChunkName: "introuvable" */ '@/views/Introuvable.vue'),
  },
  {
    path: '/mapage',
    name: 'MaPage',
    component: MaPage,
    meta: {
      title: 'Ma page',
      titreDroite: 'Ma page',
    },
  },
  {
    path: '/profil/:id',
    name: 'Profil',
    component: () => import('@/views/Profil.vue'),
    meta: {
      title: 'Profil',
    },
  },
  {
    path: '/projet/:id',
    name: 'Projet',
    component: () => import('@/views/Projet.vue'),
    meta: {
      title: 'Projet',
    },
    children: [
      {
        path: '',
        component: () => import('@/components/projets/Presentation.vue'),
        meta: {
          title: 'Présentation du projet',
        },
      },
      {
        path: 'membres',
        component: () => import('@/components/projets/Membres.vue'),
        meta: {
          title: 'Membres',
        },
      },
      {
        path: 'adi',
        component: () => import('@/components/projets/ADI.vue'),
        meta: {
          title: 'ADI',
        },
      },
      {
        path: 'adp',
        component: () => import('@/components/projets/ADP.vue'),
        meta: {
          title: 'ADP',
        },
      },
      {
        path: 'gendfablab',
        name: 'GendFabLabProjet',
        component: () => import('@/components/projets/Gendfablab.vue'),
        meta: {
          title: 'Gendfablab',
        },
      },
      {
        path: 'fppi',
        name: 'FPPIProjet',
        component: () => import('@/components/projets/FPPI.vue'),
        meta: {
          title: 'FPPI',
        },
      },
    ],
  },
]
  .concat(outils);

const router = createRouter({
  base: process.env.VUE_APP_PUBLICPATH,
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const DEFAULT_TITLE = process.env.VUE_APP_TITLE;
router.afterEach((to) => {
  /* On regarde si on est sur une autre page que la page d'accueil
    pour changer le fond
  */
  if (to.path.startsWith('/outils')
    || to.path.startsWith('/projet')
    || to.path.startsWith('/badges')
  ) {
    document.body.classList.add('bg-light');
  } else {
    document.body.classList.remove('bg-light');
  }

  store.dispatch('nav/chargerTitre', to.meta.titreDroite);
  nextTick(() => {
    document.title = to.meta.title ? `${DEFAULT_TITLE} - ${to.meta.title}` : DEFAULT_TITLE;
  });
});

export default router;
