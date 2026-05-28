import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comparisonFeatures } from '@/lib/plans';

interface ComparisonTableProps {
	showComparison: boolean;
}

export const ComparisonTable = ({ showComparison }: ComparisonTableProps) => {
	return (
		<AnimatePresence>
			{showComparison && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className="overflow-hidden"
				>
					<div className="rounded-2xl border border-border overflow-hidden mb-8">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr>
										<th className="text-left py-3 px-4 bg-foreground text-card font-semibold w-50">
											Features
										</th>
										<th className="py-3 px-4 bg-primary text-primary-foreground font-semibold">
											<div>Basic</div>
											<div className="text-xs opacity-80 font-normal">
												₦1,250
											</div>
										</th>
										<th className="py-3 px-4 bg-[hsl(270,60%,40%)] text-card font-semibold">
											<div>Classic</div>
											<div className="text-xs opacity-80 font-normal">
												₦12,500
											</div>
										</th>
										<th className="py-3 px-4 bg-foreground text-card font-semibold">
											<div>Deluxe</div>
											<div className="text-xs opacity-80 font-normal">
												₦170,000
											</div>
										</th>
									</tr>
								</thead>
								<tbody>
									{comparisonFeatures.map((row, i) => (
										<tr
											key={row.feature}
											className={cn(i % 2 === 0 ? 'bg-card' : 'bg-muted/30')}
										>
											<td className="py-2.5 px-4 font-medium text-foreground text-xs">
												{row.feature}
											</td>
											<td
												className={cn(
													'py-2.5 px-4 text-center text-xs',
													row.basic === '✗'
														? 'text-muted-foreground'
														: 'text-foreground',
												)}
											>
												{row.basic === '✓' ? (
													<Check className="h-4 w-4 text-primary mx-auto" />
												) : row.basic === '✗' ? (
													<span className="text-muted-foreground italic">
														—
													</span>
												) : (
													row.basic
												)}
											</td>
											<td
												className={cn(
													'py-2.5 px-4 text-center text-xs',
													row.classic === '✗'
														? 'text-muted-foreground'
														: 'text-foreground',
												)}
											>
												{row.classic === '✓' ? (
													<Check className="h-4 w-4 text-primary mx-auto" />
												) : row.classic === '✗' ? (
													<span className="text-muted-foreground italic">
														—
													</span>
												) : (
													row.classic
												)}
											</td>
											<td
												className={cn(
													'py-2.5 px-4 text-center text-xs',
													row.deluxe === '✗'
														? 'text-muted-foreground'
														: 'text-foreground',
												)}
											>
												{row.deluxe === '✓' ? (
													<Check className="h-4 w-4 text-primary mx-auto" />
												) : row.deluxe === '✗' ? (
													<span className="text-muted-foreground italic">
														—
													</span>
												) : (
													row.deluxe
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
