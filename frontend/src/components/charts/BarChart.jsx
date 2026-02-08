import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
        <p key={index} className="text-sm font-medium text-emerald-400">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </motion.div>
  );
};

const BarChartComponent = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'name',
  bars = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  layout = 'vertical',
  barSize = 20,
  className,
}) => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          )}
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
            </>
          ) : (
            <>
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
            </>
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
            />
          )}
          {bars.length > 0 ? (
            bars.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name || bar.key}
                fill={bar.color || colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              >
                {bar.data && bar.data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={bar.color || colors[i % colors.length]} />
                ))}
              </Bar>
            ))
          ) : (
            <Bar
              dataKey={dataKey}
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BarChartComponent;
