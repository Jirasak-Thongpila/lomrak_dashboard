import { describe, it, expect } from "bun:test";
import { GET } from "../src/app/api/lomrak/route";

describe("Lomrak API Route Handler", () => {
  it("returns fallback data when GAS_API_URL is not set", async () => {
    const req = new Request("http://localhost:3000/api/lomrak");
    const response = await GET(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("success");
    expect(data.source).toBe("fallback_cache");
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].district).toBeDefined();
  });
});
