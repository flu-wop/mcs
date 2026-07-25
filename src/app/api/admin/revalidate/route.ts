// src/app/api/admin/revalidate/route.ts
//
// Covered by src/middleware.ts (matcher includes /api/admin/:path*) —
// same admin session cookie as everything else under /admin, no separate
// auth logic here.
//
// The merch catalog is cached for 1 hour (see lib/printify.ts pfGet,
// next: { revalidate: 3600 }). That means a mockup swap, price change,
// or newly-published product in the Printify dashboard can take up to
// an hour to show up on the live site. Hit this route after making
// catalog changes in Printify to clear it immediately instead of waiting:
//
//   curl -u admin:YOUR_ADMIN_PASSWORD https://midcitysound.com/api/admin/revalidate

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  revalidatePath("/merch");
  revalidatePath("/merch/[slug]", "page");
  revalidatePath("/merch/brand/[brand]", "page");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
