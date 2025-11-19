// "use client";
// import React, { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";
// import { UserDetailContext } from "@/context/UserDetailContext";
// import { OnSaveContext } from "@/context/OnSaveContext";
// import type { UserDetail } from "@/context/UserDetailContext";

// function Provider({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const { user, isSignedIn } = useUser();
//   // Local override state that consumers can set via setUserDetail.
//   // We derive the effective userDetail from the query unless overridden.
//   const [overrideUserDetail, setOverrideUserDetail] = useState<
//     UserDetail | undefined
//   >();
//   const [onSaveData, setOnSaveData] = useState<unknown>(null);
//   const currentUserDetail = useQuery(api.users.get);

//   // Derive the effective user detail from Convex query or an explicit override.
//   const userDetail =
//     overrideUserDetail ?? (currentUserDetail as UserDetail | undefined);

//   // Reset override when user signs out (defer to avoid synchronous setState)
//   useEffect(() => {
//     if (!isSignedIn && overrideUserDetail !== undefined) {
//       const id = setTimeout(() => setOverrideUserDetail(undefined), 0);
//       return () => clearTimeout(id);
//     }
//   }, [isSignedIn, overrideUserDetail]);

//   return (
//     <UserDetailContext.Provider
//       value={{ userDetail, setUserDetail: setOverrideUserDetail }}
//     >
//       <OnSaveContext.Provider value={{ onSaveData, setOnSaveData }}>
//         {children}
//       </OnSaveContext.Provider>
//     </UserDetailContext.Provider>
//   );
// }

// export default Provider;

"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserDetailContext } from "@/context/UserDetailContext";
import { OnSaveContext } from "@/context/OnSaveContext";
import type { UserDetail } from "@/context/UserDetailContext";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isSignedIn } = useUser();
  const [overrideUserDetail, setOverrideUserDetail] = useState<
    UserDetail | undefined
  >();
  const [onSaveData, setOnSaveData] = useState<unknown>(null);
  const currentUserDetail = useQuery(api.users.get);
  const syncProfile = useMutation(api.users.syncProfile);

  // Sync user profile data from Clerk to Convex
  useEffect(() => {
    if (!user || !currentUserDetail) return;

    const needsSync =
      (user.imageUrl && user.imageUrl !== currentUserDetail.imageUrl) ||
      (user.fullName && user.fullName !== currentUserDetail.name);

    if (needsSync) {
      syncProfile({
        name: user.fullName || undefined,
        imageUrl: user.imageUrl || undefined,
      }).catch(console.error);
    }
  }, [user, currentUserDetail, syncProfile]);

  const userDetail =
    overrideUserDetail ?? (currentUserDetail as UserDetail | undefined);

  useEffect(() => {
    if (!isSignedIn && overrideUserDetail !== undefined) {
      const id = setTimeout(() => setOverrideUserDetail(undefined), 0);
      return () => clearTimeout(id);
    }
  }, [isSignedIn, overrideUserDetail]);

  return (
    <UserDetailContext.Provider
      value={{ userDetail, setUserDetail: setOverrideUserDetail }}
    >
      <OnSaveContext.Provider value={{ onSaveData, setOnSaveData }}>
        {children}
      </OnSaveContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;
