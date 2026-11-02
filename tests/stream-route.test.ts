import { describe, it, expect } from "bun:test";
import { GET } from "../src/app/api/lomrak/stream/route";

describe("Lomrak SSE Stream Route Handler", () => {
  it("returns 200 with text/event-stream headers", async () => {
    const controller = new AbortController();
    const req = new Request("http://localhost:3000/api/lomrak/stream", {
      signal: controller.signal,
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");

    // Clean up
    controller.abort();
  });
});
