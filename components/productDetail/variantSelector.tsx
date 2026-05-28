"use client"

import { VariantType } from "@/models/product";

type VariantSelectorProps = {
  variants: VariantType[] | undefined;
  selectedVariant: Record<string, string>;
  onVariantChange: (_variantName: string, _options: string[]) => void;
};
// Product Variants Component
export const VariantSelector = ({ variants, selectedVariant, onVariantChange }: VariantSelectorProps) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <div key={index} className="space-y-3">
          <h4 className="font-semibold text-gray-900 capitalize">
            {variant.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option, optionIndex) => {
              const isSelected = selectedVariant[variant.name] === option;
              return (
                <button
                  key={optionIndex}
                  onClick={() => onVariantChange(variant.name, variant.options)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};