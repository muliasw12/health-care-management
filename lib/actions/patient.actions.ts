"use server";

import { ID, Query } from "node-appwrite"
import { users } from "../appwrite.config"
import { parseStringify } from "../utils";

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