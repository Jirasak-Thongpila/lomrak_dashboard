import { NextResponse } from "next/server";
import { eventBroadcaster } from "@/lib/event-broadcaster";

export async function POST(request: Request) {
  try {
    let payload: Record<string, unknown> = {};
    try {
      payload = await request.json();
    } catch {
      // Body may be empty or form-encoded
    }

    const timestamp = new Date().toISOString();

    // Broadcast the change event to all active SSE browser connections
    eventBroadcaster.broadcastChange({
      type: "data-changed",
      source: "google_sheets_webhook",
      timestamp,
    });

    return NextResponse.json({
      status: "ok",
      message: "Change event broadcasted successfully",
      timestamp,
      payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}

// Allow GET for ping / health-check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Lomrak Webhook endpoint is active and listening for POST events",
    activeListeners: eventBroadcaster.getListenerCount(),
  });
}
