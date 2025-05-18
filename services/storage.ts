"use server"

import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// This is a server-side function to handle file uploads
export async function uploadFile(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Generate a unique filename
    const referenceNumber = (formData.get("referenceNumber") as string) || "unknown"
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${referenceNumber}-${Date.now()}-${uuidv4().substring(0, 8)}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Define the upload directory and path
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, fileName)

    // Ensure the directory exists
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${fileName}`

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: (error as Error).message }
  }
}
