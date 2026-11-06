import { z } from "zod";
import { requireSupabase } from "../../integrations/supabase/client";
import type { Property } from "../../properties";

const schema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  operation: z.enum(["Venta", "Alquiler"]),
  published: z.boolean(),
  property_photos: z.array(
    z.object({
      reference_url: z.string().nullable(),
      object_path: z.string().nullable(),
      position: z.number(),
    }),
  ),
});
export interface CatalogProperty extends Property {
  published: boolean;
}
export async function listProperties(): Promise<CatalogProperty[]> {
  const db = requireSupabase();
  const { data, error } = await db
    .from("properties")
    .select(
      "id,title,subtitle,description,operation,published,property_photos(reference_url,object_path,position)",
    )
    .order("created_at")
    .order("id");
  if (error) throw error;
  return Promise.all(
    schema
      .array()
      .parse(data)
      .map(async (row) => {
        const photo = [...row.property_photos].sort(
          (a, b) => a.position - b.position,
        )[0];
        let image = photo?.reference_url ?? "";
        if (photo?.object_path) {
          const signed = await db.storage
            .from("property-photos")
            .createSignedUrl(photo.object_path, 60);
          if (signed.error) throw signed.error;
          image = signed.data.signedUrl;
        }
        return { ...row, image };
      }),
  );
}
export async function setPublished(id: string, published: boolean) {
  const { data, error } = await requireSupabase()
    .from("properties")
    .update({ published })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (data.length !== 1)
    throw new Error("No tenés permiso para modificar esta propiedad.");
}
export async function updateProperty(id: string, description: string) {
  const { data, error } = await requireSupabase()
    .from("properties")
    .update({ subtitle: description })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (data.length !== 1) throw new Error("No se pudo actualizar la propiedad.");
}
export async function createProperty(input: {
  id: string;
  title: string;
  description: string;
  operation: "Venta" | "Alquiler";
}) {
  const value = z
    .object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().trim().min(1).max(150),
      description: z.string().trim().min(1),
      operation: z.enum(["Venta", "Alquiler"]),
    })
    .parse(input);
  const { error } = await requireSupabase()
    .from("properties")
    .insert({ ...value, subtitle: "", published: false });
  if (error) throw error;
}
export async function addPhoto(property: string, file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5242880
  )
    throw new Error("Usá JPEG, PNG o WebP de hasta 5 MB.");
  const path = `${property}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
  const db = requireSupabase();
  const upload = await db.storage
    .from("property-photos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upload.error) throw upload.error;
  const { error } = await db.from("property_photos").insert({
    property_id: property,
    object_path: path,
    alt: "Fotografía de propiedad cargada por administración",
  });
  if (error)
    throw new Error(
      "Archivo cargado sin metadatos asociados. Revisá el objeto huérfano antes de reintentar.",
    );
}
