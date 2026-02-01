
import { PendingReviews } from "@/components/account/pending-reviews";

export default function ReviewsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Pending Reviews</h1>
                <p className="text-muted-foreground">
                    Review your recent purchases to help other shoppers.
                </p>
            </div>
            <PendingReviews showAll={true} />
        </div>
    )
}
