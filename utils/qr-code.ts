import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

/**
 * Generates a unique QR code for a ticket with collision prevention
 * @param registrationId - The ID of the registration
 * @param ticketTypeId - The ID of the ticket type
 * @param ticketIndex - The index of the ticket within its group
 * @param dancer - The dancer associated with the ticket
 * @returns A unique QR code string
 */
export async function generateUniqueQRCode(
  registrationId: string,
  ticketTypeId: string,
  ticketIndex: number,
  dancer: string,
): Promise<string> {
  // Maximum retry attempts
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    // Generate a UUID v4 for guaranteed uniqueness
    const uuid = uuidv4();

    // Create a unique string with multiple entropy sources
    const uniqueString = [
      registrationId,
      ticketTypeId,
      dancer,
      ticketIndex.toString(),
      Date.now().toString(),
      uuid,
      Math.random().toString(36).substring(2, 15),
    ].join("-");

    // Generate a SHA-256 hash and take the first 24 characters
    // This gives us 96 bits of entropy which is sufficient to prevent collisions
    const qrCode = crypto
      .createHash("sha256")
      .update(uniqueString)
      .digest("hex")
      .substring(0, 24);

    // Check if this QR code already exists in the database
    const existingTicket = await prisma.ticket.findUnique({
      where: { qrCode },
    });

    // If no collision, return the QR code
    if (!existingTicket) {
      return qrCode;
    }

    // If collision detected, increment retry counter and try again
    retries++;
    console.warn(
      `QR code collision detected, retrying (${retries}/${MAX_RETRIES})...`,
    );
  }

  // If we've exhausted all retries, throw an error
  throw new Error(
    "Failed to generate a unique QR code after multiple attempts",
  );
}

/**
 * Validates a QR code and returns the associated ticket
 * @param qrCode - The QR code to validate
 * @returns The ticket associated with the QR code, or null if not found
 */
export async function validateQRCode(qrCode: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        registration: true,
        ticketType: true,
      },
    });

    return ticket;
  } catch (error) {
    console.error("Error validating QR code:", error);
    return null;
  }
}
