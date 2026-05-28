'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

export const MobileFilterSheet = ({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) => (
	<AnimatePresence>
		{open && (
			<>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
				/>
				<motion.div
					initial={{ x: '-100%' }}
					animate={{ x: 0 }}
					exit={{ x: '-100%' }}
					transition={{ type: 'spring', damping: 25, stiffness: 300 }}
					className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background overflow-y-auto shadow-2xl lg:hidden"
				>
					<div className="flex items-center justify-between px-5 py-4 border-b border-border">
						<h3 className="font-bold text-foreground">Filters</h3>
						<button
							onClick={onClose}
							className="p-1 hover:bg-muted rounded-lg transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="p-4">{children}</div>
				</motion.div>
			</>
		)}
	</AnimatePresence>
);
