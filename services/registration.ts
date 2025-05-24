"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Define the ticket item schema
const ticketItemSchema = z.object({
  type: z.enum(["VIP", "Regular"]),
  quantity: z.string().min(1),
  dancer: z.string().min(1, "Please select a dancer"),
});

// Define the form schema
const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  tickets: z.array(ticketItemSchema).min(1, "Please add at least one ticket"),
  specialRequirements: z.string().optional(),
  totalPrice: z.number().min(0),
  referenceNumber: z.string(),
});

export type RegistrationFormData = z.infer<typeof formSchema>;

/**
 * Generates a unique QR code for a ticket with collision prevention
 * @param registrationId - The ID of the registration
 * @param ticketTypeId - The ID of the ticket type
 * @param ticketIndex - The index of the ticket within its group
 * @param dancer - The dancer associated with the ticket
 * @returns A unique QR code string
 */
async function generateUniqueQRCode(
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

export async function createRegistration(
  formData: RegistrationFormData,
): Promise<{
  success: boolean;
  data?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    specialRequirements: string | null;
    referenceNumber: string;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    tickets: Array<{
      id: number;
      registrationId: string;
      ticketTypeId: string;
      dancer: string;
      qrCode: string | null;
      isScanned: boolean;
      scannedAt: Date | null;
      createdAt: Date;
      ticketType: {
        id: string;
        name: string;
        price: number;
      };
    }>;
  };
  error?: string;
}> {
  try {
    // Validate the form data
    const validatedData = formSchema.parse(formData);

    // Use a transaction for atomicity
    return await prisma.$transaction(
      async (tx) => {
        // Get or create ticket types (within transaction)
        const ticketTypes = await Promise.all(
          ["VIP", "Regular"].map(async (name) => {
            const price = name === "VIP" ? 800 : 500;
            return tx.ticketType.upsert({
              where: { name },
              update: { price },
              create: { name, price },
            });
          }),
        );

        // Create the registration (within transaction)
        const registration = await tx.registration.create({
          data: {
            fullName: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            specialRequirements: validatedData.specialRequirements || null,
            referenceNumber: validatedData.referenceNumber,
            totalPrice: validatedData.totalPrice,
          },
        });

        // Prepare all tickets data for batch creation
        const ticketsToCreate: {
          registrationId: string;
          ticketTypeId: string;
          dancer: string;
          qrCode: string;
        }[] = [];

        for (const ticketItem of validatedData.tickets) {
          const ticketType = ticketTypes.find(
            (t) => t.name === ticketItem.type,
          );
          if (!ticketType)
            throw new Error(`Ticket type ${ticketItem.type} not found`);

          const quantity = Number.parseInt(ticketItem.quantity);

          // Generate all QR codes for this ticket group
          const qrCodes = await Promise.all(
            Array.from({ length: quantity }, (_, i) =>
              generateUniqueQRCode(
                registration.id,
                ticketType.id,
                i,
                ticketItem.dancer,
              ),
            ),
          );

          // Add all tickets for this group to the batch
          qrCodes.forEach((qrCode) => {
            ticketsToCreate.push({
              registrationId: registration.id,
              ticketTypeId: ticketType.id,
              dancer: ticketItem.dancer,
              qrCode,
            });
          });
        }

        // Create all tickets in a single batch operation
        await tx.ticket.createMany({
          data: ticketsToCreate,
        });

        // Fetch the complete registration with tickets (within transaction)
        const completeRegistration = await tx.registration.findUnique({
          where: { id: registration.id },
          include: {
            tickets: {
              include: {
                ticketType: true,
              },
            },
          },
        });

        if (!completeRegistration) {
          throw new Error("Failed to retrieve registration after creation");
        }

        revalidatePath("/");
        return { success: true, data: completeRegistration };
      },
      {
        // Set a reasonable timeout for the transaction
        timeout: 10000, // 10 seconds
      },
    );
  } catch (error) {
    console.error("Error creating registration:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getRegistrationByReferenceNumber(
  referenceNumber: string,
) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { referenceNumber },
      include: {
        tickets: {
          include: {
            ticketType: true,
          },
        },
        paymentProof: true,
      },
    });

    return { success: true, data: registration };
  } catch (error) {
    console.error("Error fetching registration:", error);
    return { success: false, error: (error as Error).message };
  }
}
