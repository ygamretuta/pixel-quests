import { get } from "@vercel/blob";
import { isParent } from "@/server/auth";
import { sql } from "@/server/db";

export async function GET(_request: Request, ctx: RouteContext<"/api/evidence/[id]">) {
  if (!(await isParent())) return new Response("Forbidden", { status: 403 });

  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });

  const [row] = await sql`SELECT evidence_path FROM hits WHERE id = ${id}`;
  if (!row?.evidence_path) return new Response("Not found", { status: 404 });

  const result = await get(row.evidence_path, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
