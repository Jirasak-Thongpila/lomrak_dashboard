import { eventBroadcaster } from "@/lib/event-broadcaster";
import type { LomrakChangeEvent } from "@/types/lomrak";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`)
      );

      // 2. Subscribe to change events from the broadcaster
      const unsubscribe = eventBroadcaster.subscribe((event: LomrakChangeEvent) => {
        try {
          const payload = `event: data-changed\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream might be closed
        }
      });

      // 3. Keep-alive heartbeat every 20 seconds to prevent proxy disconnects
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          // Stream might be closed
        }
      }, 20000);

      // 4. Clean up when client disconnects
      const onAbort = () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      if (request.signal) {
        request.signal.addEventListener("abort", onAbort);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
