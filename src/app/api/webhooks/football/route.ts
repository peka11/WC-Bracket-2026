import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  await fetch(`${base}/api/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": process.env.CRON_SECRET ?? "",
    },
    body: JSON.stringify({ source: "webhook", payload }),
  });

  return NextResponse.json({ received: true });
}
