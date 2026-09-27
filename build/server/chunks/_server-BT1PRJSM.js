import { b as broadcastManager } from './broadcast-Bg8zhrwn.js';
import './db-W1d6-Une.js';
import './private-C3tFArXN.js';
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
					console.error("❌ Error serializando datos para SSE:", e);
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
			console.log("🔌 Cliente Andon (Bocinas/Pantalla) desconectado del Stream.");
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
//# sourceMappingURL=_server-BT1PRJSM.js.map
