import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴとサービス概要 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-3">
              <span className="text-blue-400">Trade</span> Nearby
            </h3>
            <p className="text-gray-400 mb-4">AI-Native推し活グッズ交換プラットフォーム</p>
            <p className="text-sm text-gray-400">
              推し活グッズの交換をもっと簡単に、もっと楽しく。
              AIが最適なマッチングをお手伝いします。
            </p>
          </div>

          {/* サービスリンク */}
          <div>
            <h4 className="font-semibold mb-4">サービス</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Trade Nearbyについて
                </Link>
              </li>
              <li>
                <Link to="/how-to-use" className="text-gray-400 hover:text-white transition-colors">
                  使い方
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-white transition-colors">
                  安全な取引のために
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ボトムライン */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-sm text-gray-400">© 2025 Trade Nearby. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
