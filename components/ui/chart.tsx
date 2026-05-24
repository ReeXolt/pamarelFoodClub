'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
	light: '',
	dark: '.dark',
};

interface ChartContextProps {
	config: Record<string, any>;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
	const context = React.useContext(ChartContext);

	if (!context) {
		throw new Error('useChart must be used within a <ChartContainer />');
	}

	return context;
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	id?: string;
	config: Record<string, any>;
	children: React.ReactNode;
}

function ChartContainer({
	id,
	className,
	children,
	config,
	...props
}: ChartContainerProps) {
	const uniqueId = React.useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-slot="chart"
				data-chart={chartId}
				className={cn(
					"[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
					className
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />

				<RechartsPrimitive.ResponsiveContainer>
					{/* Fix: Cast children to ReactElement to satisfy Recharts strict typing */}
					{React.isValidElement(children) ? children : <>{children}</>}
				</RechartsPrimitive.ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	);
}

interface ChartStyleProps {
	id: string;
	config: Record<string, any>;
}

const ChartStyle = ({ id, config }: ChartStyleProps) => {
	const colorConfig = Object.entries(config).filter(
		([, config]: [string, any]) => config.theme || config.color
	);

	if (!colorConfig.length) return null;

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: Object.entries(THEMES)
					.map(
						([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
	.map(([key, itemConfig]: [string, any]) => {
		const color = itemConfig.theme?.[theme] || itemConfig.color;
		return color ? `  --color-${key}: ${color};` : null;
	})
	.filter(Boolean)
	.join('\n')}
}
`
					)
					.join('\n'),
			}}
		/>
	);
};

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps
	extends React.HTMLAttributes<HTMLDivElement> {
	active?: boolean;
	payload?: any[];
	indicator?: 'dot' | 'line' | 'dashed';
	hideLabel?: boolean;
	hideIndicator?: boolean;
	label?: string;

	labelFormatter?: (
		value: any,
		payload: any[]
	) => React.ReactNode;

	labelClassName?: string;

	formatter?: (
		value: any,
		name: string,
		entry: any,
		index: number,
		payload: any
	) => React.ReactNode;

	color?: string;
	nameKey?: string;
	labelKey?: string;
}

function ChartTooltipContent({
	active,
	payload,
	className,
	indicator = 'dot',
	hideLabel = false,
	hideIndicator = false,
	label,
	labelFormatter,
	labelClassName,
	formatter,
	color,
	nameKey,
	labelKey,
}: ChartTooltipContentProps) {
	const { config } = useChart();

	const tooltipLabel = React.useMemo<React.ReactNode>(() => {
		if (hideLabel || !payload?.length) return null;

		const [item] = payload;

		const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;

		const itemConfig = getPayloadConfigFromPayload(config, item, key);

		const value =
			!labelKey && typeof label === 'string'
				? config[label]?.label || label
				: itemConfig?.label;

		if (labelFormatter) {
			return (
				<div className={cn('font-medium', labelClassName)}>
					{labelFormatter(value, payload)}
				</div>
			);
		}

		if (!value) return null;

		return (
			<div className={cn('font-medium', labelClassName)}>
				{value}
			</div>
		);
	}, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

	if (!active || !payload?.length) return null;

	const nestLabel = payload.length === 1 && indicator !== 'dot';

	return (
		<div
			className={cn(
				'border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
				className
			)}
		>
			{!nestLabel ? tooltipLabel : null}

			<div className="grid gap-1.5">
				{payload.map((item, index) => {
					const key = `${nameKey || item.name || item.dataKey || 'value'}`;

					const itemConfig = getPayloadConfigFromPayload(config, item, key);

					const indicatorColor =
						color || item.payload?.fill || item.color;

					return (
						<div
							key={item.dataKey || index}
							className={cn(
								'flex w-full flex-wrap items-stretch gap-2',
								indicator === 'dot' && 'items-center'
							)}
						>
							{formatter && item?.value !== undefined && item.name ? (
								formatter(
									item.value,
									item.name,
									item,
									index,
									item.payload
								)
							) : (
								<>
									{itemConfig?.icon ? (
										React.createElement(itemConfig.icon as React.ComponentType<any>, {
											className: 'h-3 w-3 shrink-0',
										})
									) : (
										!hideIndicator && (
											<div
												className="shrink-0 rounded-[2px]"
												style={{
													backgroundColor: indicatorColor,
													width: '9px',
													height: '9px',
												}}
											/>
										)
									)}

									<div className="flex flex-1 justify-between leading-none">
										<div className="grid gap-1.5">
											{nestLabel ? tooltipLabel : null}

											<span className="text-muted-foreground">
												{itemConfig?.label || item.name}
											</span>
										</div>

										{item.value !== undefined && (
											<span className="font-mono font-medium tabular-nums">
												{typeof item.value === 'number'
													? item.value.toLocaleString()
													: item.value}
											</span>
										)}
									</div>
								</>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps
	extends React.HTMLAttributes<HTMLDivElement> {
	hideIcon?: boolean;
	payload?: any[];
	verticalAlign?: 'top' | 'bottom';
	nameKey?: string;
}

function ChartLegendContent({
	className,
	hideIcon = false,
	payload,
	verticalAlign = 'bottom',
	nameKey,
}: ChartLegendContentProps) {
	const { config } = useChart();

	if (!payload?.length) return null;

	return (
		<div
			className={cn(
				'flex items-center justify-center gap-4',
				verticalAlign === 'top' ? 'pb-3' : 'pt-3',
				className
			)}
		>
			{payload.map((item, index) => {
				const key = `${nameKey || item.dataKey || 'value'}`;

				const itemConfig = getPayloadConfigFromPayload(config, item, key);

				return (
					<div key={item.value || index} className="flex items-center gap-1.5">
						{itemConfig?.icon && !hideIcon ? (
							React.createElement(itemConfig.icon as React.ComponentType<any>, {
								className: 'h-3 w-3',
							})
						) : (
							<div
								className="h-2 w-2 rounded-[2px]"
								style={{ backgroundColor: item.color }}
							/>
						)}

						{itemConfig?.label}
					</div>
				);
			})}
		</div>
	);
}

// Helper
function getPayloadConfigFromPayload(
	config: Record<string, any>,
	payload: any,
	key: string
): any {
	if (typeof payload !== 'object' || payload === null) return undefined;

	const payloadPayload =
		payload?.payload && typeof payload.payload === 'object'
			? payload.payload
			: undefined;

	let configLabelKey = key;

	if (key in payload && typeof payload[key] === 'string') {
		configLabelKey = payload[key];
	} else if (
		payloadPayload &&
		key in payloadPayload &&
		typeof payloadPayload[key] === 'string'
	) {
		configLabelKey = payloadPayload[key];
	}

	return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	ChartStyle,
};