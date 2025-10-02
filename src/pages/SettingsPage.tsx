import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiUser, FiLock } from 'react-icons/fi';

import { useAuthStore } from '@/stores/authStore';

type NotificationSetting = 'all' | 'own_posts_only' | 'offers_only' | 'none';

interface SettingsResponse {
  success: boolean;
  data: {
    notification_setting: NotificationSetting;
  };
  message?: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [notificationSetting, setNotificationSetting] =
    useState<NotificationSetting>('all');

  // 設定を取得
  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = (await response.json()) as SettingsResponse;
          if (data.data?.notification_setting) {
            setNotificationSetting(data.data.notification_setting);
          }
        }
      } catch (error) {
        console.error('設定の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [user?.id]);

  // 設定を保存
  const handleSaveSettings = async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notification_setting: notificationSetting,
          }),
        },
      );

      if (response.ok) {
        setMessage({ type: 'success', text: '設定を保存しました' });
      } else {
        throw new Error('設定の保存に失敗しました');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
      console.error('設定保存エラー:', error);
    } finally {
      setSaving(false);

      // メッセージを3秒後に消す
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const notificationOptions = [
    {
      value: 'all' as const,
      label: 'すべての通知を受け取る',
      description:
        '自分の投稿へのコメント、交換提案、コメントへの返信など、すべての通知を受け取ります',
      icon: '🔔',
    },
    {
      value: 'own_posts_only' as const,
      label: '自分の投稿への通知のみ',
      description: '自分の投稿へのコメントと交換提案のみ通知を受け取ります',
      icon: '📝',
    },
    {
      value: 'offers_only' as const,
      label: '交換提案と取引チャットのみ',
      description:
        '交換提案に関する通知と、取引が成立した後のチャットメッセージを受け取ります',
      icon: '🤝',
    },
    {
      value: 'none' as const,
      label: '通知を受け取らない',
      description: 'すべての通知をオフにします',
      icon: '🔕',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-1/4 rounded bg-gray-200" />
          <div className="space-y-4">
            <div className="h-24 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="mt-2 text-gray-600">アカウントと通知の設定を管理します</p>
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <FiCheck className="h-5 w-5" /> : null}
          {message.text}
        </div>
      )}

      {/* 設定セクション */}
      <div className="space-y-8">
        {/* 通知設定 */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiBell className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">通知設定</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {notificationOptions.map((option) => (
                <div
                  key={option.value}
                  className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    notificationSetting === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="notification"
                      value={option.value}
                      checked={notificationSetting === option.value}
                      onChange={(e) =>
                        setNotificationSetting(
                          e.target.value as NotificationSetting,
                        )
                      }
                      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={option.label}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* アカウント設定（将来の拡張用） */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiUser className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                アカウント設定
              </h2>
            </div>
          </div>

          <div className="p-6 text-gray-600">
            <p>アカウント設定は準備中です</p>
          </div>
        </section>

        {/* セキュリティ設定（将来の拡張用） */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiLock className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                セキュリティ設定
              </h2>
            </div>
          </div>

          <div className="p-6 text-gray-600">
            <p>セキュリティ設定は準備中です</p>
          </div>
        </section>
      </div>

      {/* 保存ボタン */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => void handleSaveSettings()}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
