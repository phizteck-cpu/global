import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { clsx } from 'clsx';

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surfaceHighlight border border-white/10 rounded-xl p-3 shadow-xl"
    >
      <p className="text-sm text-noble-gray mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-medium text-emerald-400">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </motion.div>
  );
};

const AreaChartComponent = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#10b981',
  gradientId = 'areaGradient',
  height = 300,
  showGrid = true,
  showTooltip = true,
  animate = true,
  fillOpacity = 0.3,
  strokeWidth = 2,
  className,
}) => {
  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          )}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AreaChartComponent;
