/**
 * 交換投稿編集ページ（Pre-signed URL方式）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CategorySelect, {
  CategorySelection,
} from '../components/CategorySelect';
import { AdvancedImageUploader } from '../components/upload/AdvancedImageUploader';
import { contentService } from '../services/contentService';
import { UploadedImage } from '../services/presignedUploadService';
import { TradePostImage, SimpleTradePost } from '../services/tradePostService';
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
    status: 'active' as 'active' | 'trading' | 'completed' | 'private',
  });

  // カテゴリ選択の状態
  const [categorySelection, setCategorySelection] = useState<CategorySelection>(
    {},
  );
  const [loadingCategory, setLoadingCategory] = useState(false);

  // アップロード済み画像の状態管理（Pre-signed URL方式）
  const [giveItemImages, setGiveItemImages] = useState<UploadedImage[]>([]);
  const [wantItemImages, setWantItemImages] = useState<UploadedImage[]>([]);

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
      } catch {
        // エラーの場合は一覧画面にリダイレクト
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

    // 既存画像をUploadedImage形式に変換
    if (currentPost.give_item_images) {
      const convertedImages: UploadedImage[] = currentPost.give_item_images.map(
        (img: TradePostImage) => ({
          url: img.url,
          path: img.path || '',
          size: img.size || 0,
          type: img.type || 'image/jpeg',
          order: img.order || 0,
          is_main: img.is_main || false,
        }),
      );
      setGiveItemImages(convertedImages);
    }

    if (currentPost.want_item_images) {
      const convertedImages: UploadedImage[] = currentPost.want_item_images.map(
        (img: TradePostImage) => ({
          url: img.url,
          path: img.path || '',
          size: img.size || 0,
          type: img.type || 'image/jpeg',
          order: img.order || 0,
          is_main: img.is_main || false,
        }),
      );
      setWantItemImages(convertedImages);
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
        } catch {
          // カテゴリ情報が取得できなくても続行
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

  // UploadedImageをTradePostImageに変換
  const convertToTradePostImage = (
    images: UploadedImage[],
  ): TradePostImage[] => {
    return images.map((img) => ({
      url: img.url,
      path: img.path,
      size: img.size,
      type: img.type,
      order: img.order || 0,
      is_main: img.is_main || false,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate() || !id) {
      return;
    }

    try {
      // 最深階層のIDをcontent_idとして設定
      const content_id =
        categorySelection.event_id ||
        categorySelection.series_id ||
        categorySelection.genre_id ||
        categorySelection.category_id ||
        undefined;

      // 更新データを作成（画像は既にアップロード済みなので、パス情報のみ送信）
      const updateData = {
        ...formData,
        content_id,
        category_hierarchy: categorySelection,
        give_item_images:
          giveItemImages.length > 0
            ? convertToTradePostImage(giveItemImages)
            : undefined,
        want_item_images:
          wantItemImages.length > 0
            ? convertToTradePostImage(wantItemImages)
            : undefined,
      };

      await updatePost(id, updateData);
      navigate(`/trade-posts/${id}`);
    } catch {
      setValidationErrors((prev) => ({
        ...prev,
        images: '更新に失敗しました。もう一度お試しください。',
      }));
    }
  };

  const isSubmitDisabled = loading || loadingCategory;

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
              <option value="private">非公開</option>
              {/* tradingやcompletedは直接選択できない */}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              ※ 取引中・完了ステータスはチャット機能から設定されます
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
          <div className="mb-6">
            <AdvancedImageUploader
              label="譲るものの画像（任意）"
              onImagesChange={setGiveItemImages}
              initialImages={giveItemImages}
              maxImages={3}
              disabled={isSubmitDisabled}
              postId={id}
            />
          </div>

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
          <div className="mb-6">
            <AdvancedImageUploader
              label="求めるものの画像（任意）"
              onImagesChange={setWantItemImages}
              initialImages={wantItemImages}
              maxImages={3}
              disabled={isSubmitDisabled}
              postId={id}
            />
          </div>

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
              {loading ? '更新中...' : '更新する'}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/trade-posts/${id}`);
              }}
              disabled={isSubmitDisabled}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradePostEditPage;
