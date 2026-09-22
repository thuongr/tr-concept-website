import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const permissionStatuses = new Set([
  "NOT_REQUESTED",
  "REQUESTED",
  "APPROVED",
  "WITHDRAWN",
]);

const statuses = new Set(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);

  const id = typeof body?.id === "string" ? body.id : "";
  const permissionStatus =
    typeof body?.permissionStatus === "string" ? body.permissionStatus : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!id || !permissionStatuses.has(permissionStatus) || !statuses.has(status)) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  if (status === "PUBLISHED" && permissionStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Case studies cannot be published until permission is approved." },
      { status: 409 }
    );
  }

  if (permissionStatus === "WITHDRAWN" && status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Withdrawn permission cannot remain published." },
      { status: 409 }
    );
  }

  const nextStatus = permissionStatus === "WITHDRAWN" ? "ARCHIVED" : status;

  const { error } = await supabase
    .from("case_studies")
    .update({
      permission_status: permissionStatus,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
