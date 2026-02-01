import TransactionsPage from "./TransactionHelper";
import { Suspense } from "react";

export default function TransactionsDisplay() {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <TransactionsPage />
        </Suspense>
    )
}