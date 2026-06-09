import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const supportBucket = "support-attachments";
const maxAttachmentBytes = 10 * 1024 * 1024;
const ticketCategories = new Set(["soporte", "bug", "cuenta", "juego", "otro"]);
const priorities = new Set(["baja", "media", "alta"]);
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "video/mp4",
  "video/quicktime",
]);

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function redirectWithError(error: string) {
  return relativeRedirect(`/cuenta?support_error=${encodeURIComponent(error)}#soporte`);
}

function sanitizeFilename(value: string) {
  const fallback = "archivo";
  const [name = fallback, extension = ""] = value.split(/\.(?=[^.]+$)/);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || fallback;
  const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  return cleanExtension ? `${cleanName}.${cleanExtension}` : cleanName;
}

function attachmentFromForm(formData: FormData) {
  const value = formData.get("attachment");
  return value instanceof File && value.size > 0 ? value : null;
}

async function ensureSupportBucket(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const { error } = await admin.storage.getBucket(supportBucket);
  if (!error) return true;

  const { error: createError } = await admin.storage.createBucket(supportBucket, {
    public: false,
    fileSizeLimit: maxAttachmentBytes,
    allowedMimeTypes: Array.from(allowedAttachmentTypes),
  });

  return !createError;
}

async function uploadAttachment(admin: ReturnType<typeof createSupabaseAdminClient>, file: File | null, playerId: string, type: string) {
  if (!file) return { attachment: null, error: null };
  if (file.size > maxAttachmentBytes) return { attachment: null, error: "attachment_size" };
  if (!allowedAttachmentTypes.has(file.type)) return { attachment: null, error: "attachment_type" };
  if (!await ensureSupportBucket(admin)) return { attachment: null, error: "attachment_bucket" };

  const filename = sanitizeFilename(file.name);
  const storagePath = `${type}/${playerId}/${Date.now()}-${crypto.randomUUID()}-${filename}`;
  const { error } = await admin.storage.from(supportBucket).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("support attachment upload failed", { playerId, type, error: error.message });
    return { attachment: null, error: "attachment_failed" };
  }

  return {
    attachment: {
      bucket: supportBucket,
      storagePath,
      fileName: filename,
      originalFileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
    error: null,
  };
}

async function saveAttachmentMetadata(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  attachment: NonNullable<Awaited<ReturnType<typeof uploadAttachment>>["attachment"]>,
  owner: { playerId: string; ticketId?: string; reportId?: string },
) {
  const { error } = await admin.from("support_attachments").insert({
    player_id: owner.playerId,
    ticket_id: owner.ticketId ?? null,
    report_id: owner.reportId ?? null,
    bucket: attachment.bucket,
    storage_path: attachment.storagePath,
    file_name: attachment.originalFileName,
    mime_type: attachment.mimeType,
    size_bytes: attachment.sizeBytes,
  });

  if (error) console.error("support attachment metadata failed", { playerId: owner.playerId, error: error.message });
}

function appendAttachmentReference(text: string, attachment: Awaited<ReturnType<typeof uploadAttachment>>["attachment"]) {
  if (!attachment) return text;
  return `${text}\n\nAdjunto en Supabase: ${attachment.bucket}/${attachment.storagePath}`;
}

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return redirectWithError("invalid_origin");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return relativeRedirect("/login");

  const formData = await request.formData();
  const type = cleanText(formData.get("type"), 20);
  const admin = createSupabaseAdminClient();
  const { data: player } = await admin.from("players").select("id,username,email").eq("profile_id", user.id).maybeSingle();

  if (!player) return redirectWithError("player_missing");
  const file = attachmentFromForm(formData);

  if (type === "ticket") {
    const category = cleanText(formData.get("category"), 40).toLowerCase();
    const subject = cleanText(formData.get("subject"), 120);
    const message = cleanText(formData.get("message"), 2000);
    const priority = cleanText(formData.get("priority"), 20).toLowerCase() || "media";

    if (!ticketCategories.has(category) || !priorities.has(priority) || subject.length < 6 || message.length < 20) {
      return redirectWithError("invalid_ticket");
    }

    const { attachment, error: attachmentError } = await uploadAttachment(admin, file, player.id, "tickets");
    if (attachmentError) return redirectWithError(attachmentError);

    const { data, error } = await admin.from("tickets").insert({
      player_id: player.id,
      category,
      subject,
      message: appendAttachmentReference(message, attachment),
      priority,
      status: "pendiente",
    }).select("id").maybeSingle();

    if (error || !data) {
      console.error("support ticket create failed", { userId: user.id, playerId: player.id, error: error?.message });
      return redirectWithError("ticket_failed");
    }

    if (attachment) await saveAttachmentMetadata(admin, attachment, { playerId: player.id, ticketId: data.id });

    return relativeRedirect("/cuenta?support=ticket_created#soporte");
  }

  if (type === "report") {
    const reportedUsername = cleanText(formData.get("reported_username"), 24);
    const reason = cleanText(formData.get("reason"), 1200);
    const priority = cleanText(formData.get("priority"), 20).toLowerCase() || "media";

    if (!reportedUsername || reason.length < 20 || !priorities.has(priority)) {
      return redirectWithError("invalid_report");
    }

    const { data: reportedPlayer } = await admin
      .from("players")
      .select("id,username")
      .ilike("username", reportedUsername)
      .maybeSingle();

    if (!reportedPlayer || reportedPlayer.id === player.id) return redirectWithError("reported_player");

    const { attachment, error: attachmentError } = await uploadAttachment(admin, file, player.id, "reports");
    if (attachmentError) return redirectWithError(attachmentError);

    const { data, error } = await admin.from("reports").insert({
      reporter_player_id: player.id,
      reported_player_id: reportedPlayer.id,
      reason: appendAttachmentReference(reason, attachment),
      priority,
      status: "pendiente",
    }).select("id").maybeSingle();

    if (error || !data) {
      console.error("support report create failed", { userId: user.id, playerId: player.id, error: error?.message });
      return redirectWithError("report_failed");
    }

    if (attachment) await saveAttachmentMetadata(admin, attachment, { playerId: player.id, reportId: data.id });

    return relativeRedirect("/cuenta?support=report_created#soporte");
  }

  return redirectWithError("invalid_type");
}
