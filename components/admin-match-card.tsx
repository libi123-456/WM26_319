'use client'

import { useState } from 'react'
import { Match } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/utils/points'

interface AdminMatchCardProps {
  match: Match
  onResultSaved: () => void
}

export function AdminMatchCard({ match, onResultSaved }: AdminMatchCardProps) {
  const [scoreHome, setScoreHome] = useState<string>(match.score_home?.toString() ?? '')
  const [scoreAway, setScoreAway] = useState<string>(match.score_away?.toString() ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  async function saveResult() {
    if (scoreHome === '' || scoreAway === '') return

    setIsLoading(true)
    try {
      // Resultat speichern
      await supabase
        .from('matches')
        .update({
          score_home: parseInt(scoreHome),
          score_away: parseInt(scoreAway)
        })
        .eq('id', match.id)

      // Punkte für alle Tipps zu diesem Spiel neu berechnen
      const { data: tips } = await supabase
        .from('tips')
        .select('*')
        .eq('match_id', match.id)

      if (tips) {
        for (const tip of tips) {
          const points = calculatePointsLocal(
            tip.tip_home,
            tip.tip_away,
            parseInt(scoreHome),
            parseInt(scoreAway)
          )
          await supabase
            .from('tips')
            .update({ points })
            .eq('id', tip.id)
        }
      }

      onResultSaved()
    } finally {
      setIsLoading(false)
    }
  }

  function calculatePointsLocal(
    tipHome: number,
    tipAway: number,
    resultHome: number,
    resultAway: number
  ): number {
    if (tipHome === resultHome && tipAway === resultAway) {
      return 3
    }
    const tipTendency = tipHome > tipAway ? 'home' : tipHome < tipAway ? 'away' : 'draw'
    const resultTendency = resultHome > resultAway ? 'home' : resultHome < resultAway ? 'away' : 'draw'
    if (tipTendency === resultTendency) {
      return 1
    }
    return 0
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {formatDate(match.match_date)} {formatTime(match.match_time)}
          </CardTitle>
          <Badge variant="outline">Gruppe {match.group_name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Teams */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right font-medium">{match.team_home}</div>
            <span className="text-muted-foreground">vs</span>
            <div className="flex-1 font-medium">{match.team_away}</div>
          </div>

          {/* Resultat Eingabe */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Resultat:</span>
            <Input
              type="number"
              min="0"
              max="20"
              value={scoreHome}
              onChange={(e) => setScoreHome(e.target.value)}
              className="w-16 text-center"
              placeholder="0"
            />
            <span>:</span>
            <Input
              type="number"
              min="0"
              max="20"
              value={scoreAway}
              onChange={(e) => setScoreAway(e.target.value)}
              className="w-16 text-center"
              placeholder="0"
            />
            <Button 
              onClick={saveResult} 
              disabled={isLoading || scoreHome === '' || scoreAway === ''}
              size="sm"
            >
              {isLoading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>

          {match.score_home !== null && match.score_away !== null && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <span className="text-sm text-green-700 dark:text-green-300">
                Aktuelles Resultat: {match.score_home} : {match.score_away}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
