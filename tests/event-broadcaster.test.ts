import { describe, it, expect } from "bun:test";
import { eventBroadcaster } from "../src/lib/event-broadcaster";
import type { LomrakChangeEvent } from "../src/types/lomrak";

describe("Event Broadcaster", () => {
  it("subscribes and receives broadcast events", () => {
    let received: LomrakChangeEvent | null = null;
    const unsubscribe = eventBroadcaster.subscribe((event) => {
      received = event;
    });

    eventBroadcaster.broadcastChange({ source: "google_sheets_webhook" });

    expect(received).not.toBeNull();
    const event = received as unknown as LomrakChangeEvent;
    expect(event.type).toBe("data-changed");
    expect(event.source).toBe("google_sheets_webhook");
    expect(event.timestamp).toBeDefined();

    unsubscribe();
  });

  it("unsubscribes cleanly and decreases listener count", () => {
    const initialCount = eventBroadcaster.getListenerCount();
    const unsubscribe = eventBroadcaster.subscribe(() => {});

    expect(eventBroadcaster.getListenerCount()).toBe(initialCount + 1);

    unsubscribe();
    expect(eventBroadcaster.getListenerCount()).toBe(initialCount);
  });

  it("broadcasts to multiple subscribers", () => {
    let count1 = 0;
    let count2 = 0;

    const un1 = eventBroadcaster.subscribe(() => { count1++; });
    const un2 = eventBroadcaster.subscribe(() => { count2++; });

    eventBroadcaster.broadcastChange();

    expect(count1).toBe(1);
    expect(count2).toBe(1);

    un1();
    un2();
  });
});
