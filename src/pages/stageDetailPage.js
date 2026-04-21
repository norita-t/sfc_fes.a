import { renderEmptyState, renderMediaFrame, renderMetaRow, renderSectionHeader, renderTag } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';
import { formatTimeRange } from '../utils/time.js';

export const stageDetailPage = {
  render(context, route) {
    const program = context.data.stagePrograms.find((item) => item.id === route.params.programId);

    if (!program) {
      return renderEmptyState('ステージ枠が見つかりません', 'ステージ一覧から別の予定を選んでください。', '/stage', 'ステージ一覧へ');
    }

    const relations = context.getStageProgramRelations(program);

    return `
      <section class="detail-hero">
        <div class="detail-hero__media">
          ${renderMediaFrame({ imageUrl: program.imageUrl || '', alt: program.imageAlt || program.title, label: program.imageAlt || 'ステージ画像プレースホルダー', aspect: 'detail' })}
        </div>
        <div class="detail-hero__body">
          <div class="detail-hero__topline">
            <button class="back-link" data-route="/stage">← ステージ一覧に戻る</button>
          </div>
          <div class="inline-tags">
            ${renderTag(program.day, 'neutral')}
            ${renderTag(relations.stageVenue?.name ?? '会場未設定', 'indoor')}
          </div>
          <h2>${escapeHTML(program.title)}</h2>
          <p class="detail-hero__description">${escapeHTML(program.description)}</p>
        </div>
      </section>

      <section class="section-block">
        ${renderSectionHeader('ステージ情報', context.getText('stage-detail-info-subtitle', '日付と会場を確認して移動先を決められます'))}
        <div class="detail-meta-card">
          ${renderMetaRow('開催日', program.day)}
          ${renderMetaRow('時間', formatTimeRange(program.startTime, program.endTime))}
          ${renderMetaRow('会場', relations.stageVenue?.name ?? '未設定')}
          ${renderMetaRow('エリア', relations.parentLocation?.name ?? '未設定')}
        </div>
      </section>
    `;
  },

  bind() {},
};
