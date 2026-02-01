import { Suspense } from "react";
import PaymentVerify from "../VerifyHelper";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentVerify />
    </Suspense>
  )
}