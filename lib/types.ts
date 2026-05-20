export interface Match {
  id: number
  match_date: string
  match_time: string | null
  group_name: string
  team_home: string
  team_away: string
  score_home: number | null
  score_away: number | null
  created_at: string
}

export interface Tip {
  id: number
  match_id: number
  tip_home: number
  tip_away: number
  points: number
  created_at: string
}

export interface MatchWithTip extends Match {
  tip?: Tip
}
