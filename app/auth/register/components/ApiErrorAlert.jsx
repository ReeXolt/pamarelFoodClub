import { AlertCircle } from 'lucide-react';

export function ApiErrorAlert({ error }) {
	if (!error) return null;

	return (
		<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
			<div className="flex gap-3">
				<AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
				<div>
					<p className="text-sm font-semibold text-red-800">
						Registration Error
					</p>
					<p className="text-sm text-red-700 mt-1">{error}</p>
				</div>
			</div>
		</div>
	);
}
