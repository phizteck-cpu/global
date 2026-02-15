import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
        <p key={index} className={clsx('text-sm font-medium', entry.color === '#10b981' ? 'text-emerald-400' : 'text-primary')}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </motion.div>
  );
};

const LineChartComponent = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'name',
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  strokeWidth = 2,
  className,
}) => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
            />
          )}
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name || line.key}
                stroke={line.color || colors[index % colors.length]}
                strokeWidth={line.width || strokeWidth}
                dot={line.showDot !== false}
                activeDot={{ r: 6, fill: line.color || colors[index % colors.length] }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#10b981"
              strokeWidth={strokeWidth}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 6, fill: '#10b981' }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChartComponent;
