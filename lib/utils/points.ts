import { Match, Tip } from './types'

// Punkteberechnung nach dem Schema:
// 3 Punkte: Exaktes Ergebnis (z.B. Tipp 2:1, Resultat 2:1)
// 1 Punkt: Richtige Tendenz (z.B. Tipp 2:1, Resultat 3:0 - beide Heimsieg)
// 0 Punkte: Falsche Tendenz
export function calculatePoints(
  tipHome: number,
  tipAway: number,
  scoreHome: number | null,
  scoreAway: number | null
): number {
  if (scoreHome === null || scoreAway === null) {
    return 0
  }

  // Exaktes Ergebnis
  if (tipHome === scoreHome && tipAway === scoreAway) {
    return 3
  }

  // Tendenz berechnen
  const tipTendency = getTendency(tipHome, tipAway)
  const scoreTendency = getTendency(scoreHome, scoreAway)

  // Richtige Tendenz
  if (tipTendency === scoreTendency) {
    return 1
  }

  return 0
}

function getTendency(home: number, away: number): 'home' | 'draw' | 'away' {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return ''
  return timeString.slice(0, 5) + ' Uhr'
}

export function getTotalPoints(tips: Tip[]): number {
  return tips.reduce((sum, tip) => sum + tip.points, 0)
}
