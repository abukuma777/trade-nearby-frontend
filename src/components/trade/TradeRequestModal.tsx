/**
 * 交換リクエストモーダルコンポーネント
 * アイテムの交換リクエストを作成するためのモーダル
 */

import { X, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { itemService } from '@/services/itemService';
import { useAuthStore } from '@/stores/authStore';
import { useTradeStore } from '@/stores/tradeStore';
import { Item } from '@/types/item';

interface TradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item; // 交換希望先のアイテム
}

const TradeRequestModal: React.FC<TradeRequestModalProps> = ({ isOpen, onClose, targetItem }) => {
  const { user } = useAuthStore();
  const { createRequest, isLoading, error, clearMessages } = useTradeStore();

  // フォーム状態
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [message, setMessage] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [meetingDate, setMeetingDate] = useState('');

  // 自分のアイテムを取得
  useEffect(() => {
    if (isOpen && user) {
      loadMyItems();
    }
    return () => {
      clearMessages();
    };
  }, [isOpen, user]);

  const loadMyItems = async () => {
    try {
      setLoadingItems(true);
      const response = await itemService.getItems({
        user_id: user?.id,
        status: 'active',
      });
      setMyItems(response.items);
    } catch (error) {
      console.error('アイテム取得エラー:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  // アイテム選択の切り替え
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert('交換するアイテムを選択してください');
      return;
    }

    try {
      await createRequest({
        to_user_id: targetItem.user_id,
        offer_post_ids: selectedItems,
        request_post_ids: [targetItem.id],
        message,
        meeting_place: meetingPlace || undefined,
        meeting_date: meetingDate || undefined,
      });

      // 成功したら閉じる
      onClose();
      // リセット
      setSelectedItems([]);
      setMessage('');
      setMeetingPlace('');
      setMeetingDate('');
    } catch (error) {
      console.error('交換リクエスト作成エラー:', error);
    }
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">交換リクエストを送る</h2>
            <p className="text-gray-600">
              「{targetItem.title}」と交換したいアイテムを選んでください
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>

        {/* ボディ */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* エラー表示 */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* 自分のアイテム選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                提供するアイテム（複数選択可）
              </label>

              {loadingItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-2 text-gray-500">読み込み中...</p>
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">交換可能なアイテムがありません</p>
                  <p className="text-sm text-gray-400 mt-1">
                    アイテムを出品してから交換リクエストを送ってください
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedItems.includes(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* チェックボックス */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedItems.includes(item.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedItems.includes(item.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* アイテム画像 */}
                        {item.images?.[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}

                        {/* アイテム情報 */}
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.category} / {item.condition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* メッセージ */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ（任意）
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="交換に関する詳細やご希望をお書きください..."
              />
            </div>

            {/* 待ち合わせ情報 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="meetingPlace"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  希望の待ち合わせ場所（任意）
                </label>
                <input
                  type="text"
                  id="meetingPlace"
                  value={meetingPlace}
                  onChange={(e) => setMeetingPlace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: ○○駅前"
                />
              </div>

              <div>
                <label
                  htmlFor="meetingDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  希望の日時（任意）
                </label>
                <input
                  type="datetime-local"
                  id="meetingDate"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading || selectedItems.length === 0}
          >
            {isLoading ? '送信中...' : 'リクエストを送る'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeRequestModal;
