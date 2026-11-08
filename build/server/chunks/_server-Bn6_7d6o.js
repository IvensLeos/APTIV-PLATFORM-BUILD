import { l as logLine } from './log-Dpp269sc.js';
import { b as broadcastManager } from './broadcast-BxLMKe3z.js';
import './db-BvaPBFyI.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/api/escalations-stream/+server.js
function GET() {
	let unsubscribe;
	let heartbeatInterval;
	const stream = new ReadableStream({
		async start(controller) {
			await broadcastManager.ready();
			const sendEvent = (data) => {
				try {
					const stringData = typeof data === "object" ? JSON.stringify(data) : data;
					controller.enqueue(`data: ${stringData}\n\n`);
				} catch (e) {
					console.error(logLine("andon", "sse serializacion fallida", { route: "/api/escalations-stream" }), e);
				}
			};
			unsubscribe = broadcastManager.subscribe(sendEvent);
			heartbeatInterval = setInterval(() => {
				try {
					controller.enqueue(": ping\n\n");
				} catch (err) {
					clearInterval(heartbeatInterval);
				}
			}, 3e4);
		},
		cancel() {
			if (unsubscribe) unsubscribe();
			if (heartbeatInterval) clearInterval(heartbeatInterval);
			console.log(logLine("andon", "sse cerrado", {
				route: "/api/escalations-stream",
				listeners: broadcastManager.clientCount()
			}));
		}
	});
	return new Response(stream, { headers: {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		"Connection": "keep-alive",
		"X-Accel-Buffering": "no"
	} });
}

export { GET };
//# sourceMappingURL=_server-Bn6_7d6o.js.map
