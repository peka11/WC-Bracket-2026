import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Serves exact Adsterra Native Banner HTML (zone 30117835). */
export async function GET() {
  const invoke =
    process.env.NEXT_PUBLIC_NATIVE_BANNER_INVOKE_URL ??
    "https://pl30218334.effectivecpmnetwork.com/9b7bc6245103df02fe50f72e1e4e4d2f/invoke.js";
  const containerId =
    process.env.NEXT_PUBLIC_NATIVE_BANNER_CONTAINER_ID ??
    "container-9b7bc6245103df02fe50f72e1e4e4d2f";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer-when-downgrade">
<style>html,body{margin:0;padding:0;background:transparent}</style>
</head>
<body>
<script async="async" data-cfasync="false" src="${invoke}"></script>
<div id="${containerId}"></div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
