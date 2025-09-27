/**
 * サンプル画像のマッピング
 * カテゴリごとに適切なサンプル画像を提供
 */

export const sampleImages = {
  anime: [
    'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587170124634-c2b7c5f59998?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611605640247-60bbbc0583db?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578761499019-d71ff2d0e433?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566576912346-d4a3ae5263b0?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
  ],
  manga: [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618666185439-8befc2019190?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1601705252547-76ce688cf646?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608889453710-0d3f2dea14ee?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?w=600&h=600&fit=crop',
  ],
  game: [
    'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1626543730222-5cf614baa6cf?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1612895009258-fcab2f3b5349?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop',
  ],
  idol: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
  ],
};

/**
 * カテゴリに基づいてランダムなサンプル画像を取得
 */
export const getRandomSampleImages = (category: string, count: number = 3): string[] => {
  const categoryImages = sampleImages[category as keyof typeof sampleImages] || sampleImages.other;
  const shuffled = [...categoryImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * プレースホルダー画像を実際の画像URLに置き換える
 */
export const replacePlaceholderImages = (images: string[] | undefined): string[] => {
  if (!images || images.length === 0) {
    // デフォルトでアニメカテゴリの画像を1枚返す
    return [sampleImages.anime[0]];
  }

  // placeholder画像をサンプル画像に置き換え
  return images.map((img, index) => {
    if (img.includes('placeholder') || img.includes('via.placeholder')) {
      const allImages = Object.values(sampleImages).flat();
      return allImages[index % allImages.length];
    }
    return img;
  });
};

/**
 * 商品タイトルからカテゴリを推測
 */
export const guessCategory = (title: string): string => {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes('フィギュア') ||
    lowerTitle.includes('アニメ') ||
    lowerTitle.includes('鬼滅') ||
    lowerTitle.includes('呪術') ||
    lowerTitle.includes('ワンピース') ||
    lowerTitle.includes('spy')
  ) {
    return 'anime';
  }

  if (
    lowerTitle.includes('マンガ') ||
    lowerTitle.includes('漫画') ||
    lowerTitle.includes('全巻') ||
    lowerTitle.includes('コミック')
  ) {
    return 'manga';
  }

  if (
    lowerTitle.includes('ゲーム') ||
    lowerTitle.includes('switch') ||
    lowerTitle.includes('ps') ||
    lowerTitle.includes('ポケモン')
  ) {
    return 'game';
  }

  if (
    lowerTitle.includes('アイドル') ||
    lowerTitle.includes('生写真') ||
    lowerTitle.includes('乃木坂') ||
    lowerTitle.includes('akb')
  ) {
    return 'idol';
  }

  if (
    lowerTitle.includes('スポーツ') ||
    lowerTitle.includes('nike') ||
    lowerTitle.includes('adidas') ||
    lowerTitle.includes('ジョーダン')
  ) {
    return 'sports';
  }

  return 'other';
};
