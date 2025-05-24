import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadPaymentProof(
  file: File,
  referenceNumber: string,
): Promise<string> {
  try {
    // Create a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${referenceNumber}-${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    // Upload the file
    const { error } = await supabase.storage
      .from("flow-pass")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("flow-pass").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw error;
  }
}
