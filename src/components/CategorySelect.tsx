/**
 * カスケード式カテゴリ選択コンポーネント
 * カテゴリ → ジャンル → シリーズ → イベントの階層選択
 */

import React, { useState, useEffect } from 'react';

import apiClient from '../services/api';

// 型定義
interface ContentItem {
  id: string;
  parent_id: string | null;
  type: 'category' | 'genre' | 'series' | 'event';
  slug: string;
  name: string;
  name_kana: string | null;
  name_en: string | null;
  display_order: number;
  is_active: boolean;
}

interface CategorySelectProps {
  onSelectionChange: (selection: CategorySelection) => void;
  initialSelection?: CategorySelection;
  required?: boolean;
  disabled?: boolean;
}

export interface CategorySelection {
  category_id?: string;
  category_name?: string;
  genre_id?: string;
  genre_name?: string;
  series_id?: string;
  series_name?: string;
  event_id?: string;
  event_name?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  onSelectionChange,
  initialSelection = {},
  required = false,
  disabled = false,
}) => {
  const [categories, setCategories] = useState<ContentItem[]>([]);
  const [genres, setGenres] = useState<ContentItem[]>([]);
  const [series, setSeries] = useState<ContentItem[]>([]);
  const [events, setEvents] = useState<ContentItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialSelection.category_id || '',
  );
  const [selectedGenre, setSelectedGenre] = useState<string>(
    initialSelection.genre_id || '',
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSelection.series_id || '',
  );
  const [selectedEvent, setSelectedEvent] = useState<string>(
    initialSelection.event_id || '',
  );

  const [loading, setLoading] = useState<{
    categories: boolean;
    genres: boolean;
    series: boolean;
    events: boolean;
  }>({
    categories: false,
    genres: false,
    series: false,
    events: false,
  });

  // カテゴリ一覧取得
  useEffect(() => {
    void fetchCategories();
  }, []);

  // カテゴリ変更時
  useEffect(() => {
    if (selectedCategory) {
      void fetchGenres(selectedCategory);
      // 下位階層をリセット
      setSelectedGenre('');
      setSelectedSeries('');
      setSelectedEvent('');
      setGenres([]);
      setSeries([]);
      setEvents([]);
    }
  }, [selectedCategory]);

  // ジャンル変更時
  useEffect(() => {
    if (selectedGenre) {
      void fetchSeries(selectedGenre);
      // 下位階層をリセット
      setSelectedSeries('');
      setSelectedEvent('');
      setSeries([]);
      setEvents([]);
    }
  }, [selectedGenre]);

  // シリーズ変更時
  useEffect(() => {
    if (selectedSeries) {
      void fetchEvents(selectedSeries);
      // イベントをリセット
      setSelectedEvent('');
      setEvents([]);
    }
  }, [selectedSeries]);

  // 選択内容が変更されたら親コンポーネントに通知
  useEffect(() => {
    const selection: CategorySelection = {};

    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory);
      if (cat) {
        selection.category_id = cat.id;
        selection.category_name = cat.name;
      }
    }

    if (selectedGenre) {
      const gen = genres.find((g) => g.id === selectedGenre);
      if (gen) {
        selection.genre_id = gen.id;
        selection.genre_name = gen.name;
      }
    }

    if (selectedSeries) {
      const ser = series.find((s) => s.id === selectedSeries);
      if (ser) {
        selection.series_id = ser.id;
        selection.series_name = ser.name;
      }
    }

    if (selectedEvent) {
      const evt = events.find((e) => e.id === selectedEvent);
      if (evt) {
        selection.event_id = evt.id;
        selection.event_name = evt.name;
      }
    }

    onSelectionChange(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedGenre,
    selectedSeries,
    selectedEvent,
    categories,
    genres,
    series,
    events,
  ]);

  const fetchCategories = async (): Promise<void> => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const response = await apiClient.get<ContentItem[]>(
        '/content/categories',
      );
      setCategories(response.data || []);
    } catch (error) {
      // console.error('カテゴリ取得エラー:', error);
      setCategories([]);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const fetchGenres = async (categoryId: string): Promise<void> => {
    setLoading((prev) => ({ ...prev, genres: true }));
    try {
      const response = await apiClient.get<ContentItem[]>(
        `/content/children/${categoryId}`,
      );
      setGenres(response.data || []);
    } catch (error) {
      // console.error('ジャンル取得エラー:', error);
      setGenres([]);
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  const fetchSeries = async (genreId: string): Promise<void> => {
    setLoading((prev) => ({ ...prev, series: true }));
    try {
      const response = await apiClient.get<ContentItem[]>(
        `/content/children/${genreId}`,
      );
      setSeries(response.data || []);
    } catch (error) {
      // console.error('シリーズ取得エラー:', error);
      setSeries([]);
    } finally {
      setLoading((prev) => ({ ...prev, series: false }));
    }
  };

  const fetchEvents = async (seriesId: string): Promise<void> => {
    setLoading((prev) => ({ ...prev, events: true }));
    try {
      const response = await apiClient.get<ContentItem[]>(
        `/content/children/${seriesId}`,
      );
      setEvents(response.data || []);
    } catch (error) {
      // console.error('イベント取得エラー:', error);
      setEvents([]);
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* カテゴリ選択 */}
      <div>
        <label
          htmlFor="category-select"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          カテゴリ {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={disabled || loading.categories}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* ジャンル選択（カテゴリ選択後に表示） */}
      {selectedCategory && genres.length > 0 && (
        <div>
          <label
            htmlFor="genre-select"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            ジャンル
          </label>
          <select
            id="genre-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            disabled={disabled || loading.genres}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* シリーズ選択（ジャンル選択後に表示） */}
      {selectedGenre && series.length > 0 && (
        <div>
          <label
            htmlFor="series-select"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            シリーズ
          </label>
          <select
            id="series-select"
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            disabled={disabled || loading.series}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* イベント選択（シリーズ選択後に表示） */}
      {selectedSeries && events.length > 0 && (
        <div>
          <label
            htmlFor="event-select"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            イベント
          </label>
          <select
            id="event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            disabled={disabled || loading.events}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 選択内容の表示 */}
      {(selectedCategory ||
        selectedGenre ||
        selectedSeries ||
        selectedEvent) && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-gray-600">選択中のカテゴリ:</p>
          <p className="text-sm font-medium text-gray-900">
            {[
              categories.find((c) => c.id === selectedCategory)?.name,
              genres.find((g) => g.id === selectedGenre)?.name,
              series.find((s) => s.id === selectedSeries)?.name,
              events.find((e) => e.id === selectedEvent)?.name,
            ]
              .filter(Boolean)
              .join(' > ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
