export const queryKeys = {
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },
  membership: {
    all: ["membership"] as const,
    me: () => [...queryKeys.membership.all, "me"] as const,
    guide: () => [...queryKeys.membership.all, "guide"] as const,
    reviews: () => [...queryKeys.membership.all, "reviews"] as const,
    adminList: (filters: unknown) =>
      [...queryKeys.membership.all, "admin-list", filters] as const,
    adminUsers: (search: string) =>
      [...queryKeys.membership.all, "admin-users", search] as const,
    verify: (token: string) =>
      [...queryKeys.membership.all, "verify", token] as const,
  },
} as const;
