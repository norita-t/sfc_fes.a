import { renderEmptyState } from '../components/ui.js';

export const notFoundPage = {
  render() {
    return renderEmptyState('ページが見つかりません', 'ホームに戻ってもう一度選び直してください。', '/', 'ホームへ');
  },
  bind() {},
};
