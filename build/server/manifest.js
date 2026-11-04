const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["[REMAN65] MANTIS_ View Unit History.html","redbc001_1.html","redbc001_2.html","redbc001_3.html","reman61a_1.html","reman61a_2.html","reman61a_3.html","reman61a_4.html","reman65_1.html","reman65_2.html","reman65_3.html","robots.txt","utils/GoogleChromePortable.exe"]),
	mimeTypes: {".html":"text/html",".txt":"text/plain",".exe":"application/octet-stream"},
	_: {
		client: {start:"_app/immutable/entry/start.gwDH40j2.js",app:"_app/immutable/entry/app.C3YBnIs0.js",imports:["_app/immutable/entry/start.gwDH40j2.js","_app/immutable/chunks/Dthhb0yr.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/entry/app.C3YBnIs0.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BSPkyMDe.js')),
			__memo(() => import('./chunks/1-CFN5lkoH.js')),
			__memo(() => import('./chunks/2-DT6ZBGGF.js')),
			__memo(() => import('./chunks/3-B8YesA6_.js')),
			__memo(() => import('./chunks/4-DPwzqDZf.js')),
			__memo(() => import('./chunks/5-BNLOYaPX.js')),
			__memo(() => import('./chunks/6-lW6gjrLm.js')),
			__memo(() => import('./chunks/7-BYxF3U8Z.js')),
			__memo(() => import('./chunks/8-D4oj7saQ.js')),
			__memo(() => import('./chunks/9-CmGSGHQo.js')),
			__memo(() => import('./chunks/10-CLIDODhT.js')),
			__memo(() => import('./chunks/11-C_mQ6_4Y.js')),
			__memo(() => import('./chunks/12-DhuFxD4s.js')),
			__memo(() => import('./chunks/13-DJ0bbHWA.js')),
			__memo(() => import('./chunks/14-CsAnb2s0.js')),
			__memo(() => import('./chunks/15-BjY2Rreb.js')),
			__memo(() => import('./chunks/16-B7Wbvr1R.js')),
			__memo(() => import('./chunks/17-BOomMCT7.js')),
			__memo(() => import('./chunks/18-B9c8HFzy.js'))
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
				endpoint: __memo(() => import('./chunks/_server-BaqTOfp5.js'))
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
				id: "/admin/failure-review",
				pattern: /^\/admin\/failure-review\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/health",
				pattern: /^\/admin\/health\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/rates",
				pattern: /^\/admin\/rates\/?$/,
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
				endpoint: __memo(() => import('./chunks/_server-B4AO85Ug.js'))
			},
			{
				id: "/api/export/csv",
				pattern: /^\/api\/export\/csv\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BcDT_ydi.js'))
			},
			{
				id: "/api/notifier/andon-toggle",
				pattern: /^\/api\/notifier\/andon-toggle\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Bb5ljZSK.js'))
			},
			{
				id: "/api/oee/update",
				pattern: /^\/api\/oee\/update\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BykGXB8E.js'))
			},
			{
				id: "/api/planning/upload",
				pattern: /^\/api\/planning\/upload\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BH-KxcLm.js'))
			},
			{
				id: "/api/scrape/custom",
				pattern: /^\/api\/scrape\/custom\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-D6I4GcFa.js'))
			},
			{
				id: "/api/scrape/scrap-tickets",
				pattern: /^\/api\/scrape\/scrap-tickets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-3Sna50yR.js'))
			},
			{
				id: "/api/stats",
				pattern: /^\/api\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-D38dq74P.js'))
			},
			{
				id: "/api/sync",
				pattern: /^\/api\/sync\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b7r-J0Cp.js'))
			},
			{
				id: "/api/volume",
				pattern: /^\/api\/volume\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Dlw9i5ol.js'))
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
				endpoint: __memo(() => import('./chunks/_server-CwF1-sTY.js'))
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
