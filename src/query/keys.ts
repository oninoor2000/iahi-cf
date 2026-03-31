export const queryKeys = {
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
    headerImage: () => [...queryKeys.profile.me(), "header-image"] as const,
  },
  membership: {
    all: ["membership"] as const,
    me: () => [...queryKeys.membership.all, "me"] as const,
    guide: () => [...queryKeys.membership.all, "guide"] as const,
    reviews: () => [...queryKeys.membership.all, "reviews"] as const,
    verify: (token: string) =>
      [...queryKeys.membership.all, "verify", token] as const,
  },
} as const;
