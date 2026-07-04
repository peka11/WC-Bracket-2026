import { NextResponse, type NextRequest } from "next/server";

async function runSync(req: NextRequest) {
  const secret =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    req.headers.get("x-admin-key");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const res = await fetch(`${base}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": process.env.CRON_SECRET ?? "" },
    body: JSON.stringify({ source: "cron" }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** Vercel Cron invokes this route with GET */
export async function GET(req: NextRequest) {
  return runSync(req);
}

export async function POST(req: NextRequest) {
  return runSync(req);
}
