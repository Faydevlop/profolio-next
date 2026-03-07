export type CreateActionState = {
  ok: boolean;
  status: string;
  details: string[];
  timestamp: number;
};

export const INITIAL_CREATE_ACTION_STATE: CreateActionState = {
  ok: false,
  status: "",
  details: [],
  timestamp: 0,
};
