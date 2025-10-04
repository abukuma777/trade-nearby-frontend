import { Calendar, Users, QrCode, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrading = () => {
    navigate('/trade-posts');
  };

  return (
    <>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ライブ会場での缶バッジ交換を
              <br />
              もっとスムーズに
            </h1>
            <p className="text-xl mb-8 opacity-90">
              「譲求投稿」で事前にマッチング。
              <br className="md:hidden" />
              QRコード認証で安全・確実な交換を。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTrading}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                譲求投稿を見る
                <ArrowRight className="w-5 h-5" />
              </button>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  無料会員登録
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">簡単3ステップ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">投稿する</h3>
              <p className="text-gray-600">
                譲れる缶バッジと
                <br />
                求めている缶バッジを投稿
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">マッチング</h3>
              <p className="text-gray-600">
                条件が合う相手と
                <br />
                事前に交渉・約束
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">会場で交換</h3>
              <p className="text-gray-600">
                QRコードで認証して
                <br />
                安全に交換完了
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trade Nearbyの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">イベント連動</h3>
              <p className="text-gray-600">
                ライブやイベントごとに
                <br />
                投稿を管理。会場での
                <br />
                効率的な交換をサポート
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QRコード認証</h3>
              <p className="text-gray-600">
                交換時にQRコードで認証。
                <br />
                取引の証明と評価システムで
                <br />
                安心安全な交換を実現
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">譲求マッチング</h3>
              <p className="text-gray-600">
                「譲）求）」形式で
                <br />
                効率的にマッチング。
                <br />
                複数アイテムの交換も簡単
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新の投稿セクション */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">最新の譲求投稿</h2>
            <p className="text-gray-600">今まさに交換相手を探している投稿をチェック</p>
          </div>
          <div className="text-center">
            <Link
              to="/trade-posts"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              すべての投稿を見る
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">今すぐ交換を始めよう</h2>
            <p className="text-xl text-gray-600 mb-8">
              会員登録は無料。
              <br />
              次のライブで、推しの缶バッジを手に入れよう。
            </p>
            {isAuthenticated ? (
              <Link
                to="/trade-posts/create"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                投稿を作成する
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  無料で会員登録
                </Link>
                <Link
                  to="/trade-posts"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  投稿を見てみる
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
