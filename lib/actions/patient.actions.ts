"use server";

import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config"
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file"

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(), user.email, user.phone, undefined, user.name
    )
    console.log('user baru', {newUser})
  } catch (error: any) {
    if (error && error?.code === 409) {
      const documents = await users.list([
        Query.equal('email', [user.email])
      ])

      return documents?.users[0]
    }
  }
}

export const getUser = async (user_id: string) => {
  try {
    const user = await users.get(user_id);

    return parseStringify(user);
  } catch (error) {
    console.log(error)
  }
}

export const registerPatient = async ({ identification_document, ...patient }: RegisterUserParams) => {
  try {
    let file;

    if (identification_document) {
      const inputFile = InputFile.fromBuffer(
        identification_document?.get('blobFile') as Blob,
        identification_document?.get('fileName') as string
      )

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identification_document_id: file?.$id || null,
        identification_document_url: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient
      }
    )

    return parseStringify(newPatient)
  } catch (error) {
    console.log(error)
  }
}

export const getPatient = async (user_id: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal('user_id', user_id)]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error)
  }
}