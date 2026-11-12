import type { DayPoint } from '../lib/stats'

/** Gráfico de barras simples dos check-ins. Inclui tabela para leitores de tela. */
export function CheckInChart({ points, title }: { points: DayPoint[]; title: string }) {
  const W = 320
  const H = 150
  const pad = { l: 24, r: 6, t: 8, b: 22 }
  const bw = (W - pad.l - pad.r) / points.length
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / 10)
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title}. Detalhes na tabela a seguir.`}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e6ddd1" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#55666d">
              {v}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const x = pad.l + i * bw + bw * 0.18
          const w = bw * 0.64
          const showLabel = points.length <= 7 || i % 5 === 0 || i === points.length - 1
          return (
            <g key={p.key}>
              {p.avg !== null ? (
                <rect x={x} y={y(p.avg)} width={w} height={Math.max(2, H - pad.b - y(p.avg))} rx={Math.min(4, w / 2)} fill="#3e6a85" opacity={0.85} />
              ) : (
                <circle cx={x + w / 2} cy={H - pad.b - 2} r={1.6} fill="#dccbb4" />
              )}
              {showLabel && (
                <text x={x + w / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#55666d">
                  {p.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-muted">Média dos check-ins de cada dia (0 a 10). Pontinhos = dias sem registro.</figcaption>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Média</th>
            <th>Registros</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <td>{p.date.toLocaleDateString('pt-BR')}</td>
              <td>{p.avg ?? 'sem registro'}</td>
              <td>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
