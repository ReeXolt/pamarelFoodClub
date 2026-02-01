import { OrderHistory } from "@/components/account/order-history";

export default function OrdersPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Order History</h1>
                <p className="text-muted-foreground">
                    View and manage all your past orders.
                </p>
            </div>
            <OrderHistory showAll={true} />
        </div>
    )
}