/**
 * ImageUploaderコンポーネントのユニットテスト
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import { ImageUploader } from './ImageUploader';

import { uploadService } from '@/services/uploadService';

// uploadServiceのモック
vi.mock('@/services/uploadService', () => ({
  uploadService: {
    validateFiles: vi.fn(),
    validateFileType: vi.fn(),
    validateFileSize: vi.fn(),
    createPreviewUrl: vi.fn(),
    revokePreviewUrl: vi.fn(),
    uploadSingleImage: vi.fn(),
    deleteImage: vi.fn(),
    extractFilePathFromUrl: vi.fn(),
  },
}));

describe('ImageUploader', () => {
  const mockOnImagesChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnImagesChange.mockClear();

    // デフォルトのモック実装
    (uploadService.validateFiles as Mock).mockReturnValue(null);
    (uploadService.validateFileType as Mock).mockReturnValue(true);
    (uploadService.validateFileSize as Mock).mockReturnValue(true);
    (uploadService.createPreviewUrl as Mock).mockReturnValue('blob:preview-url');
    (uploadService.extractFilePathFromUrl as Mock).mockReturnValue('test/path.jpg');
  });

  describe('レンダリング', () => {
    it('ドラッグ&ドロップゾーンが表示される', () => {
      render(<ImageUploader onImagesChange={mockOnImagesChange} />);

      expect(screen.getByText(/画像をドラッグ&ドロップ/)).toBeInTheDocument();
    });

    it('最大画像数が正しく表示される', () => {
      render(<ImageUploader maxImages={3} onImagesChange={mockOnImagesChange} />);

      expect(screen.getByText(/最大3枚まで/)).toBeInTheDocument();
    });

    it('単一画像モードで正しく表示される', () => {
      render(<ImageUploader maxImages={1} onImagesChange={mockOnImagesChange} />);

      expect(screen.getByText(/1枚のみ/)).toBeInTheDocument();
    });

    it('初期画像が正しく表示される', () => {
      const initialImages = [
        {
          url: 'https://example.com/image1.jpg',
          path: 'test/image1.jpg',
          thumbnail: 'https://example.com/thumb1.jpg',
        },
      ];

      render(<ImageUploader initialImages={initialImages} onImagesChange={mockOnImagesChange} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/thumb1.jpg');
    });
  });

  describe('ファイル選択', () => {
    it('ファイル選択でアップロードが開始される', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedImage = {
        url: 'https://example.com/uploaded.jpg',
        path: 'uploaded/test.jpg',
      };

      (uploadService.uploadSingleImage as Mock).mockResolvedValue(mockUploadedImage);

      const { container } = render(<ImageUploader onImagesChange={mockOnImagesChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFile);

      await waitFor(() => {
        const uploadCall = uploadService.uploadSingleImage as Mock;
        expect(uploadCall).toHaveBeenCalledWith(
          mockFile,
          expect.objectContaining({
            type: 'item',
          }) as Record<string, unknown>,
        );
      });
    });

    it('複数ファイル選択が可能', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      (uploadService.uploadSingleImage as Mock).mockResolvedValue({
        url: 'https://example.com/uploaded.jpg',
        path: 'uploaded/test.jpg',
      });

      const { container } = render(
        <ImageUploader maxImages={5} onImagesChange={mockOnImagesChange} />,
      );
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFiles);

      await waitFor(() => {
        const uploadSingleImageFunc = uploadService.uploadSingleImage as Mock;
        expect(uploadSingleImageFunc).toHaveBeenCalledTimes(2);
      });
    });

    it('ファイル数制限が機能する', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];

      const { container } = render(
        <ImageUploader maxImages={2} onImagesChange={mockOnImagesChange} />,
      );
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFiles);

      await waitFor(() => {
        // 最大2枚なので、2回のみアップロード
        const uploadSingleImageFunc = uploadService.uploadSingleImage as Mock;
        expect(uploadSingleImageFunc).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('検証機能', () => {
    it('無効なファイルタイプでエラーが表示される', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      (uploadService.validateFiles as Mock).mockReturnValue(
        'test.txt は対応していないファイル形式です',
      );

      const { container } = render(<ImageUploader onImagesChange={mockOnImagesChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFile);

      await waitFor(() => {
        expect(screen.getByText(/対応していないファイル形式/)).toBeInTheDocument();
      });
    });

    it('ファイルサイズ超過でエラーが表示される', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      (uploadService.validateFiles as Mock).mockReturnValue('test.jpg のサイズが大きすぎます');

      const { container } = render(<ImageUploader onImagesChange={mockOnImagesChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFile);

      await waitFor(() => {
        expect(screen.getByText(/サイズが大きすぎます/)).toBeInTheDocument();
      });
    });
  });

  describe('削除機能', () => {
    it('アップロード済み画像を削除できる', async () => {
      const initialImages = [
        {
          url: 'https://example.com/image1.jpg',
          path: 'test/image1.jpg',
        },
      ];

      (uploadService.deleteImage as Mock).mockResolvedValue(undefined);

      render(<ImageUploader initialImages={initialImages} onImagesChange={mockOnImagesChange} />);

      // 削除ボタンを探してクリック
      const deleteButton = screen.getByLabelText('画像を削除');
      await user.click(deleteButton);

      await waitFor(() => {
        const deleteImageFunc = uploadService.deleteImage as Mock;
        expect(deleteImageFunc).toHaveBeenCalledWith('item-images', 'test/path.jpg');
      });
    });
  });

  describe('無効化状態', () => {
    it('無効化時にファイル選択ができない', () => {
      const { container } = render(
        <ImageUploader disabled onImagesChange={mockOnImagesChange} />,
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe('コールバック', () => {
    it('画像変更時にonImagesChangeが呼ばれる', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedImage = {
        url: 'https://example.com/uploaded.jpg',
        path: 'uploaded/test.jpg',
      };

      (uploadService.uploadSingleImage as Mock).mockResolvedValue(mockUploadedImage);

      const { container } = render(<ImageUploader onImagesChange={mockOnImagesChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, mockFile);

      await waitFor(() => {
        expect(mockOnImagesChange).toHaveBeenCalledWith([mockUploadedImage]);
      });
    });
  });
});
