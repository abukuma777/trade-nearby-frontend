/**
 * 出品者情報詳細表示コンポーネント
 * 評価、出品数、取引実績などを表示
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Package,
  CheckCircle,
  Clock,
  MessageCircle,
  Award,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Heart,
  Users,
} from 'lucide-react';
import { UserProfile, UserStats, getRatingColor, getRatingLabel, badgeLabels } from '@/types/user';
import { RatingDisplay } from '@/components/trade';

interface UserInfoDetailProps {
  userId: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  className?: string;
}

// モックデータ生成（実際のAPIが実装されるまでの仮データ）
const generateMockUserStats = (userId: string): UserStats => {
  const seed = userId.charCodeAt(0) + userId.charCodeAt(1);
  return {
    totalItems: 10 + (seed % 50),
    activeItems: 3 + (seed % 10),
    tradedItems: 5 + (seed % 20),
    rating: 3.5 + (seed % 15) / 10,
    ratingCount: 10 + (seed % 100),
    responseRate: 70 + (seed % 30),
    responseTime: seed % 2 === 0 ? '1時間以内' : '数時間以内',
    joinedDays: 30 + seed * 5,
  };
};

// バッジアイコンマップ
const badgeIcons: Record<string, React.ReactNode> = {
  verified: <Shield className="w-4 h-4" />,
  top_trader: <TrendingUp className="w-4 h-4" />,
  friendly: <Heart className="w-4 h-4" />,
  quick_response: <Zap className="w-4 h-4" />,
  trusted: <Users className="w-4 h-4" />,
};

export const UserInfoDetail: React.FC<UserInfoDetailProps> = ({ userId, user, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'reviews'>('stats');

  // モックデータを使用（実際はAPIから取得）
  const stats = generateMockUserStats(userId);
  const userProfile: UserProfile = {
    id: userId,
    username: user?.username || 'Unknown User',
    avatar: user?.avatar,
    bio: '趣味でアニメグッズを集めています。大切に使ってくれる方との交換を希望します。',
    location: {
      prefecture: '東京都',
      city: '渋谷区',
    },
    created_at: new Date(Date.now() - stats.joinedDays * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stats,
    isVerified: stats.rating >= 4.0,
    badges:
      stats.rating >= 4.0
        ? [
            {
              id: '1',
              type: 'verified' as const,
              name: '認証済み',
              description: '本人確認済み',
              icon: 'shield',
              earned_at: new Date().toISOString(),
            },
          ]
        : [],
  };

  // 評価の星を描画
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`w-4 h-4 fill-current ${getRatingColor(rating)}`} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="absolute w-4 h-4 text-gray-300" />
            <div className="absolute overflow-hidden w-2">
              <Star className={`w-4 h-4 fill-current ${getRatingColor(rating)}`} />
            </div>
          </div>,
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // 日付フォーマット
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* ヘッダー部分 */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* アバター */}
            <div className="relative">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-600">
                    {userProfile.username[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {userProfile.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {userProfile.username}
                {userProfile.badges?.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                    title={badge.description}
                  >
                    {badgeIcons[badge.type]}
                    {badge.name}
                  </span>
                ))}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatJoinDate(userProfile.created_at)}から利用
                </span>
                {userProfile.location && <span>{userProfile.location.prefecture}</span>}
              </div>
            </div>
          </div>

          {/* 展開/折りたたみボタン */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? '折りたたむ' : '詳細を表示'}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* 評価サマリー */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RatingDisplay
              rating={stats.rating}
              showNumber={true}
              count={stats.ratingCount}
              size="md"
            />
            <span
              className={`text-sm px-2 py-0.5 rounded-full ${
                stats.rating >= 4.0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {getRatingLabel(stats.rating)}
            </span>
          </div>

          <Link
            to={`/users/${userId}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            プロフィールを見る →
          </Link>
        </div>
      </div>

      {/* 統計情報（常に表示） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-xs text-gray-500">出品数</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.tradedItems}</div>
          <div className="text-xs text-gray-500">取引完了</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.responseRate}%</div>
          <div className="text-xs text-gray-500">返信率</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.responseTime}</div>
          <div className="text-xs text-gray-500">返信時間</div>
        </div>
      </div>

      {/* 詳細情報（展開時のみ） */}
      {isExpanded && (
        <div className="p-6">
          {/* 自己紹介 */}
          {userProfile.bio && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">自己紹介</h4>
              <p className="text-sm text-gray-600">{userProfile.bio}</p>
            </div>
          )}

          {/* タブ */}
          <div className="border-b mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTab('stats')}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'stats'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                取引実績
              </button>
              <button
                onClick={() => setSelectedTab('reviews')}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'reviews'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                レビュー
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          {selectedTab === 'stats' && (
            <div className="space-y-4">
              {/* 取引傾向 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">現在出品中</div>
                  <div className="text-lg font-semibold text-gray-900">{stats.activeItems}点</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">今月の取引</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.floor(stats.tradedItems / 3)}件
                  </div>
                </div>
              </div>

              {/* パフォーマンス指標 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">信頼度</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.rating / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {((stats.rating / 5) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活発度</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (stats.totalItems / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.min(100, Math.floor((stats.totalItems / 30) * 100))}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <div className="space-y-4">
              {/* モックレビュー */}
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">レビュー機能は準備中です</p>
                <p className="text-xs mt-2">取引完了後にレビューを投稿できるようになります</p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              メッセージを送る
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">
              フォロー
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoDetail;
