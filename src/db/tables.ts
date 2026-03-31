import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./auth.schema";
import { agendaEvent, agendaEventRelations } from "./agenda.schema";
import {
  membership,
  membershipPayment,
  membershipPaymentRelations,
  membershipRelations,
  membershipTier,
  membershipTierRelations,
} from "./membership.schema";
import { publication, publicationRelations } from "./publications.schema";

/** Tables + relations only — safe for `drizzle(db, { schema })` (no enum const objects). */
export const schema = {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
  agendaEvent,
  agendaEventRelations,
  publication,
  publicationRelations,
  membershipTier,
  membershipTierRelations,
  membership,
  membershipRelations,
  membershipPayment,
  membershipPaymentRelations,
} as const;
