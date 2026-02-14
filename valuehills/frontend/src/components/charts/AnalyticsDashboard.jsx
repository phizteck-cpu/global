import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Activity } from 'lucide-react';
import { LineChart, AreaChart, BarChart, DonutChart } from './index';
import { clsx } from 'clsx';

// Stat Card Component
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  suffix = '',
  prefix = '',
}) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 border border-white/5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-noble-gray">{title}</p>
          <p className="text-3xl font-bold text-white">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-red-400" />}
              <span
                className={clsx(
                  'text-sm font-medium',
                  isPositive && 'text-emerald-400',
                  isNegative && 'text-red-400',
                  !isPositive && !isNegative && 'text-white/50'
                )}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-white/30">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl bg-white/5', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Chart Card Component
export const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('glass-panel rounded-2xl p-6 border border-white/5', className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-noble-gray mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </motion.div>
  );
};

// Member Growth Chart
export const MemberGrowthChart = ({ data = [], period = 'weekly' }) => {
  return (
    <ChartCard title="Member Growth" subtitle={`${period.charAt(0).toUpperCase() + period.slice(1)} new registrations`}>
      <AreaChart
        data={data}
        xAxisKey="period"
        color="#10b981"
        height={280}
      />
    </ChartCard>
  );
};

// Revenue Chart
export const RevenueChart = ({ data = [], period = 'monthly' }) => {
  return (
    <ChartCard title="Revenue Overview" subtitle={`${period.charAt(0).toUpperCase() + period.slice(1)} revenue breakdown`}>
      <BarChart
        data={data}
        layout="vertical"
        height={280}
      />
    </ChartCard>
  );
};

// Contributions Distribution Chart
export const ContributionsChart = ({ data = [] }) => {
  return (
    <ChartCard title="Contributions Distribution" subtitle="By membership tier">
      <div className="flex items-center justify-center">
        <DonutChart
          data={data}
          height={260}
          centerValue={data.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}
          centerText="Total"
        />
      </div>
    </ChartCard>
  );
};

// Wallet Balance Chart
export const WalletBalanceChart = ({ data = [] }) => {
  return (
    <ChartCard title="Wallet Balance Trend" subtitle="Available balance over time">
      <LineChart
        data={data}
        height={280}
        lines={[
          { key: 'wallet', name: 'Wallet', color: '#10b981' },
          { key: 'contribution', name: 'Contribution', color: '#3b82f6' },
          { key: 'bv', name: 'BV Balance', color: '#f59e0b' },
        ]}
      />
    </ChartCard>
  );
};

// Tier Distribution Chart
export const TierDistributionChart = ({ data = [] }) => {
  return (
    <ChartCard title="Tier Distribution" subtitle="Members by membership level">
      <BarChart
        data={data}
        layout="horizontal"
        height={260}
      />
    </ChartCard>
  );
};

// Activity Chart
export const ActivityChart = ({ data = [], period = 'weekly' }) => {
  return (
    <ChartCard title="Platform Activity" subtitle={`${period.charAt(0).toUpperCase() + period.slice(1)} login and transaction activity`}>
      <LineChart
        data={data}
        height={280}
        lines={[
          { key: 'logins', name: 'Logins', color: '#10b981' },
          { key: 'transactions', name: 'Transactions', color: '#3b82f6' },
        ]}
      />
    </ChartCard>
  );
};

// Quick Stats Row
export const QuickStats = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Members"
        value={stats.totalMembers || 0}
        change={stats.memberGrowth || 0}
        changeType={stats.memberGrowth >= 0 ? 'positive' : 'negative'}
        icon={Users}
        iconColor="text-emerald-400"
      />
      <StatCard
        title="Active Contributions"
        value={stats.activeContributions || 0}
        change={stats.contributionGrowth || 0}
        changeType={stats.contributionGrowth >= 0 ? 'positive' : 'negative'}
        icon={DollarSign}
        iconColor="text-blue-400"
      />
      <StatCard
        title="Total Packages"
        value={stats.totalPackages || 0}
        icon={Package}
        iconColor="text-amber-400"
      />
      <StatCard
        title="Completion Rate"
        value={stats.completionRate || 0}
        suffix="%"
        change={stats.completionChange || 0}
        changeType={stats.completionChange >= 0 ? 'positive' : 'negative'}
        icon={Activity}
        iconColor="text-purple-400"
      />
    </div>
  );
};

// Main Analytics Dashboard
const AnalyticsDashboard = ({
  loading: _loading,
  period = 'weekly',
  onPeriodChange: _onPeriodChange,
  stats = {},
  memberGrowthData = [],
  revenueData = [],
  contributionData = [],
  walletData = [],
  tierData = [],
  activityData = [],
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberGrowthChart data={memberGrowthData} period={period} />
        <RevenueChart data={revenueData} period={period} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WalletBalanceChart data={walletData} />
        </div>
        <ContributionsChart data={contributionData} />
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TierDistributionChart data={tierData} />
        <ActivityChart data={activityData} period={period} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
