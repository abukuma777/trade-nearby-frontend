module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // タイプ必須（エラー）- フロントエンド向けにカスタマイズ
    'type-enum': [
      2,
      'always',
      [
        'feat',       // 新機能（新コンポーネント、新画面）
        'fix',        // バグ修正
        'style',      // UIスタイル変更（ロジック変更なし）
        'refactor',   // リファクタリング
        'perf',       // パフォーマンス改善
        'test',       // テスト（unit/integration/e2e）
        'build',      // ビルド設定、Webpack、Vite等
        'ci',         // CI/CD設定
        'docs',       // ドキュメント、コメント
        'chore',      // その他（依存関係更新など）
        'revert',     // コミットの取り消し
        'a11y',       // アクセシビリティ改善
        'i18n',       // 国際化対応
        'ux'          // UX改善（アニメーション、操作性）
      ]
    ],
    
    // フロントエンド向けスコープ（エラー - 必須）
    'scope-enum': [
      2,  // エラーレベル（必須）
      'always',
      [
        // コンポーネント関連
        'components',
        'layouts',
        'pages',
        'forms',
        'modals',
        
        // 機能関連
        'auth',
        'routing',
        'api',
        'store',
        'hooks',
        
        // スタイル関連
        'styles',
        'theme',
        'animations',
        
        // その他
        'utils',
        'types',
        'config',
        'deps',
        'tests',
        'e2e'
      ]
    ],
    
    // 必須項目（エラー）
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],  // スコープも必須に
    
    // 文字数制限（エラー）
    'subject-max-length': [2, 'always', 50],      // 件名は50文字以内（より厳格）
    'body-max-line-length': [2, 'always', 80],    // 本文は80文字以内
    'footer-max-line-length': [2, 'always', 80],  // フッターも80文字以内
    
    // 文の形式（エラー）
    'subject-case': [2, 'always', 'lower-case'],  // 小文字で開始必須
    'subject-full-stop': [2, 'never', '.'],       // 末尾ピリオド禁止
    'body-leading-blank': [2, 'always'],          // 本文前に空行必須
    'footer-leading-blank': [2, 'always'],        // フッター前に空行必須
    
    // 本文必須（エラー）- より厳格
    'body-min-length': [2, 'always', 30],         // 本文は30文字以上必須
    'body-empty': [1, 'never'],                   // 本文推奨
    
    // カスタムルール
    'header-max-length': [2, 'always', 100],      // ヘッダー全体で100文字以内
  },
  
  prompt: {
    questions: {
      type: {
        description: '変更タイプを選択（必須）',
        enum: {
          feat: {
            description: '✨ 新機能・新コンポーネント',
            title: 'Features',
          },
          fix: {
            description: '🐛 バグ修正',
            title: 'Bug Fixes',
          },
          style: {
            description: '💄 UIスタイル変更（CSS、レイアウト）',
            title: 'Styles',
          },
          refactor: {
            description: '♻️ リファクタリング',
            title: 'Code Refactoring',
          },
          perf: {
            description: '⚡ パフォーマンス改善',
            title: 'Performance',
          },
          test: {
            description: '✅ テスト追加・修正',
            title: 'Tests',
          },
          a11y: {
            description: '♿ アクセシビリティ改善',
            title: 'Accessibility',
          },
        },
      },
      scope: {
        description: 'スコープを入力（必須）- 例: components, pages, hooks',
      },
      subject: {
        description: '短い変更概要（50文字以内、小文字開始）',
      },
      body: {
        description: '詳細な変更内容（30文字以上必須）\n- なぜ変更したか\n- 何を変更したか\n- 影響範囲',
      },
    },
  },
  
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint'
};
