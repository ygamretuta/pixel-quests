export type Reward = {
  id: string;
  title: string;
  cost: number;
  icon: string;
  active: boolean;
};

export type RewardRequest = {
  id: number;
  rewardId: string;
  title: string;
  cost: number;
  status: "pending" | "approved" | "denied" | "cancelled";
  createdAt: string;
};

/** The reward she is saving coins for. */
export type Goal = { rewardId: string; title: string; cost: number; icon: string };
