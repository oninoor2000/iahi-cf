import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { SocialAuthButtonsFallback } from "@/components/auth/social-auth-buttons-fallback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { signInFormSchema } from "@/schemas/auth-forms";

export function SignInForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(
    null,
  );
  const [isResending, setIsResending] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const home =
          typeof window !== "undefined" ? window.location.origin + "/" : "/";
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
          callbackURL: home,
        });
        if (result.error) {
          const err = result.error;
          if (err.status === 403) {
            setUnverifiedEmail(value.email);
            toast.error(
              err.message ??
                "Please verify your email before signing in. Check your inbox or resend the link below.",
            );
            return;
          }
          setUnverifiedEmail(null);
          toast.error(err.message ?? "Sign-in failed.");
          return;
        }
        setUnverifiedEmail(null);
        toast.success("Signed in successfully.");
        await navigate({ to: "/" });
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use your registered email and password. Don&apos;t have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SocialAuthButtonsFallback />
        <div
          className="relative flex min-h-9 w-full items-center justify-center py-8"
          role="presentation"
        >
          <div
            className="absolute top-1/2 right-0 left-0 z-0 h-px -translate-y-1/2 bg-border"
            aria-hidden
          />
          <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>
        <form
          id="sign-in-form"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="you@example.com"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />
            <form.Field
              name="rememberMe"
              children={(field) => (
                <Field orientation="horizontal" className="items-center gap-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(v) => field.handleChange(v === true)}
                    onBlur={field.handleBlur}
                  />
                  <FieldLabel
                    htmlFor={field.name}
                    className="cursor-pointer font-normal"
                  >
                    Remember me on this device
                  </FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <FieldDescription className="pt-2">
          By signing in, you agree to the applicable terms of service.
        </FieldDescription>
        {unverifiedEmail ? (
          <div className="border-border mt-4 rounded-none border border-dashed p-3 text-center">
            <p className="mb-2 text-xs text-muted-foreground">
              Didn&apos;t get the email? We can send another verification link.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isResending}
              onClick={async () => {
                const home =
                  typeof window !== "undefined"
                    ? window.location.origin + "/"
                    : "/";
                setIsResending(true);
                try {
                  const res = await authClient.sendVerificationEmail({
                    email: unverifiedEmail,
                    callbackURL: home,
                  });
                  if (res.error) {
                    toast.error(
                      res.error.message ?? "Could not send verification email.",
                    );
                    return;
                  }
                  toast.success("Verification email sent. Check your inbox.");
                } finally {
                  setIsResending(false);
                }
              }}
            >
              {isResending ? "Sending…" : "Resend verification email"}
            </Button>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="sign-in-form"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
