import { NewArrivals } from '@/components/shop/new-arrivals';
import { FlashSales } from '@/components/shop/flash-sales';
import { HeroSection } from '@/components/shop/hero-section';
import { GadgetEssentails } from '@/components/shop/gadget-essentails';
import CategorySection from '@/components/shop/category-section';
// import { EarnWithUsSection } from "@/components/account/EarnWithUsSection";
// import FoodEssentails from '@/components/shop/food-essentails';

export default function MarketHub() {
	return (
		<div>
			<HeroSection />
			<CategorySection />
			<NewArrivals />
			<FlashSales />
			<GadgetEssentails />
			{/* <FoodEssentails /> */}
		</div>
	);
}
