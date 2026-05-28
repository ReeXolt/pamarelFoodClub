'use client';
import { Truck, Shield, Check } from 'lucide-react';

export const ProductTrustBadges = () => (
	<div className="grid grid-cols-3 gap-3 py-4 border-t border-border">
		<div className="flex items-start gap-2">
			<Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
			<div>
				<span className="text-xs font-bold text-foreground block">
					Free Shipping
				</span>
				<span className="text-[10px] text-muted-foreground">
					On orders over ₦100,000
				</span>
			</div>
		</div>
		<div className="flex items-start gap-2">
			<Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
			<div>
				<span className="text-xs font-bold text-foreground block">
					2-Year Warranty
				</span>
				<span className="text-[10px] text-muted-foreground">
					Full protection
				</span>
			</div>
		</div>
		<div className="flex items-start gap-2">
			<Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
			<div>
				<span className="text-xs font-bold text-foreground block">
					Quality Assured
				</span>
				<span className="text-[10px] text-muted-foreground">
					Premium quality
				</span>
			</div>
		</div>
	</div>
);
