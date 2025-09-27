/**
 * 相互評価モーダルコンポーネント
 * 交換完了時に相手を評価するためのモーダル
 */

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import RatingInput from './RatingInput';

interface TradeRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  otherUserName: string;
  tradeId: string;
}

const TradeRatingModal: React.FC<TradeRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  otherUserName,
  tradeId,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('評価を選択してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setIsCompleted(true);

      // 2秒後に自動で閉じる
      setTimeout(() => {
        onClose();
        // リセット
        setRating(5);
        setComment('');
        setIsCompleted(false);
      }, 2000);
    } catch (error) {
      console.error('評価送信エラー:', error);
      alert('評価の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // 完了画面
  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h3 className="text-2xl font-bold mb-2">評価を送信しました</h3>
          <p className="text-gray-600">ご協力ありがとうございました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">取引を評価</h2>
              <p className="text-gray-600 mt-1">{otherUserName}さんとの取引はいかがでしたか？</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ボディ */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* 評価入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                評価 <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center">
                <RatingInput value={rating} onChange={setRating} size="lg" required />
              </div>
            </div>

            {/* コメント入力 */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="取引の感想や、相手への感謝のメッセージなどをお書きください..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/500文字</p>
            </div>

            {/* 評価の説明 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">評価の目安</p>
              <ul className="space-y-1">
                <li>★★★★★ とても良い取引でした</li>
                <li>★★★★☆ 良い取引でした</li>
                <li>★★★☆☆ 普通の取引でした</li>
                <li>★★☆☆☆ やや問題がありました</li>
                <li>★☆☆☆☆ 問題がありました</li>
              </ul>
            </div>
          </div>

          {/* フッター */}
          <div className="p-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              後で評価
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? '送信中...' : '評価を送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeRatingModal;
