// /src/context/OnSaveContext.tsx
import { createContext, useContext } from "react";

export const OnSaveContext = createContext<
  | {
      onSaveData: unknown;
      setOnSaveData: React.Dispatch<React.SetStateAction<unknown>>;
    }
  | undefined
>(undefined);

export const useOnSave = () => {
  const context = useContext(OnSaveContext);
  if (!context) throw new Error("useOnSave must be used within OnSaveProvider");
  return context;
};
