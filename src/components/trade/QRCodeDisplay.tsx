import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  roomId: string;
  userId: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ roomId, userId }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async (): Promise<void> => {
      try {
        const qrData = JSON.stringify({ roomId, userId });
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QRコード生成エラー:', err);
      }
    };
    void generateQR();
  }, [roomId, userId]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h3 className="text-lg font-bold">あなたのQRコード</h3>
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QRコード"
          className="border-4 border-gray-300"
        />
      )}
      <p className="text-sm text-gray-600">
        取引相手にこのQRコードを見せてください
      </p>
    </div>
  );
};

export default QRCodeDisplay;
