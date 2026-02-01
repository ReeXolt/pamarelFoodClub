import { Suspense } from "react"
import Orders from "./OrderHelper"


export default function OrderDisplay() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Orders />
    </Suspense>
  )
}