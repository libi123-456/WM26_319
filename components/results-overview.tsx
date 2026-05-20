'use client'

import { MatchWithTip, Tip } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/points'

interface ResultsOverviewProps {
  matches: MatchWithTip[]
}

export function ResultsOverview({ matches }: ResultsOverviewProps) {
  const matchesWithResults = matches.filter(
    m => m.score_home !== null && m.score_away !== null && m.tip
  )

  const totalPoints = matchesWithResults.reduce((sum, m) => sum + (m.tip?.points ?? 0), 0)
  const maxPoints = matchesWithResults.length * 3

  // Gruppiere nach Gruppen
  const groups = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-6">
      {/* Gesamtpunktestand */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Gesamtpunktestand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <span className="text-5xl font-bold text-primary">{totalPoints}</span>
            <span className="text-2xl text-muted-foreground"> / {maxPoints}</span>
            <p className="mt-2 text-sm text-muted-foreground">
              {matchesWithResults.length} von {matches.filter(m => m.tip).length} getippten Spielen ausgewertet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ergebnistabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Tipps und Resultate</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.map(group => {
            const groupMatches = matches.filter(m => m.group_name === group)
            if (groupMatches.length === 0) return null

            return (
              <div key={group} className="mb-6 last:mb-0">
                <h3 className="mb-3 text-lg font-semibold">Gruppe {group}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-2 py-2 text-left">Datum</th>
                        <th className="px-2 py-2 text-left">Spiel</th>
                        <th className="px-2 py-2 text-center">Tipp</th>
                        <th className="px-2 py-2 text-center">Resultat</th>
                        <th className="px-2 py-2 text-center">Punkte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupMatches.map(match => (
                        <tr key={match.id} className="border-b">
                          <td className="px-2 py-2 text-muted-foreground">
                            {formatDate(match.match_date)}
                          </td>
                          <td className="px-2 py-2">
                            {match.team_home} - {match.team_away}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {match.tip ? (
                              <span>{match.tip.tip_home} : {match.tip.tip_away}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {match.score_home !== null ? (
                              <span className="font-medium">
                                {match.score_home} : {match.score_away}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {match.tip && match.score_home !== null ? (
                              <Badge 
                                variant={match.tip.points === 3 ? 'default' : match.tip.points === 1 ? 'secondary' : 'outline'}
                                className={match.tip.points === 3 ? 'bg-green-600' : match.tip.points === 1 ? 'bg-yellow-500' : ''}
                              >
                                {match.tip.points}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Legende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Punktevergabe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">3</Badge>
              <span className="text-sm">Exaktes Ergebnis</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500">1</Badge>
              <span className="text-sm">Richtige Tendenz</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">0</Badge>
              <span className="text-sm">Falsche Tendenz</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
