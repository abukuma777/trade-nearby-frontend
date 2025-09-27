/**
 * 交換投稿作成ページ（画像アップロード対応版）
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CategorySelect, {
  CategorySelection,
} from '../components/CategorySelect';
import ImageUpload from '../components/ImageUpload';
import {
  tradePostService,
  ImageData,
  UploadImageData,
} from '../services/tradePostService';
import { useTradePostStore } from '../stores/tradePostStore';

const CreateTradePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { createPost, loading, error } = useTradePostStore();

  const [formData, setFormData] = useState({
    give_item: '',
    want_item: '',
    description: '',
    location_name: '',
  });

  // カテゴリ選択の状態
  const [categorySelection, setCategorySelection] = useState<CategorySelection>(
    {},
  );

  // 画像データの状態管理（Base64形式で一時保存）
  const [giveItemImages, setGiveItemImages] = useState<ImageData[]>([]);
  const [wantItemImages, setWantItemImages] = useState<ImageData[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    give_item?: string;
    want_item?: string;
    images?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    if (images.length === 0) {
      return [];
    }

    const uploadData: UploadImageData[] = images.map((img, index) => {
      // Base64データからファイル情報を抽出
      const matches = img.url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data');
      }

      const mimeType = matches[1];
      const base64Data = img.url; // そのまま送信
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
    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) {
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

      // 投稿データを作成
      const postData = {
        ...formData,
        content_id, // 最深階層のIDを明示的に設定
        category_hierarchy: categorySelection, // 階層情報も保持（将来の拡張用）
        give_item_images:
          uploadedGiveImages.length > 0 ? uploadedGiveImages : undefined,
        want_item_images:
          uploadedWantImages.length > 0 ? uploadedWantImages : undefined,
      };

      await createPost(postData);
      navigate('/trade-posts/my');
    } catch (err) {
      setValidationErrors((prev) => ({
        ...prev,
        images: '画像のアップロードに失敗しました。もう一度お試しください。',
      }));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const isSubmitDisabled = loading || isUploadingImages;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            交換投稿を作成
          </h1>
          <p className="text-gray-600">
            交換したいアイテムを「譲)〇〇 求)〇〇」形式で投稿しましょう
          </p>
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
          {/* カテゴリ選択 */}
          <div className="mb-6">
            <CategorySelect
              onSelectionChange={setCategorySelection}
              initialSelection={categorySelection}
              required={false}
              disabled={isSubmitDisabled}
            />
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
                  ? '投稿中...'
                  : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/trade-posts');
              }}
              disabled={isSubmitDisabled}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </form>

        {/* プレビュー */}
        {(formData.give_item || formData.want_item) && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-medium text-gray-700">
              プレビュー
            </h2>
            <div className="rounded-lg bg-white p-6 shadow">
              {/* 譲アイテム */}
              <div className="mb-4">
                <div className="mb-2 flex items-center">
                  <span className="w-12 text-sm font-medium text-gray-500">
                    譲)
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formData.give_item || '（未入力）'}
                  </span>
                </div>
                {/* 譲アイテム画像プレビュー */}
                {giveItemImages.length > 0 && (
                  <div className="ml-12 flex gap-2">
                    {giveItemImages
                      .filter((img) => img.is_main)
                      .map((img) => (
                        <img
                          key={img.url}
                          src={img.url}
                          alt="譲るもの"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ))}
                    {giveItemImages.filter((img) => img.is_main).length ===
                      0 && (
                      <img
                        src={giveItemImages[0].url}
                        alt="譲るもの"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* 求アイテム */}
              <div className="mb-4">
                <div className="mb-2 flex items-center">
                  <span className="w-12 text-sm font-medium text-gray-500">
                    求)
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formData.want_item || '（未入力）'}
                  </span>
                </div>
                {/* 求アイテム画像プレビュー */}
                {wantItemImages.length > 0 && (
                  <div className="ml-12 flex gap-2">
                    {wantItemImages
                      .filter((img) => img.is_main)
                      .map((img) => (
                        <img
                          key={img.url}
                          src={img.url}
                          alt="求めるもの"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ))}
                    {wantItemImages.filter((img) => img.is_main).length ===
                      0 && (
                      <img
                        src={wantItemImages[0].url}
                        alt="求めるもの"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {formData.description && (
                <p className="mb-4 text-sm text-gray-600">
                  {formData.description}
                </p>
              )}
              {formData.location_name && (
                <p className="text-sm text-gray-500">
                  📍 {formData.location_name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTradePostPage;
