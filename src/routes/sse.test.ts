import { describe, expect, it } from "vitest";
import { createSseManager } from "./sse.js";

describe("SSE manager", () => {
  it("GET /sse returns SSE content type", async () => {
    const sse = createSseManager();
    const res = await sse.app.request("/sse");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });

  it("tracks connected clients", () => {
    const sse = createSseManager();
    expect(sse.clients.size).toBe(0);
  });

  it("closeAll clears all clients", () => {
    const sse = createSseManager();
    const mockClient = {
      send: () => {},
      close: () => {},
    };
    sse.clients.add(mockClient);
    expect(sse.clients.size).toBe(1);
    sse.closeAll();
    expect(sse.clients.size).toBe(0);
  });

  it("broadcast calls send on all clients", () => {
    const sse = createSseManager();
    const sent: { event: string; data: string }[] = [];
    const mockClient = {
      send: (event: string, data: string) => {
        sent.push({ event, data });
      },
      close: () => {},
    };
    sse.clients.add(mockClient);
    sse.broadcast("file-changed", '{"path":"test.md"}');
    expect(sent).toEqual([
      { event: "file-changed", data: '{"path":"test.md"}' },
    ]);
  });
});
