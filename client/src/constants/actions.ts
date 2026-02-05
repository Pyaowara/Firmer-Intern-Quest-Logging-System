export const ACTION_ORDER = [
  "labOrder",
  "labResult",
  "receive",
  "accept",
  "approve",
  "reapprove",
  "unapprove",
  "unreceive",
  "rerun",
  "save",
  "listTransactions",
  "getTransaction",
  "analyzerResult",
  "analyzerRequest",
] as const;

export type Action = (typeof ACTION_ORDER)[number];
