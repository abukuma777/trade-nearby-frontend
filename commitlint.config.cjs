module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert',
      'debug',
      'security',  // セキュリティ修正
      'deps'       // 依存関係更新
    ]],
    'scope-enum': [1, 'always', [  // 警告レベルに変更（任意）
      'api', 'auth', 'db', 'config', 'middleware',
      'routes', 'models', 'services', 'utils', 'types',
      'tests', 'docs', 'deps', 'security', 'performance'
    ]],
    // 'scope-empty': [2, 'never'],           // スコープ任意化のため削除
    'subject-empty': [2, 'never'],            // 件名必須
    'subject-max-length': [2, 'always', 75],  // 75字以内
    'subject-case': [0],                       // 大文字始まりを許可
    // 'body-min-length': [2, 'always', 30],  // 本文任意化のため削除
    'body-max-line-length': [0],              // 本文の行長制限なし
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [0]             // フッターの行長制限なし
  }
};
