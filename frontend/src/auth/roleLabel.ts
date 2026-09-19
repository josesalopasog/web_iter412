const ROLE_LABELS: Record<string, string> = {
  TREASURER: "TESORERO",
};

export const roleLabel = (role: string | undefined | null): string => (role ? (ROLE_LABELS[role] ?? role) : "");
