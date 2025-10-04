/**
 * プロフィールページコンポーネント
 */

import {
  User,
  Calendar,
  Edit3,
  Camera,
  AlertCircle,
  Loader,
  Package,
  Instagram,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ProfileEditModal from '@/components/profile/ProfileEditModal';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTradePosts from '@/components/profile/ProfileTradePosts';
import { useCurrentUser, useUserStats, useUserById } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username?: string }>();
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);

  // 自分のプロフィールか判定
  const isOwnProfile = !username || username === authUser?.username;

  // ユーザー情報と統計情報を取得（自分の場合と他人の場合で使い分け）
  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
    refetch: refetchCurrentUser,
  } = useCurrentUser();

  const {
    data: otherUser,
    isLoading: isLoadingOtherUser,
    error: otherUserError,
    refetch: refetchOtherUser,
  } = useUserById(username || '');

  // 表示用のユーザーデータ（自分か他人かで切り替え）
  const displayUser = isOwnProfile ? currentUser || authUser : otherUser;
  const isLoadingUser = isOwnProfile ? isLoadingCurrentUser : isLoadingOtherUser;
  const userError = isOwnProfile ? currentUserError : otherUserError;
  const refetchUser = isOwnProfile ? refetchCurrentUser : refetchOtherUser;

  const { data: userStats, isLoading: isLoadingStats } = useUserStats(
    isOwnProfile ? undefined : displayUser?.id,
  );

  // 編集後に強制的に再レンダリングするためのステート
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // 自分のプロフィールで認証されていない場合はログインページへリダイレクト
  useEffect(() => {
    if (isOwnProfile && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isOwnProfile, isAuthenticated, navigate]);

  // 日付のフォーマット
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {return '不明';}
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // メンバーになってからの日数を計算
  const getDaysSinceJoined = (joinDate: string | undefined) => {
    if (!joinDate) {return 0;}
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ローディング状態
  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // エラー状態
  if (userError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">エラーが発生しました</h3>
              <p className="mt-1 text-red-700">
                {userError.message || 'プロフィール情報の取得に失敗しました'}
              </p>
              <button
                onClick={() => refetchUser()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* アバター */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {displayUser?.avatar_url ? (
                  <img
                    src={displayUser.avatar_url}
                    alt="アバター"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-bold">
                    {displayUser?.username?.[0]?.toUpperCase() ||
                      displayUser?.email?.[0]?.toUpperCase() ||
                      'U'}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <button
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title="アバターを変更"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* ユーザー情報 */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {displayUser?.display_name || displayUser?.username || 'ユーザー'}
                  </h1>
                  <p className="mt-1 text-gray-600">@{displayUser?.username || 'username'}</p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    編集
                  </button>
                )}
              </div>

              {/* 詳細情報 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>登録日: {formatDate(displayUser?.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>メンバー歴: {getDaysSinceJoined(displayUser?.created_at)}日</span>
                </div>
              </div>

              {/* 自己紹介 */}
              {displayUser?.bio && (
                <div className="mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{displayUser.bio}</p>
                </div>
              )}

              {/* SNSアカウント */}
              {(displayUser?.twitter || displayUser?.instagram) && (
                <div className="mt-4 flex gap-3">
                  {displayUser.twitter && (
                    <a
                      href={`https://x.com/${displayUser.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-400 transition-colors"
                      title={`X: @${displayUser.twitter}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span className="text-sm">@{displayUser.twitter}</span>
                    </a>
                  )}
                  {displayUser.instagram && (
                    <a
                      href={`https://www.instagram.com/${displayUser.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
                      title={`Instagram: @${displayUser.instagram}`}
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-sm">@{displayUser.instagram}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 統計情報セクション */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">取引統計</h2>
          <ProfileStats stats={userStats} isLoading={isLoadingStats} />
        </div>

        {/* 商品サムネイルセクション（userIdとusernameを渡す） */}
        <div className="mt-8">
          <ProfileTradePosts
            userId={displayUser?.id || authUser?.id}
            username={displayUser?.username || authUser?.username}
          />
        </div>

        {/* アクションボタンセクション（自分の場合のみ表示） */}
        {isOwnProfile && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/trade-posts/my')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Package className="w-5 h-5" />
                自分の出品を管理
              </button>
              <button
                onClick={() => navigate('/trade-posts/create')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              >
                <Edit3 className="w-5 h-5" />
                新規出品
              </button>
              <button
                onClick={() => navigate('/trade')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                取引管理
              </button>
            </div>
          </div>
        )}

        {/* 設定セクション（自分の場合のみ表示） */}
        {isOwnProfile && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">設定</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">メール通知</p>
                  <p className="text-sm text-gray-600">新しいメッセージや取引の通知を受け取る</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">プロフィール公開</p>
                  <p className="text-sm text-gray-600">他のユーザーにプロフィールを表示する</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 編集モーダル（自分の場合のみ） */}
      {isOwnProfile && (
        <ProfileEditModal
          user={displayUser || undefined}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={async () => {
            console.log('ProfilePage: 更新後の処理を実行');
            // 強制的にコンポーネントを再レンダリング
            forceUpdate();
            // キャッシュを無視して再取得
            await refetchUser();
            console.log('ProfilePage: 更新完了');
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
