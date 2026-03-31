export const queryKeys = {
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
    headerImage: () => [...queryKeys.profile.me(), "header-image"] as const,
  },
  membership: {
    all: ["membership"] as const,
    me: () => [...queryKeys.membership.all, "me"] as const,
  },
} as const;

