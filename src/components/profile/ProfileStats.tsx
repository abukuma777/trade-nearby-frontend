/**
 * プロフィール統計情報コンポーネント
 */

import { Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import React from 'react';

import { UserStats } from '@/hooks/useProfile';

interface ProfileStatsProps {
  stats: UserStats | undefined;
  isLoading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: '出品中',
      value: stats.activeItems,
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '取引完了',
      value: stats.tradedItems,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '取引中',
      value: stats.reservedItems,
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: '総出品数',
      value: stats.totalItems,
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
              <div className={`${item.bgColor} p-3 rounded-full`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;
