import { EventEmitter } from "node:events";
import type { LomrakChangeEvent } from "@/types/lomrak";

class EventBroadcaster {
  private emitter: EventEmitter;
  private readonly EVENT_NAME = "lomrak:data-changed";

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  public broadcastChange(payload?: Partial<LomrakChangeEvent>): void {
    const event: LomrakChangeEvent = {
      type: "data-changed",
      timestamp: new Date().toISOString(),
      source: payload?.source || "manual_trigger",
      ...payload,
    };
    this.emitter.emit(this.EVENT_NAME, event);
  }

  public subscribe(listener: (event: LomrakChangeEvent) => void): () => void {
    this.emitter.on(this.EVENT_NAME, listener);
    return () => {
      this.emitter.off(this.EVENT_NAME, listener);
    };
  }

  public getListenerCount(): number {
    return this.emitter.listenerCount(this.EVENT_NAME);
  }
}

// Preserve single instance on globalThis across Hot Module Replacement (HMR) and route chunks in Node.js
const globalForBroadcaster = globalThis as unknown as {
  lomrakEventBroadcaster?: EventBroadcaster;
};

export const eventBroadcaster =
  globalForBroadcaster.lomrakEventBroadcaster ?? new EventBroadcaster();

// Unconditionally bind to globalThis so all route chunks share the same instance in dev and production
globalForBroadcaster.lomrakEventBroadcaster = eventBroadcaster;
