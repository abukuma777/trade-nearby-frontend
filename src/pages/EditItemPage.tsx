/**
 * アイテム編集ページ
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ImageUploader } from '@/components/upload';
import { UploadedImage } from '@/services/uploadService';
import { itemService } from '@/services/itemService';
import {
  Item,
  UpdateItemInput,
  ItemCategory,
  ItemCondition,
  categoryLabels,
  conditionLabels,
} from '@/types/item';
import { AlertCircle, MapPin, Tag, Package, FileText, Loader } from 'lucide-react';

const EditItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  // ステート管理
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateItemInput>({
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

  // アイテムデータの取得
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        navigate('/items');
        return;
      }

      try {
        setIsLoading(true);
        const fetchedItem = await itemService.getItem(id);

        // 所有者チェック
        if (fetchedItem.user_id !== user?.id) {
          setError('このアイテムを編集する権限がありません');
          setTimeout(() => navigate(`/items/${id}`), 2000);
          return;
        }

        // 交換済みチェック
        if (fetchedItem.status === 'traded') {
          setError('交換済みのアイテムは編集できません');
          setTimeout(() => navigate(`/items/${id}`), 2000);
          return;
        }

        setItem(fetchedItem);

        // フォームデータの初期化
        setFormData({
          title: fetchedItem.title,
          description: fetchedItem.description,
          category: fetchedItem.category,
          condition: fetchedItem.condition,
          images: fetchedItem.images || [],
          tags: fetchedItem.tags || [],
          status: fetchedItem.status,
        });

        // 既存画像の設定
        if (fetchedItem.images && fetchedItem.images.length > 0) {
          const existingImages: UploadedImage[] = fetchedItem.images.map((url, index) => ({
            url,
            path: `existing-${index}`,
            // サムネイルがあれば使用、なければ元画像を使用
            thumbnail: url,
          }));
          setUploadedImages(existingImages);
        }

        // 位置情報の設定
        if (fetchedItem.location) {
          setLocation({
            latitude: fetchedItem.location.latitude,
            longitude: fetchedItem.location.longitude,
          });
          setUseLocation(true);
        }
      } catch (error: any) {
        console.error('アイテム取得エラー:', error);
        setError('アイテムの取得に失敗しました');
        setTimeout(() => navigate('/items'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, user, navigate]);

  // 認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // フォームバリデーション
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = 'タイトルは必須です';
    } else if (formData.title && formData.title.length > 100) {
      errors.title = 'タイトルは100文字以内で入力してください';
    }

    if (!formData.description?.trim()) {
      errors.description = '説明は必須です';
    } else if (formData.description && formData.description.length > 1000) {
      errors.description = '説明は1000文字以内で入力してください';
    }

    if (uploadedImages.length === 0) {
      errors.images = '最低1枚の画像をアップロードしてください';
    }

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

    if (!validateForm() || !id) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 位置情報の設定
      const updateData = {
        ...formData,
        location: useLocation && location ? location : undefined,
      };

      // アイテム更新API呼び出し
      await itemService.updateItem(id, updateData);

      // 成功したらアイテム詳細ページへ遷移（強制リロード）
      window.location.href = `/items/${id}`;
    } catch (error: any) {
      console.error('アイテム更新エラー:', error);
      setError(
        error.response?.data?.message || 'アイテムの更新に失敗しました。もう一度お試しください。',
      );
      setIsSubmitting(false);
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // アイテムが見つからない場合
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'アイテムが見つかりませんでした'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">アイテムを編集する</h1>

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
              initialImages={uploadedImages}
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
                value={formData.title || ''}
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
              <p className="mt-1 text-xs text-gray-500">{formData.title?.length || 0}/100文字</p>
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
                value={formData.description || ''}
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
              <p className="mt-1 text-xs text-gray-500">
                {formData.description?.length || 0}/1000文字
              </p>
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

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isSubmitting ? 'bg-gray-100' : ''}
                `}
              >
                <option value="active">公開中</option>
                <option value="reserved">予約済み</option>
                <option value="private">非公開</option>
                {/* 交換済みは編集画面から設定不可 */}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                ※ 交換済みステータスは取引完了後に自動設定されます
              </p>
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
              onClick={() => navigate(`/items/${id}`)}
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
              {isSubmitting ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;
