/**
 * ウィッシュリストサービス
 * イベント物販の番号管理システム用API
 */

import api from './api';
import type {
  MerchandiseType,
  MerchandiseTypesResponse,
  WishList,
  WishListResponse,
  SetWishListRequest,
  RegisterGachaResultRequest,
  GachaResultResponse,
} from '../types/event';

class WishListService {
  /**
   * 物販種別一覧取得
   */
  async getMerchandiseTypes(eventId: string): Promise<MerchandiseType[]> {
    try {
      const response = await api.get<MerchandiseTypesResponse>(
        `/events/${eventId}/merchandise-types`
      );
      return response.data.data;
    } catch (error) {
      console.error('物販種別取得エラー:', error);
      throw error;
    }
  }

  /**
   * ウィッシュリスト取得
   */
  async getWishList(eventId: string): Promise<WishList[]> {
    try {
      const response = await api.get<WishListResponse>(
        `/events/${eventId}/wishes`
      );
      return response.data.data;
    } catch (error) {
      console.error('ウィッシュリスト取得エラー:', error);
      throw error;
    }
  }

  /**
   * ウィッシュリスト登録/更新
   */
  async setWishList(
    eventId: string,
    typeName: string,
    itemNumbers: number[]
  ): Promise<void> {
    try {
      const data: SetWishListRequest = {
        type_name: typeName,
        item_numbers: itemNumbers,
      };

      await api.post(`/events/${eventId}/wishes`, data);
    } catch (error) {
      console.error('ウィッシュリスト登録エラー:', error);
      throw error;
    }
  }

  /**
   * ガチャ結果登録
   */
  async registerGachaResult(
    eventId: string,
    typeName: string,
    obtainedNumbers: number[]
  ): Promise<{ keeping: number[]; tradeable: number[] }> {
    try {
      const data: RegisterGachaResultRequest = {
        type_name: typeName,
        obtained_numbers: obtainedNumbers,
      };

      const response = await api.post<GachaResultResponse>(
        `/events/${eventId}/gacha-results`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('ガチャ結果登録エラー:', error);
      throw error;
    }
  }

  /**
   * ウィッシュリスト削除（特定の種別）
   */
  async deleteWishList(eventId: string, typeName: string): Promise<void> {
    try {
      // 空の配列を送信することで実質的に削除
      await this.setWishList(eventId, typeName, []);
    } catch (error) {
      console.error('ウィッシュリスト削除エラー:', error);
      throw error;
    }
  }

  /**
   * 複数種別のウィッシュリスト一括取得
   */
  async getAllWishLists(eventId: string): Promise<Map<string, number[]>> {
    try {
      const wishLists = await this.getWishList(eventId);
      const result = new Map<string, number[]>();
      
      wishLists.forEach(wish => {
        result.set(wish.type_name, wish.item_numbers);
      });
      
      return result;
    } catch (error) {
      console.error('ウィッシュリスト一括取得エラー:', error);
      throw error;
    }
  }

  /**
   * ウィッシュリストの状態を確認（設定済みかどうか）
   */
  async hasWishList(eventId: string, typeName?: string): Promise<boolean> {
    try {
      const wishLists = await this.getWishList(eventId);
      
      if (typeName) {
        return wishLists.some(
          wish => wish.type_name === typeName && wish.item_numbers.length > 0
        );
      }
      
      return wishLists.some(wish => wish.item_numbers.length > 0);
    } catch (error) {
      console.error('ウィッシュリスト状態確認エラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const wishListService = new WishListService();
