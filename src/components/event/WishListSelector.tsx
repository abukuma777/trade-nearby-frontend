/**
 * 番号選択UIコンポーネント
 * イベント物販の番号をグリッド表示で選択
 */

import React, { useState, useEffect } from 'react';
import { wishListService } from '../../services/wishListService';
import { 
  MerchandiseType, 
  MERCHANDISE_CONFIG,
  formatItemNumber,
  formatNumberList,
  NumberSelectionItem
} from '../../types/event';

interface WishListSelectorProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const WishListSelector: React.FC<WishListSelectorProps> = ({
  eventId,
  eventName,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [merchandiseTypes, setMerchandiseTypes] = useState<MerchandiseType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [savedWishLists, setSavedWishLists] = useState<Map<string, number[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');

  // 物販種別を取得
  useEffect(() => {
    if (isOpen && eventId) {
      loadMerchandiseTypes();
      loadWishLists();
    }
  }, [isOpen, eventId]);

  const loadMerchandiseTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const types = await wishListService.getMerchandiseTypes(eventId);
      setMerchandiseTypes(types);
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0].type_name);
      }
    } catch (err) {
      console.error('物販種別取得エラー:', err);
      setError('物販情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadWishLists = async () => {
    try {
      const wishlists = await wishListService.getAllWishLists(eventId);
      setSavedWishLists(wishlists);
      
      // 現在選択中の種別の保存済み番号をセット
      if (selectedType && wishlists.has(selectedType)) {
        setSelectedNumbers(wishlists.get(selectedType) || []);
      }
    } catch (err) {
      console.error('ウィッシュリスト取得エラー:', err);
    }
  };

  // 種別を切り替えたときの処理
  useEffect(() => {
    if (selectedType && savedWishLists.has(selectedType)) {
      setSelectedNumbers(savedWishLists.get(selectedType) || []);
    } else {
      setSelectedNumbers([]);
    }
  }, [selectedType, savedWishLists]);

  const handleNumberToggle = (number: number) => {
    const config = MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG];
    const maxSelection = config?.maxSelection || 10;

    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        // 選択解除
        return prev.filter(n => n !== number);
      } else {
        // 選択（最大数チェック）
        if (prev.length >= maxSelection) {
          alert(`最大${maxSelection}個まで選択できます`);
          return prev;
        }
        return [...prev, number];
      }
    });
  };

  const handleSelectAll = () => {
    const config = MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG];
    if (!config) return;

    const allNumbers = Array.from({ length: config.totalItems }, (_, i) => i + 1);
    setSelectedNumbers(allNumbers.slice(0, config.maxSelection));
  };

  const handleClearAll = () => {
    setSelectedNumbers([]);
  };

  const handleSave = async () => {
    if (selectedNumbers.length === 0) {
      if (!confirm('番号が選択されていません。ウィッシュリストをクリアしますか？')) {
        return;
      }
    }

    setSaving(true);
    setError('');
    
    try {
      await wishListService.setWishList(eventId, selectedType, selectedNumbers);
      
      // ローカルの保存済みリストを更新
      setSavedWishLists(prev => {
        const newMap = new Map(prev);
        if (selectedNumbers.length > 0) {
          newMap.set(selectedType, selectedNumbers);
        } else {
          newMap.delete(selectedType);
        }
        return newMap;
      });

      alert('ウィッシュリストを保存しました');
      
      // 他の種別がある場合は種別選択に戻る、なければ閉じる
      const otherTypes = merchandiseTypes.filter(t => t.type_name !== selectedType);
      if (otherTypes.length > 0) {
        const nextType = otherTypes.find(t => !savedWishLists.has(t.type_name));
        if (nextType) {
          setSelectedType(nextType.type_name);
        }
      } else {
        onComplete?.();
        onClose();
      }
    } catch (err) {
      console.error('保存エラー:', err);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const renderImageModal = () => {
    if (!showImageModal || !modalImageUrl) return null;

    return (
      <div 
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-90 p-4"
        onClick={() => setShowImageModal(false)}
      >
        <div className="max-w-4xl max-h-[90vh] relative">
          <img
            src={modalImageUrl}
            alt="物販画像"
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderNumberGrid = () => {
    const config = MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG];
    if (!config) return null;

    const currentType = merchandiseTypes.find(t => t.type_name === selectedType);
    const imageUrl = currentType?.image_url;

    const items: NumberSelectionItem[] = Array.from(
      { length: config.totalItems },
      (_, i) => ({
        number: i + 1,
        selected: selectedNumbers.includes(i + 1),
        disabled: false,
      })
    );

    return (
      <div className="space-y-6">
        {/* 画像表示エリア */}
        {imageUrl && (
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => handleImageClick(imageUrl)}>
              <img
                src={imageUrl}
                alt={`${config.displayName}の参考画像`}
                className="max-w-full h-48 object-contain rounded-lg shadow-lg group-hover:opacity-95 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
                <div className="bg-white bg-opacity-90 p-2 rounded-full">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 番号グリッド */}
        <div 
          className={`grid gap-2`}
          style={{ gridTemplateColumns: `repeat(${config.gridColumns}, 1fr)` }}
        >
          {items.map(item => (
            <button
              key={item.number}
              onClick={() => handleNumberToggle(item.number)}
              className={`
                p-3 rounded-lg border-2 font-medium transition-all
                ${item.selected 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
            >
              {formatItemNumber(item.number, selectedType)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📝 ウィッシュリスト設定</h2>
              <p className="text-blue-100">{eventName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 border-b border-red-200">
            {error}
          </div>
        )}

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          ) : merchandiseTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">このイベントには物販情報がありません</p>
            </div>
          ) : (
            <>
              {/* 種別選択タブ */}
              <div className="mb-6">
                <div className="flex gap-2 border-b border-gray-200">
                  {merchandiseTypes.map(type => {
                    const config = MERCHANDISE_CONFIG[type.type_name as keyof typeof MERCHANDISE_CONFIG];
                    const savedCount = savedWishLists.get(type.type_name)?.length || 0;
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.type_name)}
                        className={`
                          px-4 py-3 font-medium transition-all relative
                          ${selectedType === type.type_name
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        {config?.displayName || type.type_name}
                        {savedCount > 0 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {savedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 選択状態表示 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">
                    選択中: {selectedNumbers.length}個
                    {MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG] && (
                      <span className="text-sm text-gray-500 ml-2">
                        （最大{MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG].maxSelection}個）
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      全選択
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      クリア
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedNumbers.length > 0 
                    ? formatNumberList(selectedNumbers)
                    : '番号を選択してください'
                  }
                </p>
              </div>

              {/* 番号グリッド */}
              {renderNumberGrid()}
            </>
          )}
        </div>

        {/* フッター */}
        {!loading && merchandiseTypes.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    💾 この種別を保存
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* 画像モーダル */}
    {renderImageModal()}
    </>
  );
};

export default WishListSelector;
