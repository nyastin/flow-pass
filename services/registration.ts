"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

    // Consolidate duplicate tickets
    const consolidatedTickets = validatedData.tickets.reduce<
      Array<{
        type: string;
        quantity: number;
        dancer: string;
      }>
    >((acc, ticket) => {
      const existingTicket = acc.find(
        (t) => t.type === ticket.type && t.dancer === ticket.dancer,
      );

      if (existingTicket) {
        existingTicket.quantity += Number.parseInt(ticket.quantity);
      } else {
        acc.push({
          type: ticket.type,
          quantity: Number.parseInt(ticket.quantity),
          dancer: ticket.dancer,
        });
      }

      return acc;
    }, []);

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        specialRequirements: validatedData.specialRequirements || null,
        referenceNumber: validatedData.referenceNumber,
        totalPrice: validatedData.totalPrice,
        tickets: {
          create: consolidatedTickets.map((ticket) => {
            const ticketType = ticketTypes.find((t) => t.name === ticket.type);
            if (!ticketType)
              throw new Error(`Ticket type ${ticket.type} not found`);

            return {
              ticketTypeId: ticketType.id,
              quantity: ticket.quantity,
              dancer: ticket.dancer,
            };
          }),
        },
      },
      include: {
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: registration };
  } catch (error) {
    console.error("Error creating registration:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function savePaymentProof(
  registrationId: string,
  imageUrl: string,
) {
  try {
    const paymentProof = await prisma.paymentProof.create({
      data: {
        registrationId,
        imageUrl,
      },
    });

    revalidatePath("/");
    revalidatePath("/4dkonly");
    return { success: true, data: paymentProof };
  } catch (error) {
    console.error("Error saving payment proof:", error);
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

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    return { success: true, data: registration };
  } catch (error) {
    console.error("Error fetching registration:", error);
    return { success: false, error: (error as Error).message };
  }
}
