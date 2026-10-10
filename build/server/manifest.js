const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["[REMAN65] MANTIS_ View Unit History.html","redbc001_1.html","redbc001_2.html","redbc001_3.html","reman61a_1.html","reman61a_2.html","reman61a_3.html","reman65_1.html","reman65_2.html","reman65_3.html","robots.txt","utils/GoogleChromePortable.exe"]),
	mimeTypes: {".html":"text/html",".txt":"text/plain",".exe":"application/octet-stream"},
	_: {
		client: {start:"_app/immutable/entry/start.CZ8VOjA3.js",app:"_app/immutable/entry/app.7jrQR7YN.js",imports:["_app/immutable/entry/start.CZ8VOjA3.js","_app/immutable/chunks/1sVCy6Mt.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/entry/app.7jrQR7YN.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BeD_M0zS.js')),
			__memo(() => import('./chunks/1-E5uJjbEm.js')),
			__memo(() => import('./chunks/2-Bw93m9iv.js')),
			__memo(() => import('./chunks/3-DeyF-dcF.js')),
			__memo(() => import('./chunks/4-aSPAdvMz.js')),
			__memo(() => import('./chunks/5-Bx5SC0qa.js')),
			__memo(() => import('./chunks/6-D1n83xyX.js')),
			__memo(() => import('./chunks/7-T0eHLFf1.js')),
			__memo(() => import('./chunks/8-Bjk1XUss.js')),
			__memo(() => import('./chunks/9-CO35fenG.js')),
			__memo(() => import('./chunks/10-Ca_j1xqn.js')),
			__memo(() => import('./chunks/11-CNX0mtr_.js')),
			__memo(() => import('./chunks/12-WZ0c1t-2.js')),
			__memo(() => import('./chunks/13-C8_NNWId.js')),
			__memo(() => import('./chunks/14-D_C2EYSp.js')),
			__memo(() => import('./chunks/15-C4vuQPoT.js')),
			__memo(() => import('./chunks/16-Csa2VajG.js')),
			__memo(() => import('./chunks/17-DMsEoeIb.js')),
			__memo(() => import('./chunks/18-pHI5B6Av.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin/backup",
				pattern: /^\/admin\/backup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin/backup/download",
				pattern: /^\/admin\/backup\/download\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ROgZvZeI.js'))
			},
			{
				id: "/admin/conversions-scrape",
				pattern: /^\/admin\/conversions-scrape\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin/custom-scrape",
				pattern: /^\/admin\/custom-scrape\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/export",
				pattern: /^\/admin\/export\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/health",
				pattern: /^\/admin\/health\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/mapping",
				pattern: /^\/admin\/mapping\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/planning",
				pattern: /^\/admin\/planning\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/scrap-tickets",
				pattern: /^\/admin\/scrap-tickets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/scrapelogs",
				pattern: /^\/admin\/scrapelogs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/taxonomy",
				pattern: /^\/admin\/taxonomy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/users",
				pattern: /^\/admin\/users\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/api/escalations-stream",
				pattern: /^\/api\/escalations-stream\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-C984yBsH.js'))
			},
			{
				id: "/api/export/csv",
				pattern: /^\/api\/export\/csv\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-yT17K_2D.js'))
			},
			{
				id: "/api/notifier/andon-toggle",
				pattern: /^\/api\/notifier\/andon-toggle\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BSz3vmHp.js'))
			},
			{
				id: "/api/oee/update",
				pattern: /^\/api\/oee\/update\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Ca2xyLpJ.js'))
			},
			{
				id: "/api/planning/upload",
				pattern: /^\/api\/planning\/upload\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BSXGHazR.js'))
			},
			{
				id: "/api/scrape/custom",
				pattern: /^\/api\/scrape\/custom\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Bh-LtaOq.js'))
			},
			{
				id: "/api/scrape/scrap-tickets",
				pattern: /^\/api\/scrape\/scrap-tickets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-KGDKnucV.js'))
			},
			{
				id: "/api/stats",
				pattern: /^\/api\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-_In65uRp.js'))
			},
			{
				id: "/api/sync",
				pattern: /^\/api\/sync\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BgR-3ZJ7.js'))
			},
			{
				id: "/api/volume",
				pattern: /^\/api\/volume\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-o0lRBhMA.js'))
			},
			{
				id: "/capture/[process]",
				pattern: /^\/capture\/([^/]+?)\/?$/,
				params: [{"name":"process","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/capture/[process]/[machine]",
				pattern: /^\/capture\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"process","optional":false,"rest":false,"chained":false},{"name":"machine","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/dashboard/[process]",
				pattern: /^\/dashboard\/([^/]+?)\/?$/,
				params: [{"name":"process","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/logout",
				pattern: /^\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-D0TOe3bf.js'))
			},
			{
				id: "/notifier/andon",
				pattern: /^\/notifier\/andon\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
