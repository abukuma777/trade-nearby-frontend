/**
 * 物販結果登録コンポーネント
 * 物販（ホログラムトレカ、ガチャ等）で取得した番号を登録し、自動的にキープ/交換可能に振り分け
 */

import React, { useState, useEffect } from 'react';
import { wishListService } from '../../services/wishListService';
import { 
  MerchandiseType, 
  MERCHANDISE_CONFIG,
  formatItemNumber,
  formatNumberList,
} from '../../types/event';

interface GachaResultRegisterProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const GachaResultRegister: React.FC<GachaResultRegisterProps> = ({
  eventId,
  eventName,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [merchandiseTypes, setMerchandiseTypes] = useState<MerchandiseType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [obtainedNumbers, setObtainedNumbers] = useState<number[]>([]);
  const [keepingNumbers, setKeepingNumbers] = useState<number[]>([]);
  const [tradeableNumbers, setTradeableNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [showTradeSelection, setShowTradeSelection] = useState(false);
  const [selectedForTrade, setSelectedForTrade] = useState<number[]>([]);
  const [allObtainedNumbers, setAllObtainedNumbers] = useState<number[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');

  // 物販種別を取得（すべての種別）
  useEffect(() => {
    if (isOpen && eventId) {
      loadMerchandiseTypes();
    }
  }, [isOpen, eventId]);

  const loadMerchandiseTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const types = await wishListService.getMerchandiseTypes(eventId);
      // すべての物販種別を表示（フィルタリングしない）
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

  const handleNumberToggle = (number: number) => {
    setObtainedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleQuickAdd = (numbers: string) => {
    // カンマ、スペース、改行で区切られた番号を解析
    const parsed = numbers
      .split(/[,\s\n]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const config = MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG];
    if (config) {
      // 範囲内の番号のみ追加
      const validNumbers = parsed.filter(n => n <= config.totalItems);
      const uniqueNumbers = Array.from(new Set([...obtainedNumbers, ...validNumbers]));
      setObtainedNumbers(uniqueNumbers);
    }
  };

  const handleClearAll = () => {
    setObtainedNumbers([]);
  };

  const handleRegister = async () => {
    if (obtainedNumbers.length === 0) {
      alert('取得した番号を選択してください');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      // ウィッシュリストとの照合
      const result = await wishListService.registerGachaResult(
        eventId,
        selectedType,
        obtainedNumbers
      );
      
      setKeepingNumbers(result.keeping);
      setAllObtainedNumbers(obtainedNumbers);
      setShowResult(true);
      
    } catch (err) {
      console.error('登録エラー:', err);
      setError('登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleResultClose = () => {
    setShowResult(false);
    setShowTradeSelection(false);
    setObtainedNumbers([]);
    setKeepingNumbers([]);
    setTradeableNumbers([]);
    setSelectedForTrade([]);
    setAllObtainedNumbers([]);
    onComplete?.();
    
    // 他の種別がある場合は次へ、なければ閉じる
    const otherTypes = merchandiseTypes.filter(t => t.type_name !== selectedType);
    if (otherTypes.length > 0) {
      setSelectedType(otherTypes[0].type_name);
    } else {
      onClose();
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

    const items = Array.from(
      { length: config.totalItems },
      (_, i) => ({
        number: i + 1,
        selected: obtainedNumbers.includes(i + 1),
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
                p-2 sm:p-3 text-sm sm:text-base rounded-lg border-2 font-medium transition-all
                ${item.selected 
                  ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
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

  const renderResult = () => {
    if (!showResult) return null;

    const hasWishlistMatch = keepingNumbers.length > 0;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className={`${hasWishlistMatch ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} text-white p-6`}>
            <h3 className="text-xl font-bold">
              {hasWishlistMatch ? '🎉 おめでとうございます！' : '📦 取得結果'}
            </h3>
            {hasWishlistMatch && (
              <p className="mt-2 text-yellow-100">
                ウィッシュリストの番号が{keepingNumbers.length}個含まれていました！
              </p>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            {/* ウィッシュリスト一致 */}
            {hasWishlistMatch && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  ✨ ウィッシュリストと一致した番号
                </h4>
                <p className="text-yellow-800 font-bold text-lg">
                  {formatNumberList(keepingNumbers)}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  これらの番号は自動的にキープされます
                </p>
              </div>
            )}

            {/* 取得した全番号 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                📋 取得した番号一覧
              </h4>
              <p className="text-gray-700">
                {formatNumberList(allObtainedNumbers)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-2xl font-bold text-gray-900">{allObtainedNumbers.length}</p>
                  <p className="text-gray-600">取得総数</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-2xl font-bold text-yellow-600">{keepingNumbers.length}</p>
                  <p className="text-gray-600">ウィッシュリスト一致</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={() => {
                setShowResult(false);
                setShowTradeSelection(true);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              次へ：交換に出す番号を選択
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTradeSelection = () => {
    if (!showTradeSelection) return null;

    const config = MERCHANDISE_CONFIG[selectedType as keyof typeof MERCHANDISE_CONFIG];
    if (!config) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <h3 className="text-xl font-bold">🔄 交換に出す番号を選択</h3>
            <p className="mt-2 text-purple-100">
              この中で交換に出しても良い番号を選んでください
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {/* 説明 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium mb-2">💡 選択のヒント</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ウィッシュリスト一致の番号はキープ推奨</li>
                <li>• 重複した番号は交換に出すのがおすすめ</li>
                <li>• 後から変更することも可能です</li>
              </ul>
            </div>

            {/* 選択状態表示 */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-900">
                  交換に出す番号: {selectedForTrade.length}個
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // ウィッシュリスト以外を全選択
                      const nonWishlist = allObtainedNumbers.filter(n => !keepingNumbers.includes(n));
                      setSelectedForTrade(nonWishlist);
                    }}
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    推奨を選択
                  </button>
                  <button
                    onClick={() => setSelectedForTrade([])}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    クリア
                  </button>
                </div>
              </div>
              <p className="text-sm text-purple-700">
                {selectedForTrade.length > 0 
                  ? formatNumberList(selectedForTrade)
                  : '番号を選択してください'
                }
              </p>
            </div>

            {/* 番号グリッド */}
            <div 
              className={`grid gap-2`}
              style={{ gridTemplateColumns: `repeat(${config.gridColumns}, 1fr)` }}
            >
              {allObtainedNumbers.map(number => {
                const isWishlist = keepingNumbers.includes(number);
                const isSelected = selectedForTrade.includes(number);
                
                return (
                  <button
                    key={number}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedForTrade(prev => prev.filter(n => n !== number));
                      } else {
                        setSelectedForTrade(prev => [...prev, number]);
                      }
                    }}
                    className={`
                      p-3 rounded-lg border-2 font-medium transition-all relative
                      ${isSelected 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                        : isWishlist
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:border-yellow-400'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }
                    `}
                  >
                    {formatItemNumber(number, selectedType)}
                    {isWishlist && (
                      <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-yellow-900 px-1 rounded">
                        ⭐
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
            <button
              onClick={() => {
                setShowTradeSelection(false);
                setShowResult(true);
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              戻る
            </button>
            <button
              onClick={() => {
                // 最終的な振り分けを保存
                setTradeableNumbers(selectedForTrade);
                setShowTradeSelection(false);
                alert(`✅ 登録完了！\n\nキープ: ${keepingNumbers.length}個\n交換可能: ${selectedForTrade.length}個`);
                
                // リセット
                handleResultClose();
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700"
            >
              💫 市場に出す
            </button>
          </div>
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
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">📦 物販結果登録</h2>
                <p className="text-green-100">{eventName}</p>
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            ) : merchandiseTypes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">物販情報がありません</p>
              </div>
            ) : (
              <>
                {/* 種別選択タブ */}
                {merchandiseTypes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex gap-2 border-b border-gray-200">
                      {merchandiseTypes.map(type => {
                        const config = MERCHANDISE_CONFIG[type.type_name as keyof typeof MERCHANDISE_CONFIG];
                        
                        return (
                          <button
                            key={type.id}
                            onClick={() => {
                              setSelectedType(type.type_name);
                              setObtainedNumbers([]);
                            }}
                            className={`
                              px-4 py-3 font-medium transition-all
                              ${selectedType === type.type_name
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }
                            `}
                          >
                            {config?.displayName || type.type_name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* クイック入力 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    🚀 クイック入力
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="番号を入力（例: 1,5,10,23）"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleQuickAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                        if (input?.value) {
                          handleQuickAdd(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      追加
                    </button>
                  </div>
                </div>

                {/* 選択状態表示 */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">
                      取得した番号: {obtainedNumbers.length}個
                    </h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      クリア
                    </button>
                  </div>
                  <p className="text-sm text-green-700">
                    {obtainedNumbers.length > 0 
                      ? formatNumberList(obtainedNumbers)
                      : '番号を選択またはクイック入力してください'
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
                  onClick={handleRegister}
                  disabled={saving || obtainedNumbers.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      登録中...
                    </>
                  ) : (
                    <>
                      📝 結果を登録
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 結果表示モーダル */}
      {renderResult()}
      
      {/* 交換選択モーダル */}
      {renderTradeSelection()}
      
      {/* 画像モーダル */}
      {renderImageModal()}
    </>
  );
};

export default GachaResultRegister;
