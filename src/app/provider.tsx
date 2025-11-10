"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { UserDetailContext } from "@/context/UserDetailContext";
import { OnSaveContext } from "@/context/OnSaveContext";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const convexUser = useQuery(api.users.get);
  const createUser = useMutation(api.users.createOrGet);

  const [onSaveData, setOnSaveData] = useState<unknown>(null);

  // Effect to trigger user creation when needed
  useEffect(() => {
    if (user && convexUser === null) {
      // Call the mutation - Convex will reactively update convexUser
      createUser()
        .then((result) => {
          console.log("User created:", result);
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        });
    }
  }, [user, convexUser, createUser]);

  // Memoize the context value to prevent unnecessary re-renders
  const userDetailValue = useMemo(
    () => ({
      userDetail: convexUser ?? undefined,
      setUserDetail: () => {
        console.warn(
          "setUserDetail is not implemented - user data is managed by Convex"
        );
      },
    }),
    [convexUser]
  );

  return (
    <UserDetailContext.Provider value={userDetailValue}>
      <OnSaveContext.Provider value={{ onSaveData, setOnSaveData }}>
        {children}
      </OnSaveContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;
