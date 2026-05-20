'use client'

import { useState } from 'react'
import { MatchWithTip } from '@/lib/types'
import { formatDate, formatTime, calculatePoints } from '@/lib/utils/points'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MatchCardProps {
  match: MatchWithTip
  onTipSaved: () => void
}

export function MatchCard({ match, onTipSaved }: MatchCardProps) {
  const [tipHome, setTipHome] = useState<string>(match.tip?.tip_home?.toString() ?? '')
  const [tipAway, setTipAway] = useState<string>(match.tip?.tip_away?.toString() ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const hasResult = match.score_home !== null && match.score_away !== null
  const hasTip = match.tip !== undefined
  const points = hasTip && hasResult 
    ? calculatePoints(match.tip!.tip_home, match.tip!.tip_away, match.score_home, match.score_away)
    : null

  async function saveTip() {
    if (tipHome === '' || tipAway === '') return

    setIsLoading(true)
    try {
      const tipData = {
        match_id: match.id,
        tip_home: parseInt(tipHome),
        tip_away: parseInt(tipAway),
        points: hasResult 
          ? calculatePoints(parseInt(tipHome), parseInt(tipAway), match.score_home, match.score_away)
          : 0
      }

      if (match.tip) {
        await supabase
          .from('tips')
          .update(tipData)
          .eq('id', match.tip.id)
      } else {
        await supabase
          .from('tips')
          .insert(tipData)
      }

      onTipSaved()
    } finally {
      setIsLoading(false)
    }
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
          {/* Teams und Ergebnis */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right font-medium">{match.team_home}</div>
            {hasResult ? (
              <div className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1 text-primary-foreground">
                <span className="text-lg font-bold">{match.score_home}</span>
                <span>:</span>
                <span className="text-lg font-bold">{match.score_away}</span>
              </div>
            ) : (
              <div className="rounded-lg bg-muted px-3 py-1 text-muted-foreground">
                <span className="text-sm">vs</span>
              </div>
            )}
            <div className="flex-1 font-medium">{match.team_away}</div>
          </div>

          {/* Tipp Eingabe */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Dein Tipp:</span>
            <Input
              type="number"
              min="0"
              max="20"
              value={tipHome}
              onChange={(e) => setTipHome(e.target.value)}
              className="w-16 text-center"
              placeholder="0"
            />
            <span>:</span>
            <Input
              type="number"
              min="0"
              max="20"
              value={tipAway}
              onChange={(e) => setTipAway(e.target.value)}
              className="w-16 text-center"
              placeholder="0"
            />
            <Button 
              onClick={saveTip} 
              disabled={isLoading || tipHome === '' || tipAway === ''}
              size="sm"
            >
              {isLoading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>

          {/* Punkte Anzeige */}
          {hasTip && hasResult && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-2">
              <span className="text-sm text-muted-foreground">Punkte:</span>
              <Badge 
                variant={points === 3 ? 'default' : points === 1 ? 'secondary' : 'outline'}
                className={points === 3 ? 'bg-green-600' : points === 1 ? 'bg-yellow-500' : ''}
              >
                {points} {points === 1 ? 'Punkt' : 'Punkte'}
              </Badge>
              {points === 3 && <span className="text-sm text-green-600">Exakt!</span>}
              {points === 1 && <span className="text-sm text-yellow-600">Tendenz richtig</span>}
            </div>
          )}

          {hasTip && !hasResult && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-2">
              <span className="text-sm text-muted-foreground">
                Tipp abgegeben: {match.tip!.tip_home} : {match.tip!.tip_away}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
