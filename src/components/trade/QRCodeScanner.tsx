import { Html5Qrcode } from 'html5-qrcode';
import React, { useEffect, useRef, useState } from 'react';

interface QRCodeScannerProps {
  onScan: (data: { roomId: string; userId: string }) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
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
            try {
              const data = JSON.parse(decodedText) as {
                roomId: string;
                userId: string;
              };
              // カメラを停止してからコールバック実行
              scanner
                .stop()
                .then(() => {
                  setIsScanning(false);
                  onScan(data);
                })
                .catch((err) => {
                  console.error('カメラ停止エラー:', err);
                  setIsScanning(false);
                  onScan(data);
                });
            } catch {
              onError('無効なQRコードです');
            }
          },
          (_errorMessage) => {
            // スキャン中のエラーは無視
          },
        );
        setIsScanning(true);
      } catch (err) {
        console.error('カメラ起動エラー:', err);
        setCameraError('カメラへのアクセスが許可されていません');
      }
    };

    void startScanner();

    return () => {
      if (scannerRef.current && isScanning) {
        void scannerRef.current.stop().catch(() => {
          // cleanup時のエラーは無視
        });
      }
    };
  }, [onScan, onError, isScanning]);

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
