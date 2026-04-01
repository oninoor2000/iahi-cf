import { queryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import { getMyMembershipFn } from "@/server/api/membership.functions";
import { getMyProfileFn } from "@/server/api/profile.functions";

export const profileMeQueryOptions = queryOptions({
  queryKey: queryKeys.profile.me(),
  queryFn: getMyProfileFn,
});

export const membershipMeQueryOptions = queryOptions({
  queryKey: queryKeys.membership.me(),
  queryFn: getMyMembershipFn,
});
