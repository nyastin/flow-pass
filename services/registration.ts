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

export async function createRegistration(formData: RegistrationFormData) {
  try {
    // Validate the form data
    const validatedData = formSchema.parse(formData);

    // Get or create ticket types
    const ticketTypes = await Promise.all(
      ["VIP", "Regular"].map(async (name) => {
        const price = name === "VIP" ? 800 : 500;
        return prisma.ticketType.upsert({
          where: { name },
          update: { price },
          create: { name, price },
        });
      }),
    );

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        specialRequirements: validatedData.specialRequirements || null,
        referenceNumber: validatedData.referenceNumber,
        totalPrice: validatedData.totalPrice,
      },
    });

    // Process each ticket group sequentially to avoid race conditions
    for (const ticketItem of validatedData.tickets) {
      const ticketType = ticketTypes.find((t) => t.name === ticketItem.type);
      if (!ticketType)
        throw new Error(`Ticket type ${ticketItem.type} not found`);

      const quantity = Number.parseInt(ticketItem.quantity);

      // Create each individual ticket with a unique QR code
      for (let i = 0; i < quantity; i++) {
        // Generate a unique QR code with collision prevention
        const qrCode = await generateUniqueQRCode(
          registration.id,
          ticketType.id,
          i,
          ticketItem.dancer,
        );

        await prisma.ticket.create({
          data: {
            registrationId: registration.id,
            ticketTypeId: ticketType.id,
            dancer: ticketItem.dancer,
            qrCode,
          },
        });
      }
    }

    // Fetch the complete registration with tickets
    const completeRegistration = await prisma.registration.findUnique({
      where: { id: registration.id },
      include: {
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: completeRegistration };
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
