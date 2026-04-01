import { queryKeys } from "@/query/keys";
import {
  listAdminMembershipsFn,
  searchMembershipAdminUsersFn,
  type MembershipAdminListFilterInput,
} from "@/server/api/membership.functions";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

export const membershipAdminListQuery = (
  filters: MembershipAdminListFilterInput = {},
) =>
  queryOptions({
    queryKey: queryKeys.membership.adminList(filters),
    queryFn: () => listAdminMembershipsFn({ data: filters }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const membershipAdminUsersQuery = (search: string) =>
  queryOptions({
    queryKey: queryKeys.membership.adminUsers(search),
    queryFn: () => searchMembershipAdminUsersFn({ data: { search, limit: 20 } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
