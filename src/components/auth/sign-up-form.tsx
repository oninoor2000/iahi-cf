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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { signUpFormSchema } from "@/schemas/auth-forms";

export function SignUpForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const home =
          typeof window !== "undefined" ? window.location.origin + "/" : "/";
        const result = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
          callbackURL: home,
        });
        if (result.error) {
          toast.error(result.error.message ?? "Registration failed.");
          return;
        }
        const token = result.data?.token;
        if (!token) {
          toast.success(
            "Check your email for a verification link to finish setting up your account.",
          );
          await navigate({ to: "/sign-in" });
          return;
        }
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
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Create an account with your email. Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
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
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      autoComplete="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Your full name"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />
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
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>At least 8 characters.</FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm password
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="w-full gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="sign-up-form"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
