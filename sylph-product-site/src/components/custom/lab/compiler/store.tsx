"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_POLICY, type PolicyState } from "./model";

/* One policy for the whole page: the editor on the first screen changes it, the Start scene can
   write a new draft into it. `approved` is the last set a person signed off; the editor diffs
   the draft against it, the way a reviewer would. */
type Store = {
  policy: PolicyState;
  approved: PolicyState;
  approvedBy: "dana" | "you";
  update: (fn: (p: PolicyState) => PolicyState) => void;
  approve: () => void;
  reset: () => void;
  load: (p: PolicyState) => void;
};

const Ctx = createContext<Store | null>(null);

export function PolicyProvider({ children }: { children: React.ReactNode }) {
  const [policy, setPolicy] = useState<PolicyState>(DEFAULT_POLICY);
  const [approved, setApproved] = useState<PolicyState>(DEFAULT_POLICY);
  const [approvedBy, setApprovedBy] = useState<"dana" | "you">("dana");

  const update = useCallback((fn: (p: PolicyState) => PolicyState) => setPolicy(fn), []);
  const approve = useCallback(() => {
    setApproved(policy);
    setApprovedBy("you");
  }, [policy]);
  const reset = useCallback(() => setPolicy(approved), [approved]);
  const load = useCallback((p: PolicyState) => setPolicy(p), []);

  const value = useMemo(
    () => ({ policy, approved, approvedBy, update, approve, reset, load }),
    [policy, approved, approvedBy, update, approve, reset, load],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePolicy(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("usePolicy outside PolicyProvider");
  return s;
}
