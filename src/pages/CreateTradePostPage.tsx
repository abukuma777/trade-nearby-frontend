/**
 * 交換投稿作成ページ（画像アップロード対応版）
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradePostStore } from '../stores/tradePostStore';
import { tradePostService, ImageData, UploadImageData } from '../services/tradePostService';
import ImageUpload from '../components/ImageUpload';

const CreateTradePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { createPost, loading, error } = useTradePostStore();

  const [formData, setFormData] = useState({
    give_item: '',
    want_item: '',
    description: '',
    location_name: '',
  });

  // 画像データの状態管理（Base64形式で一時保存）
  const [giveItemImages, setGiveItemImages] = useState<ImageData[]>([]);
  const [wantItemImages, setWantItemImages] = useState<ImageData[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    give_item?: string;
    want_item?: string;
    images?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  const uploadImagesToServer = async (images: ImageData[]): Promise<ImageData[]> => {
    if (images.length === 0) return [];

    const uploadData: UploadImageData[] = images.map((img, index) => {
      // Base64データからファイル情報を抽出
      const matches = img.url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid image data format');
        throw new Error('Invalid image data');
      }

      const mimeType = matches[1];
      const base64Data = img.url; // そのまま送信
      const extension = mimeType.split('/')[1];
      const fileName = `image-${Date.now()}-${index}.${extension}`;

      console.log('Preparing upload:', { fileName, mimeType, order: img.order });

      return {
        base64Data,
        fileName,
        mimeType,
        order: img.order,
        is_main: img.is_main,
      };
    });

    try {
      console.log('Calling uploadImages API with', uploadData.length, 'images');
      const uploadedImages = await tradePostService.uploadImages(uploadData);
      console.log('Upload API response:', uploadedImages);
      return uploadedImages;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsUploadingImages(true);

    try {
      // 画像をサーバーにアップロード
      let uploadedGiveImages: ImageData[] = [];
      let uploadedWantImages: ImageData[] = [];

      console.log('=== Frontend Upload Start ===');
      console.log('Give images to upload:', giveItemImages.length);
      console.log('Want images to upload:', wantItemImages.length);

      if (giveItemImages.length > 0) {
        console.log('Uploading give images...');
        uploadedGiveImages = await uploadImagesToServer(giveItemImages);
        console.log('Give images uploaded:', uploadedGiveImages);
      }

      if (wantItemImages.length > 0) {
        console.log('Uploading want images...');
        uploadedWantImages = await uploadImagesToServer(wantItemImages);
        console.log('Want images uploaded:', uploadedWantImages);
      }

      // 投稿データを作成
      const postData = {
        ...formData,
        give_item_images: uploadedGiveImages.length > 0 ? uploadedGiveImages : undefined,
        want_item_images: uploadedWantImages.length > 0 ? uploadedWantImages : undefined,
      };

      console.log('Creating post with data:', postData);
      await createPost(postData);
      navigate('/trade-posts/my');
    } catch (err) {
      console.error('投稿作成エラー:', err);
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
      <div className="container mx-auto px-4 max-w-2xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">交換投稿を作成</h1>
          <p className="text-gray-600">
            交換したいアイテムを「譲)〇〇 求)〇〇」形式で投稿しましょう
          </p>
        </div>

        {/* エラー表示 */}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {validationErrors.images && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {validationErrors.images}
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* 譲るもの */}
          <div className="mb-6">
            <label htmlFor="give_item" className="block text-sm font-medium text-gray-700 mb-2">
              譲るもの <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="give_item"
              name="give_item"
              value={formData.give_item}
              onChange={handleChange}
              placeholder="例: エマのアクリルスタンド"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.give_item ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitDisabled}
            />
            {validationErrors.give_item && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.give_item}</p>
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
            <label htmlFor="want_item" className="block text-sm font-medium text-gray-700 mb-2">
              求めるもの <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="want_item"
              name="want_item"
              value={formData.want_item}
              onChange={handleChange}
              placeholder="例: 栞子のアクリルスタンド"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.want_item ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitDisabled}
            />
            {validationErrors.want_item && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.want_item}</p>
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              詳細説明（任意）
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="状態や希望条件など、詳細を記載してください"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitDisabled}
            />
          </div>

          {/* 場所 */}
          <div className="mb-8">
            <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-2">
              取引希望場所（任意）
            </label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              placeholder="例: 東京駅周辺"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitDisabled}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingImages ? '画像アップロード中...' : loading ? '投稿中...' : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trade-posts')}
              disabled={isSubmitDisabled}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </form>

        {/* プレビュー */}
        {(formData.give_item || formData.want_item) && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">プレビュー</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {/* 譲アイテム */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 w-12">譲)</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formData.give_item || '（未入力）'}
                  </span>
                </div>
                {/* 譲アイテム画像プレビュー */}
                {giveItemImages.length > 0 && (
                  <div className="flex gap-2 ml-12">
                    {giveItemImages
                      .filter((img) => img.is_main)
                      .map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt="譲るもの"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    {giveItemImages.filter((img) => img.is_main).length === 0 && (
                      <img
                        src={giveItemImages[0].url}
                        alt="譲るもの"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* 求アイテム */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 w-12">求)</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formData.want_item || '（未入力）'}
                  </span>
                </div>
                {/* 求アイテム画像プレビュー */}
                {wantItemImages.length > 0 && (
                  <div className="flex gap-2 ml-12">
                    {wantItemImages
                      .filter((img) => img.is_main)
                      .map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt="求めるもの"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    {wantItemImages.filter((img) => img.is_main).length === 0 && (
                      <img
                        src={wantItemImages[0].url}
                        alt="求めるもの"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              {formData.description && (
                <p className="text-gray-600 text-sm mb-4">{formData.description}</p>
              )}
              {formData.location_name && (
                <p className="text-sm text-gray-500">📍 {formData.location_name}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTradePostPage;
