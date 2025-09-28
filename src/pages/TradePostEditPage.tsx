/**
 * 交換投稿編集ページ
 * 既存投稿の内容を編集
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CategorySelect, {
  CategorySelection,
} from '../components/CategorySelect';
import ImageUpload from '../components/ImageUpload';
import { contentService } from '../services/contentService';
import {
  tradePostService,
  ImageData,
  UploadImageData,
  SimpleTradePost,
} from '../services/tradePostService';
import { useAuthStore } from '../stores/authStore';
import { useTradePostStore } from '../stores/tradePostStore';

const TradePostEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentPost, loading, error, fetchPost, updatePost } =
    useTradePostStore();

  const [formData, setFormData] = useState({
    give_item: '',
    want_item: '',
    description: '',
    location_name: '',
    status: 'active' as 'active' | 'trading' | 'completed' | 'cancelled',
  });

  // カテゴリ選択の状態
  const [categorySelection, setCategorySelection] = useState<CategorySelection>(
    {},
  );
  const [loadingCategory, setLoadingCategory] = useState(false);

  // 画像データの状態管理
  const [giveItemImages, setGiveItemImages] = useState<ImageData[]>([]);
  const [wantItemImages, setWantItemImages] = useState<ImageData[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    give_item?: string;
    want_item?: string;
    images?: string;
    permission?: string;
  }>({});

  // 初期データの取得
  useEffect(() => {
    const loadPost = async (): Promise<void> => {
      if (!id) {
        navigate('/trade-posts');
        return;
      }

      try {
        await fetchPost(id);
      } catch (err) {
        console.error('投稿の取得に失敗しました:', err);
        navigate('/trade-posts');
      }
    };

    void loadPost();
  }, [id, fetchPost, navigate]);

  // 投稿データの反映
  useEffect(() => {
    if (!currentPost) {
      return;
    }

    // 権限チェック
    if (currentPost.user_id !== user?.id) {
      setValidationErrors({
        permission: 'この投稿を編集する権限がありません',
      });
      setTimeout(() => navigate(`/trade-posts/${id}`), 2000);
      return;
    }

    // 完了済み・取引中チェック
    if (
      currentPost.status === 'completed' ||
      currentPost.status === 'trading'
    ) {
      const message =
        currentPost.status === 'completed'
          ? '完了済みの投稿は編集できません'
          : '取引中の投稿は編集できません';
      setValidationErrors({
        permission: message,
      });
      setTimeout(() => navigate(`/trade-posts/${id}`), 2000);
      return;
    }

    // フォームデータの設定
    setFormData({
      give_item: currentPost.give_item,
      want_item: currentPost.want_item,
      description: currentPost.description || '',
      location_name: currentPost.location_name || '',
      status: currentPost.status,
    });

    // 既存画像の設定
    if (currentPost.give_item_images) {
      setGiveItemImages(currentPost.give_item_images);
    }
    if (currentPost.want_item_images) {
      setWantItemImages(currentPost.want_item_images);
    }

    // カテゴリ情報の取得
    const loadCategory = async (): Promise<void> => {
      const postWithHierarchy = currentPost as SimpleTradePost & {
        content_id?: string;
        content_hierarchy?: Array<{ id: string; name: string }>;
      };

      if (postWithHierarchy.content_id) {
        setLoadingCategory(true);
        try {
          const selection = await contentService.getSelectionFromContentId(
            postWithHierarchy.content_id,
          );
          setCategorySelection(selection);
        } catch (err) {
          console.error('カテゴリ情報の取得に失敗しました:', err);
        } finally {
          setLoadingCategory(false);
        }
      }
    };

    void loadCategory();
  }, [currentPost, user, id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // バリデーションエラーをクリア
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.give_item.trim()) {
      errors.give_item = '譲るものを入力してください';
    }

    if (!formData.want_item.trim()) {
      errors.want_item = '求めるものを入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Base64画像をサーバーにアップロード
  const uploadImagesToServer = async (
    images: ImageData[],
  ): Promise<ImageData[]> => {
    // 既にURLの画像はそのまま返す
    const existingImages = images.filter((img) => !img.url.startsWith('data:'));
    const newImages = images.filter((img) => img.url.startsWith('data:'));

    if (newImages.length === 0) {
      return existingImages;
    }

    const uploadData: UploadImageData[] = newImages.map((img, index) => {
      const matches = img.url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data');
      }

      const mimeType = matches[1];
      const base64Data = img.url;
      const extension = mimeType.split('/')[1];
      const fileName = `image-${Date.now()}-${index}.${extension}`;

      return {
        base64Data,
        fileName,
        mimeType,
        order: img.order,
        is_main: img.is_main,
      };
    });

    const uploadedImages = await tradePostService.uploadImages(uploadData);
    return [...existingImages, ...uploadedImages];
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate() || !id) {
      return;
    }

    setIsUploadingImages(true);

    try {
      // 画像をサーバーにアップロード
      let uploadedGiveImages: ImageData[] = [];
      let uploadedWantImages: ImageData[] = [];

      if (giveItemImages.length > 0) {
        uploadedGiveImages = await uploadImagesToServer(giveItemImages);
      }

      if (wantItemImages.length > 0) {
        uploadedWantImages = await uploadImagesToServer(wantItemImages);
      }

      // 最深階層のIDをcontent_idとして設定
      const content_id =
        categorySelection.event_id ||
        categorySelection.series_id ||
        categorySelection.genre_id ||
        categorySelection.category_id ||
        undefined;

      // 更新データを作成
      const updateData = {
        ...formData,
        content_id,
        category_hierarchy: categorySelection,
        give_item_images:
          uploadedGiveImages.length > 0 ? uploadedGiveImages : undefined,
        want_item_images:
          uploadedWantImages.length > 0 ? uploadedWantImages : undefined,
      };

      await updatePost(id, updateData);
      navigate(`/trade-posts/${id}`);
    } catch (err) {
      setValidationErrors((prev) => ({
        ...prev,
        images: '更新に失敗しました。もう一度お試しください。',
      }));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const isSubmitDisabled = loading || isUploadingImages || loadingCategory;

  // ローディング中
  if (loading && !currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (validationErrors.permission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {validationErrors.permission}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">投稿を編集</h1>
          <p className="text-gray-600">交換条件や詳細情報を更新できます</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}
        {validationErrors.images && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {validationErrors.images}
          </div>
        )}

        {/* フォーム */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="rounded-lg bg-white p-6 shadow"
        >
          {/* ステータス変更 */}
          <div className="mb-6">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ステータス
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitDisabled}
            >
              <option value="active">募集中</option>
              <option value="cancelled">キャンセル</option>
              {/* tradingやcompletedは直接選択できない */}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              ※ 完了ステータスは交換成立時に自動設定されます
            </p>
          </div>

          {/* カテゴリ選択 */}
          <div className="mb-6">
            {loadingCategory ? (
              <div className="text-gray-500">カテゴリ情報を読み込み中...</div>
            ) : (
              <CategorySelect
                onSelectionChange={setCategorySelection}
                initialSelection={categorySelection}
                required={false}
                disabled={isSubmitDisabled}
              />
            )}
          </div>

          {/* 譲るもの */}
          <div className="mb-6">
            <label
              htmlFor="give_item"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              譲るもの <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="give_item"
              name="give_item"
              value={formData.give_item}
              onChange={handleChange}
              placeholder="例: エマのアクリルスタンド"
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.give_item
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitDisabled}
            />
            {validationErrors.give_item && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.give_item}
              </p>
            )}
          </div>

          {/* 譲るものの画像 */}
          <ImageUpload
            label="譲るものの画像（任意）"
            images={giveItemImages}
            onImagesChange={setGiveItemImages}
            maxImages={3}
            disabled={isSubmitDisabled}
          />

          {/* 求めるもの */}
          <div className="mb-6">
            <label
              htmlFor="want_item"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              求めるもの <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="want_item"
              name="want_item"
              value={formData.want_item}
              onChange={handleChange}
              placeholder="例: 栞子のアクリルスタンド"
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.want_item
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitDisabled}
            />
            {validationErrors.want_item && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.want_item}
              </p>
            )}
          </div>

          {/* 求めるものの画像 */}
          <ImageUpload
            label="求めるものの画像（任意）"
            images={wantItemImages}
            onImagesChange={setWantItemImages}
            maxImages={3}
            disabled={isSubmitDisabled}
          />

          {/* 詳細説明 */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              詳細説明（任意）
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="状態や希望条件など、詳細を記載してください"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitDisabled}
            />
          </div>

          {/* 場所 */}
          <div className="mb-8">
            <label
              htmlFor="location_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              取引希望場所（任意）
            </label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              placeholder="例: 東京駅周辺"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitDisabled}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingImages
                ? '画像アップロード中...'
                : loading
                  ? '更新中...'
                  : '更新する'}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/trade-posts/${id}`);
              }}
              disabled={isSubmitDisabled}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradePostEditPage;
