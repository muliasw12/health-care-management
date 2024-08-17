"use server";

import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, BUCKET_ID, DATABASE_ID, databases, ENDPOINT } from "../appwrite.config";
import { parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async (appointment: CreateAppointmentParams) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    )
    return parseStringify(newAppointment)
  } catch (error) {
    console.log(error)
  }
}

export const getAppointment = async (appointment_id: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointment_id
    )

    return parseStringify(appointment);
  } catch (error) {
    console.log(error)
  }
}

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents
    }

    return parseStringify(data);
  } catch (error) {
    console.log(error)
  }
}

export const updateAppointment = async ({ appointment_id, user_id, appointment, type }: UpdateAppointmentParams ) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointment_id, 
      appointment
    )

    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }

    revalidatePath(`/admin`);
    return parseStringify(updateAppointment);
  } catch (error) {
    console.log(error)
  }
}