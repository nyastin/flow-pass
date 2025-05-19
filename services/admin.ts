"use server";

import prisma from "@/lib/prisma";
import { Prisma, Registration, RegistrationStatus } from "@prisma/client";

export type RegistrationWithRelations = Registration & {
  tickets: Array<{
    id: string;
    registrationId: string;
    ticketTypeId: string;
    quantity: number;
    dancer: string;
    ticketType: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  paymentProof: {
    id: string;
    registrationId: string;
    imageUrl: string;
    uploadedAt: Date;
  } | null;
};

export type GetAllRegistrationsResponse = {
  success: boolean;
  error?: string;
  data?: RegistrationWithRelations[];
  meta?: {
    page: number;
    total: number;
    limit: number;
  };
};

export type TicketFilter = {
  customerName?: string;
  ticketType?: string;
  status?: string;
  page: number;
  limit: number;
};

export async function getTicketTypes() {
  try {
    const ticketTypes = await prisma.ticketType.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: ticketTypes };
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllRegistrations({
  customerName,
  ticketType,
  status,
  page,
  limit,
}: TicketFilter): Promise<GetAllRegistrationsResponse> {
  try {
    // Build filter conditions
    const whereClause: Prisma.RegistrationWhereInput = {};

    if (customerName) {
      whereClause.fullName = {
        contains: customerName,
        mode: "insensitive",
      };
    }

    if (status) {
      const statusTerms = status.split(",");
      whereClause.OR = statusTerms.map((term) => ({
        status: term as RegistrationStatus,
      }));
    }

    // For ticket type filtering, we need to filter on the related tickets
    if (ticketType) {
      const ticketTerms = ticketType.split(",");

      if (ticketTerms.length === 1) {
        // Case 1 & 2: Only VIP or Only Regular
        whereClause.tickets = {
          every: {
            ticketType: {
              name: ticketTerms[0],
            },
          },
        };
      } else if (ticketTerms.length === 2) {
        // Case 3: Both VIP and Regular
        whereClause.AND = [
          {
            tickets: {
              some: {
                ticketType: {
                  name: ticketTerms[0],
                },
              },
            },
          },
          {
            tickets: {
              some: {
                ticketType: {
                  name: ticketTerms[1],
                },
              },
            },
          },
        ];
      }
    }

    const [registrations, count] = await Promise.all([
      prisma.registration.findMany({
        include: {
          tickets: {
            include: {
              ticketType: true,
            },
          },
          paymentProof: true,
        },
        skip: limit * ((page ?? 1) - 1),
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        where: whereClause,
      }),
      prisma.registration.count({
        where: whereClause,
      }),
    ]);

    const returnData = {
      success: true,
      data: registrations,
      meta: {
        page: page ?? 1,
        total: Math.ceil(count / limit),
        limit: limit,
      },
    };

    return returnData;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getRegistrationById(id: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
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

export async function updateRegistrationStatus(id: string, status: string) {
  try {
    const registration = await prisma.registration.update({
      where: { id },
      data: { status: status as RegistrationStatus },
    });

    return { success: true, data: registration };
  } catch (error) {
    console.error("Error updating registration status:", error);
    return { success: false, error: (error as Error).message };
  }
}
