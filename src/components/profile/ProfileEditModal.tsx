/**
 * プロフィール編集モーダルコンポーネント（シンプル版）
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Twitter, Instagram, AlertCircle } from 'lucide-react';
import { User as UserType } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useProfile';

interface ProfileEditModalProps {
  user: UserType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const updateProfileMutation = useUpdateProfile();

  // フォームの状態
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    twitter: '',
    instagram: '',
  });

  // バリデーションエラー
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ユーザー情報でフォームを初期化
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: (user as any).bio || '',
        twitter: (user as any).twitter || '',
        instagram: (user as any).instagram || '',
      });
    }
  }, [user]);

  // モーダルが閉じられた時にフォームをリセット
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // フォームのバリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 表示名のバリデーション
    if (!formData.display_name || formData.display_name.trim() === '') {
      newErrors.display_name = '表示名は必須です';
    } else if (formData.display_name.length > 50) {
      newErrors.display_name = '表示名は50文字以内で入力してください';
    }

    // 自己紹介のバリデーション
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '自己紹介は500文字以内で入力してください';
    }

    // Twitterのバリデーション
    if (formData.twitter && !/^[a-zA-Z0-9_]*$/.test(formData.twitter)) {
      newErrors.twitter = 'Twitterユーザー名は半角英数字とアンダースコアのみ使用可能です';
    }

    // Instagramのバリデーション
    if (formData.instagram && !/^[a-zA-Z0-9_.]*$/.test(formData.instagram)) {
      newErrors.instagram =
        'Instagramユーザー名は半角英数字、アンダースコア、ピリオドのみ使用可能です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォームの値を変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // 変更されたフィールドのみを送信
    const updates: Record<string, any> = {};
    Object.keys(formData).forEach((key) => {
      const value = (formData as any)[key];
      const originalValue = (user as any)?.[key] || '';
      if (value !== originalValue) {
        if (value === '') {
          updates[key] = null;
        } else {
          updates[key] = value;
        }
      }
    });

    console.log('送信する更新データ:', updates);

    try {
      const result = await updateProfileMutation.mutateAsync(updates);
      console.log('更新成功:', result);

      // モーダルを閉じる前にonSuccessを実行
      if (onSuccess) {
        console.log('onSuccessコールバックを実行');
        onSuccess();
      }

      // 少し待ってからモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 50);
    } catch (error) {
      console.error('Profile update failed:', error);
      setErrors({ submit: 'プロフィールの更新に失敗しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">プロフィール編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* エラーメッセージ */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* 表示名（必須） */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              表示名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.display_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ニックネーム"
              disabled={isSubmitting}
            />
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>

          {/* 自己紹介 */}
          <div>
            <label
              htmlFor="bio"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <FileText className="w-4 h-4" />
              自己紹介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="好きな作品やグッズについて"
              disabled={isSubmitting}
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
            <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500文字</p>
          </div>

          {/* SNSアカウント（折りたたみ可能） */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
              SNSアカウント（任意）
            </summary>
            <div className="px-4 pb-4 space-y-4">
              {/* Twitter */}
              <div>
                <label
                  htmlFor="twitter"
                  className="flex items-center gap-2 text-sm text-gray-600 mb-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter / X
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.twitter ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="username"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.twitter && <p className="mt-1 text-sm text-red-600">{errors.twitter}</p>}
              </div>

              {/* Instagram */}
              <div>
                <label
                  htmlFor="instagram"
                  className="flex items-center gap-2 text-sm text-gray-600 mb-2"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.instagram ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="username"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.instagram && (
                  <p className="mt-1 text-sm text-red-600">{errors.instagram}</p>
                )}
              </div>
            </div>
          </details>

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
