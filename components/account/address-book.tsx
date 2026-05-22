'use client';

import * as React from 'react';
import { AddressCard } from './address-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AddressForm } from './address-form';
import { useToast } from '@/hooks/use-toast';

// Address type
export interface Address {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	isDefault?: boolean;
}

// Example initial addresses (replace with real data source as needed)
const initialAddresses: Address[] = [];

export function AddressBook() {
	const [addresses, setAddresses] = React.useState<Address[]>(initialAddresses);
	const [addressToEdit, setAddressToEdit] = React.useState<Address | null>(
		null,
	);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const { toast } = useToast();

	const handleAddClick = () => {
		setAddressToEdit(null);
		setIsDialogOpen(true);
	};

	const handleEditClick = (address: Address) => {
		setAddressToEdit(address);
		setIsDialogOpen(true);
	};

	const handleSetDefault = (id: string) => {
		setAddresses((prev) =>
			prev.map((addr) =>
				addr.id === id
					? { ...addr, isDefault: true }
					: { ...addr, isDefault: false },
			),
		);
		toast({
			title: 'Default Address Updated',
			description: 'Your default shipping address has been changed.',
		});
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<div className="space-y-6">
				<div className="flex justify-end">
					<Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddClick}>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add New Address
					</Button>
				</div>
				{addresses.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{addresses.map((address) => (
							<AddressCard
								key={address.id}
								address={address}
								onEdit={() => handleEditClick(address)}
								onSetDefault={() => handleSetDefault(address.id)}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-20 text-center">
						<h3 className="text-lg font-semibold">No addresses found</h3>
						<p className="text-sm text-muted-foreground">
							You have not added any shipping addresses yet.
						</p>
						<Button className="mt-4" onClick={handleAddClick} variant={undefined}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Address
						</Button>
					</div>
				)}
			</div>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader className={undefined}>
					<DialogTitle>
						{addressToEdit ? 'Edit Address' : 'Add New Address'}
					</DialogTitle>
					<DialogDescription>
						{addressToEdit
							? 'Update your address details.'
							: 'Add a new address to your address book.'}
					</DialogDescription>
				</DialogHeader>
				<AddressForm
					address={addressToEdit}
					onSuccess={() => setIsDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
