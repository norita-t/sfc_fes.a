import { getMapRoutePoint } from './campusMapLayout.js';

export function estimateRoute(startLocation, endLocation) {
  if (!startLocation || !endLocation) {
    return {
      totalMinutes: 0,
      summary: '場所を選ぶと簡易ルートを表示します。',
    };
  }

  if (startLocation.id === endLocation.id) {
    return {
      totalMinutes: 0,
      summary: `${startLocation.name} にいます。エリア内を案内表示で確認してください。`,
    };
  }

  const start = getMapRoutePoint(startLocation);
  const end = getMapRoutePoint(endLocation);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const horizontal = dx === 0 ? '' : `${dx > 0 ? '東' : '西'}へ ${Math.abs(Math.round(dx * 10) / 10)} エリア分`;
  const vertical = dy === 0 ? '' : `${dy > 0 ? '北' : '南'}へ ${Math.abs(Math.round(dy * 10) / 10)} エリア分`;
  const steps = [vertical, horizontal].filter(Boolean).join('、');
  const totalMinutes = Math.max(1, Math.round(Math.abs(dx) + Math.abs(dy)));

  return {
    totalMinutes,
    summary: `${startLocation.name} から ${endLocation.name} へ。${steps || 'そのまま近くへ移動'}進むイメージです。`,
  };
}
