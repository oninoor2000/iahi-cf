import * as z from "zod";

export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signUpFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(120, "Name must be at most 120 characters."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
