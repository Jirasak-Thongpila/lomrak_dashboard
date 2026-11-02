import { describe, it, expect } from "bun:test";
import { POST } from "../src/app/api/lomrak/webhook/route";
import { eventBroadcaster } from "../src/lib/event-broadcaster";
import type { LomrakChangeEvent } from "../src/types/lomrak";

describe("Lomrak Webhook Route Handler", () => {
  it("receives POST and broadcasts change event", async () => {
    let broadcastedEvent: LomrakChangeEvent | null = null;
    const unsub = eventBroadcaster.subscribe((e) => {
      broadcastedEvent = e;
    });

    const body = JSON.stringify({ event: "edit", sheetName: "หมู่บ้านชุมชนล้อมรักษ์" });
    const req = new Request("http://localhost:3000/api/lomrak/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ok");

    expect(broadcastedEvent).not.toBeNull();
    const event = broadcastedEvent as unknown as LomrakChangeEvent;
    expect(event.type).toBe("data-changed");
    expect(event.source).toBe("google_sheets_webhook");

    unsub();
  });
});
