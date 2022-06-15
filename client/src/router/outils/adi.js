const chemins = [
  {
    path: '/outils/adi',
    name: 'Ateliers de l\'Innovation',
    component: () => import('@/components/outils/adi/ADI.vue'),
    children: [
      {
        path: '',
        component: () => import('@/components/outils/adi/Explications.vue'),
      },
      {
        path: 'campagnes',
        name: 'adi_Campagnes',
        component: () => import('@/components/outils/adi/Campagnes.vue'),
      },
      {
        path: 'campagne/:id',
        name: 'adi_Campagne',
        component: () => import('@/components/outils/adi/Campagne.vue'),
      },
      {
        path: 'categories',
        name: 'adi_Categories',
        component: () => import('@/components/outils/adi/Categories.vue'),
      },
      {
        path: 'repertoires',
        name: 'adi_Repertoires',
        component: () => import('@/components/outils/adi/Repertoires.vue'),
      },
      {
        path: 'repertoires/:id',
        name: 'adi_DetailRepertoire',
        component: () => import('@/components/outils/adi/DetailRepertoire.vue'),
      },
      {
        path: 'projets',
        name: 'adi_Projets',
        component: () => import('@/components/outils/adi/Projets.vue'),
      },
      {
        path: 'adp',
        name: 'adi_ADP',
        component: () => import('@/components/outils/adi/ADP.vue'),
        children: [
          {
            path: ':annee',
            name: 'adi_ADP_annee',
            component: () => import('@/components/outils/adi/ADP.vue'),
          },
        ],
      },
    ],
  },
];
module.exports = { chemins };
