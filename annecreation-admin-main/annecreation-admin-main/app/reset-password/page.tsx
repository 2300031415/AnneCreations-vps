"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useResetPasswordMutation } from "@/lib/redux/api/authApi";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = await resetPassword({ token, newPassword }).unwrap();
      toast.success(result.message || "Password reset successful!");
      setIsSuccess(true);
      setTimeout(() => router.replace("/"), 2000);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || err?.message || "Failed to reset password.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md text-center">
          <Logo className="h-16 w-16 mx-auto" />
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800 font-medium">
              ✅ Password reset successfully! Redirecting to login...
            </p>
          </div>
          <Link href="/">
            <Button className="w-full bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Logo className="h-16 w-16" />
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-sm text-gray-500">Enter your new admin password below</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90"
              disabled={isLoading || !token}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Set New Password"
              )}
            </Button>

            <Link href="/">
              <Button
                type="button"
                className="flex w-full items-center justify-center"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#ccd88f]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

