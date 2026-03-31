import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { requireAuthenticatedUser } from "@/lib/route-guards";
import {
  INDONESIA_PROVINCES,
  INDONESIA_PROVINCE_OPTIONS,
  type IndonesiaProvince,
} from "@/lib/indonesia-provinces";
import { queryKeys } from "@/query/keys";
import {
  createMembershipApplicationFn,
  getMembershipJoinGuideFn,
  getMyMembershipFn,
  resubmitRejectedMembershipFn,
  uploadMembershipProofFn,
} from "@/server/api/membership.functions";
import type { MembershipApplicantInput } from "@/server/api/membership.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/membership/manage")({
  beforeLoad: async ({ location }) => {
    await requireAuthenticatedUser(location);
  },
  component: MembershipManagePage,
  pendingComponent: MembershipManagePending,
});

type InstitutionType = MembershipApplicantInput["institutionType"];
type ApplicantFormState = Omit<
  MembershipApplicantInput,
  "province" | "institutionType"
> & {
  province: MembershipApplicantInput["province"] | "";
  institutionType: InstitutionType | "";
};

type ProvinceOption = {
  value: IndonesiaProvince;
  label: string;
};
type ApplicantFormErrors = Partial<Record<keyof ApplicantFormState, string>>;

const INSTITUTION_TYPE_OPTIONS: ReadonlyArray<{
  value: InstitutionType;
  label: string;
}> = [
  { value: "individu", label: "Individu" },
  { value: "institusi", label: "Institusi" },
];

const emptyApplicantForm = (): ApplicantFormState => ({
  profession: "",
  phone: "",
  address: "",
  province: "",
  institutionName: "",
  institutionType: "",
  contactPerson: "",
});

function isProvince(value: string): value is IndonesiaProvince {
  return (INDONESIA_PROVINCES as readonly string[]).includes(value);
}

function isInstitutionType(value: string): value is InstitutionType {
  return value === "individu" || value === "institusi";
}

function MembershipManagePage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const emailVerified = Boolean(user?.emailVerified);
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [payerNote, setPayerNote] = React.useState("");
  const [isResending, setIsResending] = React.useState(false);
  const [applicantForm, setApplicantForm] =
    React.useState<ApplicantFormState>(emptyApplicantForm);
  const [formErrors, setFormErrors] = React.useState<ApplicantFormErrors>({});

  const guideQuery = useQuery({
    queryKey: queryKeys.membership.guide(),
    queryFn: getMembershipJoinGuideFn,
    enabled: true,
  });

  const membershipQuery = useQuery({
    queryKey: queryKeys.membership.me(),
    queryFn: getMyMembershipFn,
    enabled: true,
  });

  const currentMembership = membershipQuery.data?.membership;
  const needsConsent =
    !currentMembership ||
    currentMembership.status === "needs_correction" ||
    currentMembership.status === "cancelled";

  React.useEffect(() => {
    if (
      !currentMembership ||
      (currentMembership.status !== "needs_correction" &&
        currentMembership.status !== "cancelled")
    ) {
      return;
    }
    setApplicantForm({
      profession: currentMembership.profession ?? "",
      phone: currentMembership.phone ?? "",
      address: currentMembership.address ?? "",
      province:
        currentMembership.province && isProvince(currentMembership.province)
          ? currentMembership.province
          : "",
      institutionName: currentMembership.institutionName ?? "",
      institutionType:
        currentMembership.institutionType &&
        isInstitutionType(currentMembership.institutionType)
          ? currentMembership.institutionType
          : "",
      contactPerson: currentMembership.contactPerson ?? "",
    });
  }, [currentMembership]);

  const consentMutation = useMutation({
    mutationFn: (data: MembershipApplicantInput) =>
      createMembershipApplicationFn({ data }),
    onSuccess: async (res) => {
      if (res.reused) {
        toast.info(
          "Your membership request already exists. Continue with payment.",
        );
      } else {
        toast.success("Membership request saved. Continue with payment.");
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.membership.all,
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit membership request",
      ),
  });

  const resubmitMutation = useMutation({
    mutationFn: (data: MembershipApplicantInput) =>
      resubmitRejectedMembershipFn({ data }),
    onSuccess: async (res) => {
      toast.success(
        res.status === "pending_review"
          ? "Your correction is submitted for re-review."
          : "Your correction is saved. Continue with payment.",
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.membership.all,
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit corrected membership request",
      ),
  });

  const proofMutation = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error("Please select a transfer proof file.");
      const membershipId = membershipQuery.data?.membership?.id;
      if (!membershipId) {
        throw new Error(
          "Membership request not found. Submit the agreement first.",
        );
      }
      const fd = new FormData();
      fd.set("membershipId", membershipId);
      fd.set("file", proofFile);
      if (payerNote.trim()) fd.set("payerNote", payerNote.trim());
      return uploadMembershipProofFn({ data: fd });
    },
    onSuccess: async () => {
      toast.success(
        "Transfer proof submitted. Waiting for admin verification.",
      );
      setProofFile(null);
      setPayerNote("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.membership.all,
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to submit transfer proof",
      ),
  });

  const statusLabel = React.useMemo(() => {
    switch (currentMembership?.status) {
      case "pending_payment":
        return "Waiting for payment";
      case "pending_review":
        return "Waiting for admin verification";
      case "active":
        return "Membership active";
      case "rejected":
        return "Final rejection";
      case "needs_correction":
        return "Needs correction before re-review";
      case "cancelled":
        return "Membership revoked/cancelled";
      default:
        return "Not started";
    }
  }, [currentMembership?.status]);

  const activeStage = React.useMemo<
    | "agreement"
    | "waiting_payment"
    | "waiting_verification"
    | "active"
    | "needs_correction"
    | "rejected_final"
  >(() => {
    const s = currentMembership?.status;
    if (!currentMembership) return "agreement";
    if (s === "needs_correction" || s === "cancelled") return "needs_correction";
    if (s === "rejected") return "rejected_final";
    if (s === "pending_payment") return "waiting_payment";
    if (s === "pending_review") return "waiting_verification";
    if (s === "active") return "active";
    return "agreement";
  }, [currentMembership]);

  const showTransferSection =
    Boolean(currentMembership) &&
    (currentMembership?.status === "pending_payment" ||
      currentMembership?.status === "pending_review");

  const showUploadSection = currentMembership?.status === "pending_payment";

  const selectedProvince = React.useMemo<ProvinceOption | null>(() => {
    if (!applicantForm.province) return null;
    return (
      INDONESIA_PROVINCE_OPTIONS.find(
        (option) => option.value === applicantForm.province,
      ) ?? null
    );
  }, [applicantForm.province]);

  const submitApplicantConsent = React.useCallback(() => {
    const nextErrors: ApplicantFormErrors = {};
    if (!applicantForm.profession.trim()) nextErrors.profession = "Profession is required.";
    if (!applicantForm.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!applicantForm.address.trim()) nextErrors.address = "Address is required.";
    if (!applicantForm.province) nextErrors.province = "Please select a province.";
    if (!applicantForm.institutionName.trim()) {
      nextErrors.institutionName = "Institution name is required.";
    }
    if (!applicantForm.institutionType) {
      nextErrors.institutionType = "Please select institution type.";
    }
    if (!applicantForm.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required.";
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete the required fields.");
      return;
    }

    const province = applicantForm.province as MembershipApplicantInput["province"];
    const institutionType =
      applicantForm.institutionType as MembershipApplicantInput["institutionType"];
    const payload: MembershipApplicantInput = {
      ...applicantForm,
      province,
      institutionType,
    };

    if (currentMembership?.status === "needs_correction") {
      void resubmitMutation.mutateAsync(payload);
      return;
    }
    void consentMutation.mutateAsync(payload);
  }, [applicantForm, consentMutation, currentMembership?.status, resubmitMutation]);

  return (
    <main className="page-wrap mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Join Membership</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Follow these steps: complete applicant details and consent, transfer to
        the official account, submit proof, then wait for admin verification.
      </p>

      <div className="mt-6 space-y-6">
        {!emailVerified ? (
          <Alert>
              <AlertTitle>Email verification required</AlertTitle>
              <AlertDescription>
                Verify your email address before submitting membership
                enrollment.
              </AlertDescription>
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isResending}
                  onClick={async () => {
                    const home =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/`
                        : "/";
                    setIsResending(true);
                    try {
                      const email = user?.email;
                      if (!email)
                        throw new Error("Email not found in session.");
                      const res = await authClient.sendVerificationEmail({
                        email,
                        callbackURL: home,
                      });
                      if (res.error) {
                        throw new Error(
                          res.error.message ??
                            "Could not send verification email.",
                        );
                      }
                      toast.success(
                        "Verification email sent. Check your inbox.",
                      );
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to resend verification email.",
                      );
                    } finally {
                      setIsResending(false);
                    }
                  }}
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </Button>
              </div>
          </Alert>
        ) : null}
        <Card>
            <CardHeader>
              <CardTitle>Membership stages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge
                variant={
                  activeStage === "agreement" ||
                  activeStage === "needs_correction"
                    ? "default"
                    : "outline"
                }
              >
                1. Applicant data & consent
              </Badge>
              <Badge
                variant={
                  activeStage === "waiting_payment" ? "default" : "outline"
                }
              >
                2. Waiting for payment
              </Badge>
              <Badge
                variant={
                  activeStage === "waiting_verification" ? "default" : "outline"
                }
              >
                3. Waiting for admin verification
              </Badge>
              <Badge variant={activeStage === "active" ? "default" : "outline"}>
                4. Membership active
              </Badge>
              <Badge
                variant={
                  activeStage === "needs_correction" ? "destructive" : "outline"
                }
              >
                Needs correction
              </Badge>
              <Badge
                variant={activeStage === "rejected_final" ? "destructive" : "outline"}
              >
                Final rejected
              </Badge>
            </CardContent>
        </Card>

        {needsConsent ? (
          <Card>
              <CardHeader>
                <CardTitle>1) Applicant data & consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {currentMembership?.status === "needs_correction" ? (
                  <Alert variant="destructive">
                    <AlertTitle>Correction requested by admin</AlertTitle>
                    <AlertDescription>
                      {currentMembership.rejectionReason?.trim()
                        ? currentMembership.rejectionReason
                        : "Please correct your details/proof and submit again."}
                    </AlertDescription>
                  </Alert>
                ) : null}
                {currentMembership?.status === "cancelled" ? (
                  <Alert>
                    <AlertTitle>Your previous membership was revoked</AlertTitle>
                    <AlertDescription>
                      Submit a new request to continue your membership process.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <p className="text-muted-foreground">
                  Complete the following fields and submit consent. Once
                  submitted, your request will be saved with status Waiting for
                  {currentMembership?.status === "needs_correction"
                    ? " admin review."
                    : " payment."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={applicantForm.profession}
                      onChange={(e) =>
                        setApplicantForm((p) => ({
                          ...p,
                          profession: e.target.value,
                        }))
                      }
                    />
                    {formErrors.profession ? (
                      <p className="text-xs text-destructive">{formErrors.profession}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone / WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={applicantForm.phone}
                      onChange={(e) =>
                        setApplicantForm((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                    />
                    {formErrors.phone ? (
                      <p className="text-xs text-destructive">{formErrors.phone}</p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={applicantForm.address}
                    onChange={(e) =>
                      setApplicantForm((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                  />
                  {formErrors.address ? (
                    <p className="text-xs text-destructive">{formErrors.address}</p>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="province">Province</Label>
                    <Combobox<ProvinceOption>
                      items={INDONESIA_PROVINCE_OPTIONS}
                      value={selectedProvince}
                      onValueChange={(value) => {
                        if (!value) return;
                        if (
                          typeof value === "object" &&
                          value !== null &&
                          "value" in value
                        ) {
                          setApplicantForm((p) => ({
                            ...p,
                            province: value.value,
                          }));
                        }
                      }}
                      isItemEqualToValue={(a, b) => a.value === b.value}
                      filter={undefined}
                      autoHighlight
                    >
                      <ComboboxInput
                        id="province"
                        className="h-10 w-full"
                        placeholder="Select province"
                        showClear={false}
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {(item: ProvinceOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                        <ComboboxEmpty>No province found.</ComboboxEmpty>
                      </ComboboxContent>
                    </Combobox>
                    {formErrors.province ? (
                      <p className="text-xs text-destructive">{formErrors.province}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="institutionName">Institution name</Label>
                    <Input
                      id="institutionName"
                      value={applicantForm.institutionName}
                      onChange={(e) =>
                        setApplicantForm((p) => ({
                          ...p,
                          institutionName: e.target.value,
                        }))
                      }
                    />
                    {formErrors.institutionName ? (
                      <p className="text-xs text-destructive">
                        {formErrors.institutionName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="institutionType">Institution type</Label>
                    <Select
                      value={applicantForm.institutionType}
                      onValueChange={(value) =>
                        setApplicantForm((p) => ({
                          ...p,
                          institutionType: isInstitutionType(value)
                            ? value
                            : "",
                        }))
                      }
                    >
                      <SelectTrigger id="institutionType" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTION_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.institutionType ? (
                      <p className="text-xs text-destructive">
                        {formErrors.institutionType}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact person</Label>
                    <Input
                      id="contactPerson"
                      value={applicantForm.contactPerson}
                      onChange={(e) =>
                        setApplicantForm((p) => ({
                          ...p,
                          contactPerson: e.target.value,
                        }))
                      }
                    />
                    {formErrors.contactPerson ? (
                      <p className="text-xs text-destructive">
                        {formErrors.contactPerson}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="button"
                  disabled={
                    consentMutation.isPending ||
                    resubmitMutation.isPending ||
                    !emailVerified
                  }
                  onClick={submitApplicantConsent}
                >
                  {consentMutation.isPending || resubmitMutation.isPending
                    ? "Submitting..."
                    : currentMembership?.status === "needs_correction"
                      ? "Submit correction for re-review"
                      : "I agree and submit request"}
                </Button>
              </CardContent>
          </Card>
        ) : null}

        {showTransferSection ? (
          <>
              <Card>
                <CardHeader>
                  <CardTitle>2) Transfer instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bank</span>:{" "}
                      {guideQuery.data?.guide.bankName ?? "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Account name
                      </span>
                      : {guideQuery.data?.guide.accountName ?? "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Account number
                      </span>
                      : {guideQuery.data?.guide.accountNumber ?? "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount</span>:{" "}
                      {guideQuery.data
                        ? `${guideQuery.data.guide.currency} ${guideQuery.data.guide.amount.toLocaleString("id-ID")}`
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">How to transfer</p>
                    <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                      {guideQuery.data?.guide.transferMethods.map((method) => (
                        <li key={method}>{method}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {showUploadSection ? (
                <Card>
                  <CardHeader>
                    <CardTitle>3) Submit payment confirmation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">
                        Your transfer proof should include:
                      </p>
                      <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                        {guideQuery.data?.guide.uploadChecklist.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="proof">Proof file (image / PDF)</Label>
                      <Input
                        id="proof"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payerNote">
                        Transfer note (optional)
                      </Label>
                      <Input
                        id="payerNote"
                        value={payerNote}
                        onChange={(e) => setPayerNote(e.target.value)}
                        placeholder="e.g. transfer reference"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => void proofMutation.mutateAsync()}
                      disabled={
                        !proofFile || proofMutation.isPending || !emailVerified
                      }
                    >
                      {proofMutation.isPending
                        ? "Submitting..."
                        : "I have transferred, submit confirmation"}
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
          </>
        ) : null}

        <Card>
            <CardHeader>
              <CardTitle>Process status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {membershipQuery.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : !currentMembership ? (
                <>
                  <div>
                    <span className="text-muted-foreground">
                      Current status
                    </span>
                    : No request yet
                  </div>
                  <p className="text-muted-foreground">
                    Complete the applicant form and consent section above to
                    start.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-muted-foreground">
                      Current status
                    </span>
                    : {statusLabel}
                  </div>
                  <div className="text-muted-foreground">
                    {currentMembership.status === "active"
                      ? "Your membership is active. Your digital member card is available in the profile membership tab."
                      : currentMembership.status === "pending_review"
                        ? "Admin is reviewing your transfer proof."
                        : currentMembership.status === "pending_payment"
                          ? "Transfer the exact amount, then upload your proof in the confirmation step."
                          : currentMembership.status === "rejected"
                            ? "Your request was rejected with a final decision. Contact admin for follow-up."
                            : currentMembership.status === "needs_correction"
                              ? "Update your data based on reviewer note, then submit correction for re-review."
                            : currentMembership.status === "cancelled"
                              ? "Your previous membership has been revoked. Submit a new request from the applicant data and consent form."
                            : "—"}
                  </div>
                </>
              )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MembershipManagePending() {
  return (
    <main className="page-wrap mx-auto w-full max-w-4xl px-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    </main>
  );
}
