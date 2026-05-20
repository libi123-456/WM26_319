'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MatchWithTip, Match, Tip } from '@/lib/types'
import { MatchCard } from '@/components/match-card'
import { AdminMatchCard } from '@/components/admin-match-card'
import { ResultsOverview } from '@/components/results-overview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TippSystem() {
  const [matches, setMatches] = useState<MatchWithTip[]>([])
  const [activeTab, setActiveTab] = useState('tipps')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  async function loadData() {
    setIsLoading(true)
    try {
      // Alle Spiele laden
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true })

      // Alle Tipps laden
      const { data: tipsData } = await supabase
        .from('tips')
        .select('*')

      // Spiele mit Tipps kombinieren
      const matchesWithTips: MatchWithTip[] = (matchesData || []).map(match => ({
        ...match,
        tip: tipsData?.find(tip => tip.match_id === match.id)
      }))

      setMatches(matchesWithTips)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const groups = ['A', 'B', 'C', 'D']
  const filteredMatches = selectedGroup === 'all' 
    ? matches 
    : matches.filter(m => m.group_name === selectedGroup)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Lade Spiele...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">WM 2026 Tipp-System</h1>
          <p className="text-center text-muted-foreground mt-2">Gruppenphase</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tipps">Tipps abgeben</TabsTrigger>
            <TabsTrigger value="admin">Resultate eintragen</TabsTrigger>
            <TabsTrigger value="overview">Auswertung</TabsTrigger>
          </TabsList>

          {/* Gruppenfilter */}
          {(activeTab === 'tipps' || activeTab === 'admin') && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedGroup === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGroup('all')}
              >
                Alle Gruppen
              </Button>
              {groups.map(group => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroup(group)}
                >
                  Gruppe {group}
                </Button>
              ))}
            </div>
          )}

          <TabsContent value="tipps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deine Tipps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gib deine Tipps für die Gruppenspiele ab. Du kannst deine Tipps jederzeit ändern, 
                  solange das Spiel noch nicht begonnen hat.
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onTipSaved={loadData}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultate verwalten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Trage hier die echten Spielergebnisse ein. Die Punkte werden automatisch berechnet.
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMatches.map(match => (
                <AdminMatchCard 
                  key={match.id} 
                  match={match} 
                  onResultSaved={loadData}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <ResultsOverview matches={matches} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          WM 2026 Tipp-System - Gruppenphase
        </div>
      </footer>
    </div>
  )
}
