import { Suspense } from "react";
import LoginHelper from "./LoginHelper";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginHelper />
    </Suspense>
  )
}