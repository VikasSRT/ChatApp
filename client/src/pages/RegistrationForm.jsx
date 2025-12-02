// components/auth/RegistrationForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const formSchema = z
  .object({
    username: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Must contain uppercase, lowercase, and numbers"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function RegistrationForm() {
  const { loading, error, fetchData } = useApi("/register", "POST");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    const responseData = await fetchData(values);

    if (responseData.status === 201) {
      navigate("/login");
    }
  }

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-neutral-200 shadow-xl overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-center">
            {/* Header Badge */}
            <div className="inline-block px-4 py-2 rounded-xl bg-white flex-shrink-0 mx-auto mb-3">
              <span className="text-black text-xl font-bold tracking-tight">
                Register
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              Create Account
            </h1>
            <p className="text-stone-600 mt-1">
              Join us and start your journey today
            </p>
          </div>

          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-neutral-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200 py-5 text-base"
                          />
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-neutral-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="your@email.com"
                            {...field}
                            className="border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200 py-5 text-base"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            @
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-medium text-neutral-700">
                          Password
                        </FormLabel>
                        {form.watch("password") && (
                          <div className="flex items-center gap-1 text-xs">
                            {passwordRegex.test(form.watch("password")) ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-green-600 font-medium">
                                  Strong
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                <span className="text-red-500 font-medium">
                                  Weak
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200 py-5 text-base pr-10" // Added pr-10 to prevent text from overlapping icon
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {/* Password Strength Indicators */}
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <PasswordRequirement
                          met={form.watch("password")?.length >= 8}
                          text="8+ characters"
                        />
                        <PasswordRequirement
                          met={/[A-Z]/.test(form.watch("password") || "")}
                          text="Uppercase letter"
                        />
                        <PasswordRequirement
                          met={/[a-z]/.test(form.watch("password") || "")}
                          text="Lowercase letter"
                        />
                        <PasswordRequirement
                          met={/\d/.test(form.watch("password") || "")}
                          text="Number"
                        />
                      </div>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-neutral-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200 py-5 text-base pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-slate-900 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper component for password requirements
const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-1.5 h-1.5 rounded-full ${
        met ? "bg-green-500" : "bg-neutral-400"
      }`}
    />
    <span
      className={`text-xs ${met ? "text-neutral-700" : "text-neutral-500"}`}
    >
      {text}
    </span>
  </div>
);
