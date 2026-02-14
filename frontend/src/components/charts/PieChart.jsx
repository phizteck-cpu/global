import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surfaceHighlight border border-white/10 rounded-xl p-3 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <p className="text-sm text-white font-medium">{data.name}</p>
      </div>
      <p className="text-sm text-noble-gray">
        Value: {data.value?.toLocaleString()}
        {data.percentage && ` (${data.percentage.toFixed(1)}%)`}
      </p>
    </motion.div>
  );
};

const PieChartComponent = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
  height = 300,
  showTooltip = true,
  showLegend = true,
  animate = true,
  innerRadius = 0,
  outerRadius = '80%',
  className,
  legendPosition = 'right',
}) => {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);

  const enhancedData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? (item[dataKey] / total) * 100 : 0,
    fill: item.color || colors[index % colors.length],
  }));

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't show labels for small segments

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Pie
            data={enhancedData}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={renderCustomizedLabel}
            labelLine={false}
            animationDuration={500}
          >
            {enhancedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              layout="vertical"
              align={legendPosition === 'right' ? 'right' : legendPosition}
              verticalAlign="middle"
              wrapperStyle={{
                paddingLeft: legendPosition === 'right' ? 20 : 0,
                fontSize: 12,
              }}
              formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Donut Chart (Pie with hole in center)
export const DonutChart = ({ centerText, centerValue, ...props }) => {
  return (
    <div className="relative">
      <PieChartComponent {...props} innerRadius="60%" outerRadius="80%" />
      {centerValue !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && (
              <p className="text-2xl font-bold text-white">{centerValue}</p>
            )}
            {centerText && (
              <p className="text-xs text-noble-gray">{centerText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
