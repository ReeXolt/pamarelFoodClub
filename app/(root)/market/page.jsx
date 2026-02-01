import { NewArrivals } from "@/components/account/new-arrivals";
import { FlashSales } from "@/components/account/flash-sales";
import { HeroSection } from "@/components/account/hero-section";
import { GadgetEssentails } from "@/components/account/gadget-essentails";
// import { EarnWithUsSection } from "@/components/account/EarnWithUsSection";
import CategorySection from "@/components/account/category-section";
import FoodEnssentails from "@/components/account/food-essentails";


export default function MarketHub() {
    return (
        <div>
            <HeroSection />
            <div className="container mx-auto px-4 md:px-6">
                <CategorySection />
            </div>
            <NewArrivals />
            <FlashSales />
            <GadgetEssentails />
            {/* <FoodEnssentails /> */}
        </div>
    )
}