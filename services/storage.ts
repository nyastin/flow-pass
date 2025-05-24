"use server";

import { uploadPaymentProof } from "@/lib/supabase-storage";
import prisma from "@/lib/prisma";

// This is a server-side function to handle file uploads
export async function uploadFile(
  formData: FormData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    const registrationId = formData.get("registrationId") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!registrationId) {
      return { success: false, error: "Registration ID is required" };
    }

    // Get reference number from the registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { referenceNumber: true },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    // Upload file to Supabase
    const publicUrl = await uploadPaymentProof(
      file,
      registration.referenceNumber,
    );

    // Create or update payment proof record in the database
    await prisma.paymentProof.upsert({
      where: { registrationId },
      create: {
        registrationId,
        imageUrl: publicUrl,
      },
      update: {
        imageUrl: publicUrl,
        uploadedAt: new Date(),
      },
    });

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: (error as Error).message };
  }
}
