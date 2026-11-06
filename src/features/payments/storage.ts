import { requireSupabase } from "../../integrations/supabase/client";
const allowed = ["application/pdf", "image/png", "image/jpeg"];
export async function receiptUrl(path: string): Promise<string> {
  const { data, error } = await requireSupabase()
    .storage.from("receipts")
    .createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadReceipt(payment: number, file: File) {
  if (!allowed.includes(file.type) || file.size > 10485760)
    throw new Error("Usá PDF, PNG o JPEG de hasta 10 MB.");
  const path = `${payment}/${crypto.randomUUID()}.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg"}`;
  const db = requireSupabase();
  const upload = await db.storage
    .from("receipts")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) throw upload.error;
  const { error } = await db
    .from("receipts")
    .insert({ payment_id: payment, object_path: path, mime_type: file.type });
  if (error)
    throw new Error(
      "El archivo se cargó, pero no pudo asociarse. Revisá el objeto huérfano desde administración antes de reintentar.",
    );
}
