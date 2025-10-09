/**
 * イベント取引マッチング検索モーダル
 * 条件入力 → マッチング検索 → チャット開始の3ステップ
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, Search, MessageCircle, Loader } from 'lucide-react';
import { eventTradeService, TradeItem } from '../../services/eventTradeService';

interface EventMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

interface MatchResult {
  post_id: string;
  event_trade_id: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  give_items: TradeItem[];
  want_items: TradeItem[];
  zone_code?: string;
  created_at: string;
}

type Step = 1 | 2 | 3;

const EventMatchingModal: React.FC<EventMatchingModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
}) => {
  const navigate = useNavigate();
  
  // ステップ管理
  const [step, setStep] = useState<Step>(1);
  
  // Step 1: 条件入力
  const [giveItems, setGiveItems] = useState<TradeItem[]>([
    { character_name: '', quantity: 1 },
  ]);
  const [wantItems, setWantItems] = useState<TradeItem[]>([
    { character_name: '', quantity: 1 },
  ]);
  
  // Step 2: マッチング結果
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 3: チャット開始処理
  const [startingChat, setStartingChat] = useState<string | null>(null);

  // モーダルが閉じられた時にリセット
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setGiveItems([{ character_name: '', quantity: 1 }]);
        setWantItems([{ character_name: '', quantity: 1 }]);
        setMatches([]);
        setTotalCount(0);
        setHasMore(false);
        setError(null);
        setStartingChat(null);
      }, 300);
    }
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !startingChat) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, startingChat]);

  // ボディのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // アイテム追加
  const addGiveItem = () => {
    setGiveItems([...giveItems, { character_name: '', quantity: 1 }]);
  };

  const addWantItem = () => {
    setWantItems([...wantItems, { character_name: '', quantity: 1 }]);
  };

  // アイテム削除
  const removeGiveItem = (index: number) => {
    if (giveItems.length > 1) {
      setGiveItems(giveItems.filter((_, i) => i !== index));
    }
  };

  const removeWantItem = (index: number) => {
    if (wantItems.length > 1) {
      setWantItems(wantItems.filter((_, i) => i !== index));
    }
  };

  // アイテム更新
  const updateGiveItem = (index: number, field: keyof TradeItem, value: string | number) => {
    const updated = [...giveItems];
    if (field === 'character_name') {
      updated[index].character_name = value as string;
    } else {
      updated[index].quantity = Math.max(1, Number(value));
    }
    setGiveItems(updated);
  };

  const updateWantItem = (index: number, field: keyof TradeItem, value: string | number) => {
    const updated = [...wantItems];
    if (field === 'character_name') {
      updated[index].character_name = value as string;
    } else {
      updated[index].quantity = Math.max(1, Number(value));
    }
    setWantItems(updated);
  };

  // バリデーション
  const validateStep1 = (): boolean => {
    const hasValidGive = giveItems.some(item => item.character_name.trim());
    const hasValidWant = wantItems.some(item => item.character_name.trim());
    return hasValidGive && hasValidWant;
  };

  // マッチング検索
  const handleSearch = async () => {
    if (!validateStep1()) {
      setError('譲るアイテムと求めるアイテムを最低1つずつ入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validGiveItems = giveItems.filter(item => item.character_name.trim());
      const validWantItems = wantItems.filter(item => item.character_name.trim());

      const result = await eventTradeService.matchEventTrades(
        eventId,
        validGiveItems,
        validWantItems,
        0,
        10
      );

      setMatches(result.matches);
      setTotalCount(result.total_count);
      setHasMore(result.has_more);
      setStep(2);
    } catch (err) {
      console.error('マッチング検索エラー:', err);
      setError('マッチング検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // チャット開始
  const handleStartChat = async (match: MatchResult) => {
    setStartingChat(match.post_id);
    setError(null);

    try {
      const validGiveItems = giveItems.filter(item => item.character_name.trim());
      const validWantItems = wantItems.filter(item => item.character_name.trim());

      const result = await eventTradeService.startChat(
        eventId,
        match.post_id,
        validGiveItems,
        validWantItems,
        undefined,
        undefined
      );

      // チャット画面へ遷移
      navigate(`/trades/${result.trade_request_id}`);
      onClose();
    } catch (err) {
      console.error('チャット開始エラー:', err);
      setError('チャット開始に失敗しました');
      setStartingChat(null);
    }
  };

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !startingChat) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* モーダル本体 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                ⚡ マッチング検索
              </h2>
              <p className="text-sm text-gray-600 mt-1">{eventName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={!!startingChat}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gray-50">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="text-sm font-medium">条件入力</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="text-sm font-medium">マッチング結果</span>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: 条件入力 */}
            {step === 1 && (
              <div className="space-y-6">
                {/* 譲るアイテム */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    譲るアイテム
                  </label>
                  <div className="space-y-2">
                    {giveItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.character_name}
                          onChange={(e) => updateGiveItem(index, 'character_name', e.target.value)}
                          placeholder="キャラクター名"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateGiveItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeGiveItem(index)}
                          disabled={giveItems.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addGiveItem}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    アイテムを追加
                  </button>
                </div>

                {/* 求めるアイテム */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    求めるアイテム
                  </label>
                  <div className="space-y-2">
                    {wantItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.character_name}
                          onChange={(e) => updateWantItem(index, 'character_name', e.target.value)}
                          placeholder="キャラクター名"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateWantItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeWantItem(index)}
                          disabled={wantItems.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addWantItem}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    アイテムを追加
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: マッチング結果 */}
            {step === 2 && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader className="inline-block animate-spin h-8 w-8 text-blue-600" />
                    <p className="mt-2 text-gray-600">検索中...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">
                      マッチする投稿が見つかりませんでした
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      条件を変更
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      {totalCount}件のマッチが見つかりました
                      {hasMore && '（上位10件を表示）'}
                    </div>
                    {matches.map((match) => (
                      <div
                        key={match.post_id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        {/* ユーザー情報 */}
                        <div className="flex items-center gap-3 mb-3">
                          {match.user.avatar_url ? (
                            <img
                              src={match.user.avatar_url}
                              alt={match.user.display_name || match.user.username}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {(match.user.display_name || match.user.username)[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {match.user.display_name || match.user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(match.created_at).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          {match.zone_code && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              📍 {match.zone_code}
                            </span>
                          )}
                        </div>

                        {/* 取引内容 */}
                        <div className="space-y-2 mb-3">
                          <div>
                            <span className="text-xs text-gray-500">相手が譲るもの：</span>
                            <div className="text-sm font-medium text-gray-900">
                              {match.give_items.map((item, i) => (
                                <span key={i}>
                                  {i > 0 && ', '}
                                  {item.character_name} ×{item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">相手が求めるもの：</span>
                            <div className="text-sm font-medium text-blue-600">
                              {match.want_items.map((item, i) => (
                                <span key={i}>
                                  {i > 0 && ', '}
                                  {item.character_name} ×{item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* チャット開始ボタン */}
                        <button
                          onClick={() => handleStartChat(match)}
                          disabled={!!startingChat}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {startingChat === match.post_id ? (
                            <>
                              <Loader className="animate-spin" size={16} />
                              チャット開始中...
                            </>
                          ) : (
                            <>
                              <MessageCircle size={16} />
                              チャットを開始
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex justify-between border-t border-gray-200 px-6 py-4">
            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading || !validateStep1()}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      検索中...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      マッチング検索
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  disabled={!!startingChat}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  条件を変更
                </button>
                <button
                  onClick={onClose}
                  disabled={!!startingChat}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EventMatchingModal;
