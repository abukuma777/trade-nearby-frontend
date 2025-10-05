import { Html5QrcodeScanner } from 'html5-qrcode';
import React, { useEffect, useRef } from 'react';

interface QRCodeScannerProps {
  onScan: (data: { roomId: string; userId: string }) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false,
    );

    scanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText) as {
            roomId: string;
            userId: string;
          };
          onScan(data);
          void scanner.clear();
        } catch {
          onError('無効なQRコードです');
        }
      },
      (_errorMessage) => {
        // スキャン中のエラーは無視
      },
    );

    scannerRef.current = scanner;

    return () => {
      void scanner.clear();
    };
  }, [onScan, onError]);

  return <div id="qr-reader" />;
};

export default QRCodeScanner;
