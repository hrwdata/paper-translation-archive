import { createContext, createElement, useContext, useMemo, useState } from "react";

type SelectionContextValue = {
  selectedAlignmentId: string | null;
  hoveredAlignmentId: string | null;
  setSelectedAlignmentId: (alignmentId: string | null) => void;
  setHoveredAlignmentId: (alignmentId: string | null) => void;
  activeAlignmentId: string | null;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedAlignmentId, setSelectedAlignmentId] = useState<string | null>(null);
  const [hoveredAlignmentId, setHoveredAlignmentId] = useState<string | null>(null);

  const value = useMemo<SelectionContextValue>(
    () => ({
      selectedAlignmentId,
      hoveredAlignmentId,
      setSelectedAlignmentId,
      setHoveredAlignmentId,
      activeAlignmentId: hoveredAlignmentId ?? selectedAlignmentId
    }),
    [hoveredAlignmentId, selectedAlignmentId]
  );

  return createElement(SelectionContext.Provider, { value }, children);
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }
  return context;
}
