import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const width = Number(req.nextUrl.searchParams.get("w") ?? 728);
  const height = Number(req.nextUrl.searchParams.get("h") ?? 90);
  const zone = process.env.NEXT_PUBLIC_AD_ZONE_ID ?? "30117834";
  const host = process.env.NEXT_PUBLIC_AD_INVOKE_HOST ?? "www.highperformanceformat.com";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer-when-downgrade">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head>
<body>
<script type="text/javascript">
atOptions = {
  key: '${zone}',
  format: 'iframe',
  height: ${height},
  width: ${width},
  params: {}
};
</script>
<script type="text/javascript" src="https://${host}/${zone}/invoke.js"></script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
