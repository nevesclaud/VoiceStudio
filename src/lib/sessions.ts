import { exerciseById } from '../content/exercises'
import { needs } from '../content/sos'

export function sessionTitle(exerciseId: string): string {
  if (exerciseId.startsWith('sos-')) {
    const need = needs.find((n) => `sos-${n.id}` === exerciseId)
    return need ? `Ajuda imediata · ${need.label.toLowerCase()}` : 'Ajuda imediata'
  }
  if (exerciseId === 'falar-preparacao') return 'Preparação de 3 minutos'
  return exerciseById(exerciseId)?.title ?? 'Prática'
}
