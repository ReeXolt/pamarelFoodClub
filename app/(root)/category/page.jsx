import CategoryPage from "./category-helper"
import { Suspense } from "react"

export default function CategoryDisplay() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <CategoryPage />
      {/* <div>category page</div> */}
    </Suspense>
  )
}