const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["redbc001_1.html","redbc001_2.html","redbc001_3.html","reman61a_1.html","reman61a_2.html","reman61a_3.html","reman65_1.html","reman65_2.html","reman65_3.html","robots.txt","utils/GoogleChromePortable.exe","[REMAN65] MANTIS_ View Unit History.html"]),
	mimeTypes: {".html":"text/html",".txt":"text/plain",".exe":"application/octet-stream"},
	_: {
		client: {start:"_app/immutable/entry/start.CziVd8Wv.js",app:"_app/immutable/entry/app.Da1i_hwD.js",imports:["_app/immutable/entry/start.CziVd8Wv.js","_app/immutable/chunks/D3yo-TEn.js","_app/immutable/chunks/pNTMqyZV.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/entry/app.Da1i_hwD.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/pNTMqyZV.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-gkagwu6i.js')),
			__memo(() => import('./chunks/1-DaC1W2YH.js')),
			__memo(() => import('./chunks/2-BhpUTIKE.js')),
			__memo(() => import('./chunks/3-DlXNM1Iy.js')),
			__memo(() => import('./chunks/4-BJ1pK_Kn.js')),
			__memo(() => import('./chunks/5-uEcvL5X1.js')),
			__memo(() => import('./chunks/6-B47zlxme.js')),
			__memo(() => import('./chunks/7-BF5KXvFJ.js')),
			__memo(() => import('./chunks/8-L43zxXIg.js')),
			__memo(() => import('./chunks/9-CYy0L64x.js')),
			__memo(() => import('./chunks/10-B61VDu4d.js')),
			__memo(() => import('./chunks/11-DVha4a7k.js')),
			__memo(() => import('./chunks/12-CAx1iBZI.js')),
			__memo(() => import('./chunks/13-C2_D5sL-.js')),
			__memo(() => import('./chunks/14-CEGOc82I.js')),
			__memo(() => import('./chunks/15-DX0cZ9oB.js')),
			__memo(() => import('./chunks/16-C3DYh1jn.js')),
			__memo(() => import('./chunks/17-rySZDTkY.js')),
			__memo(() => import('./chunks/18-hKSpI6Nh.js'))
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
				endpoint: __memo(() => import('./chunks/_server-BrN3luqF.js'))
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
				endpoint: __memo(() => import('./chunks/_server-BT1PRJSM.js'))
			},
			{
				id: "/api/export/csv",
				pattern: /^\/api\/export\/csv\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BNyrZOS2.js'))
			},
			{
				id: "/api/notifier/andon-toggle",
				pattern: /^\/api\/notifier\/andon-toggle\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-mqm6veiG.js'))
			},
			{
				id: "/api/notifier/andon-trigger",
				pattern: /^\/api\/notifier\/andon-trigger\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Do2HKdqt.js'))
			},
			{
				id: "/api/oee/update",
				pattern: /^\/api\/oee\/update\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CeBj3YD1.js'))
			},
			{
				id: "/api/planning/upload",
				pattern: /^\/api\/planning\/upload\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DywprgF4.js'))
			},
			{
				id: "/api/scrape/custom",
				pattern: /^\/api\/scrape\/custom\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-C_0kP0FX.js'))
			},
			{
				id: "/api/scrape/scrap-tickets",
				pattern: /^\/api\/scrape\/scrap-tickets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CmC-fPeA.js'))
			},
			{
				id: "/api/stats",
				pattern: /^\/api\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DbY1h0nO.js'))
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
				endpoint: __memo(() => import('./chunks/_server-eAhFM9z1.js'))
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
