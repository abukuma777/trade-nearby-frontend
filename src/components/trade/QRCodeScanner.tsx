import { Html5Qrcode } from 'html5-qrcode';
import React, { useEffect, useRef, useState } from 'react';

interface QRCodeScannerProps {
  onScan: (data: { roomId: string; userId: string }) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const startScanner = async (): Promise<void> => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        // カメラを自動起動
        await scanner.start(
          { facingMode: 'environment' }, // 背面カメラを優先
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // QRコード読み取り成功時

            // カメラを停止してからコールバック実行
            scanner
              .stop()
              .then(() => {
                try {
                  const data = JSON.parse(decodedText) as {
                    roomId: string;
                    userId: string;
                  };
                  onScan(data);
                } catch {
                  onError('無効なQRコードです');
                }
              })
              .catch((err) => {
                console.error('カメラ停止エラー:', err);
                try {
                  const data = JSON.parse(decodedText) as {
                    roomId: string;
                    userId: string;
                  };
                  onScan(data);
                } catch {
                  onError('無効なQRコードです');
                }
              });
          },
          (_errorMessage) => {
            // スキャン中のエラーは無視
          },
        );
      } catch (err) {
        console.error('カメラ起動エラー:', err);
        setCameraError('カメラへのアクセスが許可されていません');
      }
    };

    void startScanner();

    return () => {
      // コンポーネントアンマウント時にカメラを停止
      const cleanup = async (): Promise<void> => {
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch (err) {
            console.error('クリーンアップ時のカメラ停止エラー:', err);
          }
        }
      };
      void cleanup();
    };
  }, [onScan, onError]); // onScan/onErrorが変わった時に再実行

  return (
    <div className="flex flex-col items-center gap-4">
      {cameraError ? (
        <div className="text-center">
          <p className="mb-4 text-red-600">{cameraError}</p>
          <p className="text-sm text-gray-600">
            ブラウザの設定でカメラを許可してください
          </p>
        </div>
      ) : (
        <>
          <div id="qr-reader" className="w-full max-w-sm" />
          <p className="text-sm text-gray-600">
            相手のQRコードをカメラにかざしてください
          </p>
        </>
      )}
    </div>
  );
};

export default QRCodeScanner;
