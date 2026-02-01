"use client";
import { Suspense } from "react";
import ResetPasswordPage from "./reset-helper";


export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  )
}