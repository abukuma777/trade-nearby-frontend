/**
 * アイテム新規作成ページ
 */

import { AlertCircle, MapPin, Tag, Package, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImageUploader } from '@/components/upload';
import { itemService } from '@/services/itemService';
import { UploadedImage } from '@/services/uploadService';
import { useAuthStore } from '@/stores/authStore';
import {
  CreateItemInput,
  ItemCategory,
  ItemCondition,
  categoryLabels,
  conditionLabels,
} from '@/types/item';

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // フォームステート
  const [formData, setFormData] = useState<CreateItemInput>({
    title: '',
    description: '',
    category: 'other' as ItemCategory,
    condition: 'good' as ItemCondition,
    images: [],
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 位置情報
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // 認証チェック
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // フォームバリデーション
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'タイトルは必須です';
    } else if (formData.title.length > 100) {
      errors.title = 'タイトルは100文字以内で入力してください';
    }

    if (!formData.description.trim()) {
      errors.description = '説明は必須です';
    } else if (formData.description.length > 1000) {
      errors.description = '説明は1000文字以内で入力してください';
    }

    // 画像はオプションに変更（テスト用）
    // if (uploadedImages.length === 0) {
    //   errors.images = '最低1枚の画像をアップロードしてください';
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 画像変更ハンドラー
  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
    setFormData((prev) => ({
      ...prev,
      images: images.map((img) => img.url),
    }));

    // 画像エラーをクリア
    if (images.length > 0 && validationErrors.images) {
      setValidationErrors((prev) => {
        const { images, ...rest } = prev;
        return rest;
      });
    }
  };

  // フォーム入力ハンドラー
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 該当フィールドのエラーをクリア
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // タグ追加
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag],
      }));
      setTagInput('');
    }
  };

  // タグ削除
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  // 位置情報取得
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('お使いのブラウザは位置情報をサポートしていません');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setUseLocation(true);
        setFormData((prev) => ({ ...prev, location: { latitude, longitude } }));
      },
      (error) => {
        console.error('位置情報の取得に失敗しました:', error);
        setError('位置情報の取得に失敗しました');
      },
    );
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // テスト用: 画像がない場合はダミーURLを設定
      const submitData = {
        ...formData,
        images:
          formData.images && formData.images.length > 0
            ? formData.images
            : ['https://via.placeholder.com/300'],
      };

      // バックエンド用にlocationフィールドをlat/lngに変換
      if (submitData.location) {
        const { latitude, longitude } = submitData.location;
        (submitData as any).location = { lat: latitude, lng: longitude };
      }

      // アイテム作成API呼び出し
      const createdItem = await itemService.createItem(submitData);

      // 成功したらアイテム詳細ページへ遷移
      navigate(`/items/${createdItem.id}`, {
        state: { message: 'アイテムを作成しました' },
      });
    } catch (error: any) {
      console.error('アイテム作成エラー:', error);
      setError(
        error.response?.data?.message || 'アイテムの作成に失敗しました。もう一度お試しください。',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">アイテムを出品する</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 画像アップロード */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              商品画像
            </h2>

            <ImageUploader
              maxImages={5}
              uploadType="item"
              onImagesChange={handleImagesChange}
              disabled={isSubmitting}
            />

            {validationErrors.images && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.images}</p>
            )}
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              基本情報
            </h2>

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={100}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${validationErrors.title ? 'border-red-500' : 'border-gray-300'}
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
                placeholder="例: ワンピース全巻セット"
              />
              <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100文字</p>
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                説明 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={1000}
                rows={5}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${validationErrors.description ? 'border-red-500' : 'border-gray-300'}
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
                placeholder="商品の状態、交換希望条件などを詳しく記載してください"
              />
              <p className="mt-1 text-xs text-gray-500">{formData.description.length}/1000文字</p>
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* カテゴリー */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリー *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* コンディション */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                商品の状態 *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
              >
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* タグ */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              タグ
            </h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={isSubmitting}
                className={`
                  flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
                placeholder="タグを入力してEnterキー"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || !tagInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                      className="ml-2 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 位置情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              位置情報（任意）
            </h2>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={(e) => setUseLocation(e.target.checked)}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">位置情報を使用する</span>
              </label>

              {useLocation && !location && (
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isSubmitting}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  現在地を取得
                </button>
              )}
            </div>

            {location && <p className="mt-2 text-sm text-green-600">✓ 位置情報を取得しました</p>}
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '出品中...' : '出品する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItemPage;
