/**
 * イベントモード画面
 * イベント限定の爆死即交換投稿作成
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventTradeStore } from '../stores/eventTradeStore';
import { TradeItem } from '../services/eventTradeService';
import EventMatchingModal from '../components/trade/EventMatchingModal';

const EventModePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    loading,
    error,
    fetchActiveEvents,
    createEventTrade,
    clearError,
  } = useEventTradeStore();

  const [formData, setFormData] = useState({
    event_id: '',
    zone_code: '',
    is_instant: false,
    description: '',
  });

  // 譲・求アイテムリスト
  const [giveItems, setGiveItems] = useState<TradeItem[]>([
    { character_name: '', quantity: 1 },
  ]);
  const [wantItems, setWantItems] = useState<TradeItem[]>([
    { character_name: '', quantity: 1 },
  ]);

  const [validationErrors, setValidationErrors] = useState<{
    event_id?: string;
    give_items?: string;
    want_items?: string;
  }>({});

  // マッチングモーダル状態
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState<boolean>(false);

  // イベント一覧取得
  useEffect(() => {
    fetchActiveEvents();
    return () => clearError();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // バリデーションエラーをクリア
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 譲アイテム変更
  const handleGiveItemChange = (index: number, field: keyof TradeItem, value: string | number) => {
    const updated = [...giveItems];
    updated[index] = { ...updated[index], [field]: value };
    setGiveItems(updated);
  };

  // 求アイテム変更
  const handleWantItemChange = (index: number, field: keyof TradeItem, value: string | number) => {
    const updated = [...wantItems];
    updated[index] = { ...updated[index], [field]: value };
    setWantItems(updated);
  };

  // 譲アイテム追加
  const addGiveItem = () => {
    setGiveItems([...giveItems, { character_name: '', quantity: 1 }]);
  };

  // 求アイテム追加
  const addWantItem = () => {
    setWantItems([...wantItems, { character_name: '', quantity: 1 }]);
  };

  // 譲アイテム削除
  const removeGiveItem = (index: number) => {
    if (giveItems.length > 1) {
      setGiveItems(giveItems.filter((_, i) => i !== index));
    }
  };

  // 求アイテム削除
  const removeWantItem = (index: number) => {
    if (wantItems.length > 1) {
      setWantItems(wantItems.filter((_, i) => i !== index));
    }
  };

  // マッチング検索を開く
  const handleOpenMatching = () => {
    if (!formData.event_id) {
      setValidationErrors({ event_id: 'マッチング検索にはイベントを選択してください' });
      return;
    }
    setIsMatchingModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.event_id) {
      errors.event_id = 'イベントを選択してください';
    }

    const validGiveItems = giveItems.filter((item) => item.character_name.trim());
    if (validGiveItems.length === 0) {
      errors.give_items = '譲るキャラクターを最低1つ入力してください';
    }

    const validWantItems = wantItems.filter((item) => item.character_name.trim());
    if (validWantItems.length === 0) {
      errors.want_items = '求めるキャラクターを最低1つ入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // 空のキャラ名を除外
      const validGiveItems = giveItems.filter((item) => item.character_name.trim());
      const validWantItems = wantItems.filter((item) => item.character_name.trim());

      const postData = {
        event_id: formData.event_id,
        zone_code: formData.zone_code || undefined,
        is_instant: formData.is_instant,
        give_items: validGiveItems,
        want_items: validWantItems,
        description: formData.description || undefined,
      };

      const postId = await createEventTrade(postData);
      // イベント専用ページへ遷移
      navigate(`/events/${formData.event_id}`);
    } catch (err) {
      console.error('イベント投稿作成エラー:', err);
    }
  };

  // 選択中のイベント情報取得
  const selectedEvent = events.find((e) => e.id === formData.event_id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🎪 イベントモード</h1>
          <p className="text-gray-600 mb-6">
            イベント会場での即交換投稿を作成します。爆死救済マッチングが利用できます。
          </p>

          {/* アクション選択 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">選択してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 投稿作成カード */}
              <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <h3 className="text-lg font-bold text-blue-600 mb-2">📝 投稿を作成</h3>
                <p className="text-sm text-gray-600 mb-4">
                  譲渡・求めるキャラクターを投稿して、他のユーザーからのリクエストを待ちます
                </p>
                <p className="text-xs text-gray-500">
                  ↓ 下のフォームから投稿できます
                </p>
              </div>

              {/* マッチング検索カード */}
              <div className="border-2 border-orange-200 rounded-lg p-4 hover:border-orange-400 transition-colors">
                <h3 className="text-lg font-bold text-orange-600 mb-2">⚡ マッチング検索</h3>
                <p className="text-sm text-gray-600 mb-4">
                  条件を入力して、マッチする投稿を検索し、すぐにチャットを開始できます
                </p>
                <button
                  onClick={handleOpenMatching}
                  disabled={!formData.event_id}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.event_id ? 'マッチング検索を開く' : 'イベントを選択してください'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📝 投稿作成フォーム</h2>

          {/* イベント選択 */}
          <div className="mb-6">
            <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-2">
              イベント <span className="text-red-500">*</span>
            </label>
            <select
              id="event_id"
              name="event_id"
              value={formData.event_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.event_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">イベントを選択してください</option>
              {events.map((event) => {
                const startDate = new Date(event.start_date).toLocaleDateString('ja-JP');
                const endDate = new Date(event.end_date).toLocaleDateString('ja-JP');
                const dateStr = startDate === endDate ? startDate : `${startDate}〜${endDate}`;
                return (
                  <option key={event.id} value={event.id}>
                    {event.name} - {dateStr} ({event.venue})
                  </option>
                );
              })}
            </select>
            {validationErrors.event_id && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.event_id}</p>
            )}
          </div>

          {/* ゾーンコード */}
          <div className="mb-6">
            <label htmlFor="zone_code" className="block text-sm font-medium text-gray-700 mb-2">
              ゾーン（任意）
            </label>
            <input
              type="text"
              id="zone_code"
              name="zone_code"
              value={formData.zone_code}
              onChange={handleChange}
              placeholder="例: G1（グッズ売り場）"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              会場内の特定エリアを指定できます（例: G1, A2, 物販列など）
            </p>
          </div>

          {/* 爆死即交換チェックボックス */}
          <div className="mb-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_instant"
                checked={formData.is_instant}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                爆死即交換（マッチング対象）
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-gray-500">
              推しキャラ設定に基づいた自動マッチングの対象にします
            </p>
          </div>

          {/* 譲るキャラクター */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              譲るキャラクター <span className="text-red-500">*</span>
            </label>
            {giveItems.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.character_name}
                  onChange={(e) => handleGiveItemChange(index, 'character_name', e.target.value)}
                  placeholder="キャラクター名"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleGiveItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeGiveItem(index)}
                  disabled={giveItems.length === 1 || loading}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGiveItem}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm disabled:opacity-50"
            >
              + キャラクター追加
            </button>
            {validationErrors.give_items && (
              <p className="mt-2 text-sm text-red-500">{validationErrors.give_items}</p>
            )}
          </div>

          {/* 求めるキャラクター */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              求めるキャラクター <span className="text-red-500">*</span>
            </label>
            {wantItems.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.character_name}
                  onChange={(e) => handleWantItemChange(index, 'character_name', e.target.value)}
                  placeholder="キャラクター名"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleWantItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeWantItem(index)}
                  disabled={wantItems.length === 1 || loading}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addWantItem}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm disabled:opacity-50"
            >
              + キャラクター追加
            </button>
            {validationErrors.want_items && (
              <p className="mt-2 text-sm text-red-500">{validationErrors.want_items}</p>
            )}
          </div>

          {/* 詳細説明 */}
          <div className="mb-8">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              詳細説明（任意）
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="取引条件や待ち合わせ場所など"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '投稿中...' : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trade-posts')}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </form>

        {/* プレビュー */}
        {giveItems.some((item) => item.character_name) && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">プレビュー</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">譲)</span>
                <span className="ml-2 text-lg font-bold text-gray-900">
                  {giveItems
                    .filter((item) => item.character_name.trim())
                    .map((item) => `${item.character_name}${item.quantity > 1 ? `×${item.quantity}` : ''}`)
                    .join('、') || '（未入力）'}
                </span>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">求)</span>
                <span className="ml-2 text-lg font-bold text-blue-600">
                  {wantItems
                    .filter((item) => item.character_name.trim())
                    .map((item) => `${item.character_name}${item.quantity > 1 ? `×${item.quantity}` : ''}`)
                    .join('、') || '（未入力）'}
                </span>
              </div>
              {formData.description && (
                <p className="text-gray-600 text-sm mb-4">{formData.description}</p>
              )}
              {formData.event_id && (
                <div className="text-sm text-gray-500">
                  📍 {events.find((e) => e.id === formData.event_id)?.name}
                  {formData.zone_code && ` - ${formData.zone_code}`}
                </div>
              )}
              {formData.is_instant && (
                <div className="mt-3">
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    ⚡ 爆死即交換
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* マッチングモーダル */}
      {selectedEvent && (
        <EventMatchingModal
          isOpen={isMatchingModalOpen}
          onClose={() => setIsMatchingModalOpen(false)}
          eventId={selectedEvent.id}
          eventName={selectedEvent.name}
        />
      )}
    </div>
  );
};

export default EventModePage;
