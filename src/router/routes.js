const routes = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '', component: () => import('pages/IndexPage.vue') },
			{
				path: '/geolocation',
				name: 'geolocation',
				component: () => import('pages/CapacitorGeoLocate.vue'),
			},
			//
			{
				path: '/geolocation2',
				name: 'geolocation2',
				component: () => import('pages/CapacitorGeoLocate2.vue'),
			},
		],
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue'),
	},
];

export default routes;
