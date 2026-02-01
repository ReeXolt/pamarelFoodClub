import { Suspense } from "react"
import RegistrationPage from "./registration-helper"


export default function Registration() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationPage />
    </Suspense>
  )
}