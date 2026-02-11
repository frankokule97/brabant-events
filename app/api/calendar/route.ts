import { NextResponse } from "next/server";
import { createEventIcs } from "@/lib/ics";
import { fetchAppEventById } from "@/lib/api/fetchEventById";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const event = await fetchAppEventById(id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ics = createEventIcs(event);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
