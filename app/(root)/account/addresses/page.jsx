import { AddressBook } from "@/components/account/address-book";

export default function AddressesPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Address Book</h1>
                <p className="text-muted-foreground">
                    Manage your shipping and billing addresses.
                </p>
            </div>
            <AddressBook />
        </div>
    );
}
