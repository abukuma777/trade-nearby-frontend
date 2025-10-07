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
import {
  useCurrentUser,
  useUserStats,
  useUserById,
  useUpdateProfile,
} from '@/hooks/useProfile';
import { presignedUploadService } from '@/services/presignedUploadService';
import { useAuthStore } from '@/stores/authStore';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username?: string }>();
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const updateProfileMutation = useUpdateProfile();

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
  const isLoadingUser = isOwnProfile
    ? isLoadingCurrentUser
    : isLoadingOtherUser;
  const userError = isOwnProfile ? currentUserError : otherUserError;
  const refetchUser = isOwnProfile ? refetchCurrentUser : refetchOtherUser;

  const { data: userStats, isLoading: isLoadingStats } = useUserStats(
    isOwnProfile ? undefined : displayUser?.id,
  );

  // 編集後に強制的に再レンダリングするためのステート
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  // アバター画像アップロード処理
  const handleAvatarUpload = (): void => {
    if (uploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // ファイルバリデーション
    const validation = presignedUploadService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'ファイル検証エラー');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // 画像をアップロード（アバター画像として指定）
      const uploadedImage = await presignedUploadService.uploadImage(file, {
        imageType: 'avatar',
      });

      // プロフィールを更新
      await updateProfileMutation.mutateAsync({
        avatar_url: uploadedImage.url,
      });

      // キャッシュを無視して再取得
      void refetchUser();
      forceUpdate();
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError(
        error instanceof Error
          ? error.message
          : 'アバター画像のアップロードに失敗しました',
      );
    } finally {
      setUploading(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 自分のプロフィールで認証されていない場合はログインページへリダイレクト
  useEffect(() => {
    if (isOwnProfile && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isOwnProfile, isAuthenticated, navigate]);

  // 日付のフォーマット
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return '不明';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // メンバーになってからの日数を計算
  const getDaysSinceJoined = (joinDate: string | undefined): number => {
    if (!joinDate) {
      return 0;
    }
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
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // エラー状態
  if (userError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                エラーが発生しました
              </h3>
              <p className="mt-1 text-red-700">
                {userError.message || 'プロフィール情報の取得に失敗しました'}
              </p>
              <button
                onClick={() => void refetchUser()}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
      <div className="mx-auto max-w-4xl">
        {/* ヘッダーセクション */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {/* アバター */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white md:h-32 md:w-32">
                {displayUser?.avatar_url ? (
                  <img
                    src={displayUser.avatar_url}
                    alt="アバター"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold md:text-4xl">
                    {displayUser?.username?.[0]?.toUpperCase() ||
                      displayUser?.email?.[0]?.toUpperCase() ||
                      'U'}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  title="アバターを変更"
                >
                  {uploading ? (
                    <Loader className="h-4 w-4 animate-spin text-gray-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
              {/* アップロード中のオーバーレイ */}
              {uploading && isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                  <Loader className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* ユーザー情報 */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {displayUser?.display_name ||
                      displayUser?.username ||
                      'ユーザー'}
                  </h1>
                  <p className="mt-1 text-gray-600">
                    @{displayUser?.username || 'username'}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    編集
                  </button>
                )}
              </div>

              {/* 詳細情報 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>登録日: {formatDate(displayUser?.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    メンバー歴: {getDaysSinceJoined(displayUser?.created_at)}日
                  </span>
                </div>
              </div>

              {/* 自己紹介 */}
              {displayUser?.bio && (
                <div className="mt-4">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {displayUser.bio}
                  </p>
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
                      className="flex items-center gap-1 text-gray-600 transition-colors hover:text-blue-400"
                      title={`X: @${displayUser.twitter}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      className="flex items-center gap-1 text-gray-600 transition-colors hover:text-pink-500"
                      title={`Instagram: @${displayUser.instagram}`}
                    >
                      <Instagram className="h-4 w-4" />
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
          <h2 className="mb-4 text-xl font-semibold text-gray-900">取引統計</h2>
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
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              クイックアクション
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => navigate('/trade-posts/my')}
                className="flex items-center justify-center gap-2 rounded-md bg-blue-50 px-4 py-3 text-blue-700 transition-colors hover:bg-blue-100"
              >
                <Package className="h-5 w-5" />
                自分の出品を管理
              </button>
              <button
                onClick={() => navigate('/trade-posts/create')}
                className="flex items-center justify-center gap-2 rounded-md bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100"
              >
                <Edit3 className="h-5 w-5" />
                新規出品
              </button>
              <button
                onClick={() => navigate('/trade')}
                className="flex items-center justify-center gap-2 rounded-md bg-purple-50 px-4 py-3 text-purple-700 transition-colors hover:bg-purple-100"
              >
                <Calendar className="h-5 w-5" />
                取引管理
              </button>
            </div>
          </div>
        )}

        {/* 設定セクション（自分の場合のみ表示） */}
        {isOwnProfile && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">設定</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div>
                  <p className="font-medium text-gray-900">メール通知</p>
                  <p className="text-sm text-gray-600">
                    新しいメッセージや取引の通知を受け取る
                  </p>
                </div>
                <label
                  className="relative inline-flex cursor-pointer items-center"
                  aria-label="メール通知を有効にする"
                >
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
                </label>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div>
                  <p className="font-medium text-gray-900">プロフィール公開</p>
                  <p className="text-sm text-gray-600">
                    他のユーザーにプロフィールを表示する
                  </p>
                </div>
                <label
                  className="relative inline-flex cursor-pointer items-center"
                  aria-label="プロフィールを公開する"
                >
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
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
          onSuccess={() => {
            // 強制的にコンポーネントを再レンダリング
            forceUpdate();
            // キャッシュを無視して再取得
            void refetchUser();
          }}
        />
      )}

      {/* ファイル入力（非表示） */}
      {isOwnProfile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => void handleFileChange(e)}
          className="hidden"
        />
      )}

      {/* アップロードエラー表示 */}
      {uploadError && isOwnProfile && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">アップロードエラー</h3>
              <p className="mt-1 text-sm text-red-700">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
