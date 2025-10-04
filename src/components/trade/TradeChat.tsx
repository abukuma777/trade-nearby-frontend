/**
 * 取引チャットコンポーネント
 * 取引中（trading）ステータス時のチャット機能
 */

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Send, MessageSquare } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { tradeService, ChatMessage } from '@/services/tradeService';
import { useAuthStore } from '@/stores/authStore';

interface TradeChatProps {
  tradeRequestId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export const TradeChat: React.FC<TradeChatProps> = ({
  tradeRequestId,
  otherUserId: _otherUserId,
  otherUserName,
  otherUserAvatar,
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // メッセージを取得
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { messages } = await tradeService.getChatMessages(tradeRequestId);
      setMessages(messages);
      scrollToBottom();
    } catch (err) {
      console.error('メッセージ取得エラー:', err);
      setError('メッセージの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メッセージを送信
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) {return;}

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setError(null);

    try {
      const sentMessage = await tradeService.sendChatMessage(tradeRequestId, messageText);
      setMessages((prev) => [...prev, sentMessage]);
      scrollToBottom();
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました');
      setNewMessage(messageText); // 送信失敗時は入力を復元
    } finally {
      setIsSending(false);
    }
  };

  // 最下部へスクロール
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Enter キーで送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 初期読み込みと定期更新
  useEffect(() => {
    loadMessages();

    // 定期的にメッセージを更新（10秒ごと）
    const interval = setInterval(loadMessages, 10000);

    return () => clearInterval(interval);
  }, [tradeRequestId]);

  // ローディング状態
  if (isLoading && messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-500">メッセージを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border flex flex-col h-[500px]">
      {/* ヘッダー */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-gray-500" size={24} />
          <h3 className="font-medium text-lg">チャット</h3>
          <span className="text-sm text-gray-500">- {otherUserName}さんとの会話</span>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">{error}</div>
        )}
      </div>

      {/* メッセージエリア */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto mb-2" size={40} />
            <p>まだメッセージがありません</p>
            <p className="text-sm mt-1">最初のメッセージを送信してみましょう</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {/* アバター */}
                    <div className="flex-shrink-0">
                      {isOwnMessage ? (
                        user?.avatar_url ? (
                          <img src={user.avatar_url} alt="You" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user?.display_name?.[0]?.toUpperCase() || 'Y'}
                            </span>
                          </div>
                        )
                      ) : otherUserAvatar ? (
                        <img
                          src={otherUserAvatar}
                          alt={otherUserName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {otherUserName[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* メッセージ内容 */}
                    <div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : ''}`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              !newMessage.trim() || isSending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Send size={20} />
            {isSending ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeChat;
