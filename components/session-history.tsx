"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, Clock, Calendar } from "lucide-react"
import { format, isToday, isYesterday, startOfDay } from "date-fns"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface Session {
  id: string
  type: TimerMode
  duration: number
  completedAt: Date
}

interface SessionHistoryProps {
  sessions: Session[]
  onClose: () => void
  onClearHistory: () => void
}

export function SessionHistory({ sessions, onClose, onClearHistory }: SessionHistoryProps) {
  const getModeLabel = (type: TimerMode) => {
    switch (type) {
      case "focus":
        return "Focus"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
    }
  }

  const getModeColor = (type: TimerMode) => {
    switch (type) {
      case "focus":
        return "bg-primary text-primary-foreground"
      case "shortBreak":
        return "bg-secondary text-secondary-foreground"
      case "longBreak":
        return "bg-accent text-accent-foreground"
    }
  }

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return "Today"
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: Session[] } = {}

    sessions.forEach((session) => {
      const dateKey = format(startOfDay(session.completedAt), "yyyy-MM-dd")
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(session)
    })

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }

  const getTodayStats = () => {
    const todaySessions = sessions.filter((session) => isToday(session.completedAt))
    const focusSessions = todaySessions.filter((s) => s.type === "focus").length
    const totalMinutes = todaySessions.reduce((acc, session) => acc + session.duration, 0)

    return { focusSessions, totalMinutes }
  }

  const groupedSessions = groupSessionsByDate(sessions)
  const { focusSessions, totalMinutes } = getTodayStats()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onClose} variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Session History</h1>
          </div>
          {sessions.length > 0 && (
            <Button
              onClick={onClearHistory}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Today's Stats */}
        {sessions.some((s) => isToday(s.completedAt)) && (
          <Card className="p-4 bg-card border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Today's Progress</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{focusSessions}</div>
                <div className="text-sm text-muted-foreground">Focus Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{totalMinutes}</div>
                <div className="text-sm text-muted-foreground">Total Minutes</div>
              </div>
            </div>
          </Card>
        )}

        {/* Session List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground">Complete your first Pomodoro session to see it here!</p>
            </Card>
          ) : (
            groupedSessions.map(([dateKey, dateSessions]) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDate(new Date(dateKey))}
                </div>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <Card key={session.id} className="p-4 bg-card border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getModeColor(session.type)} text-xs px-2 py-1`}>
                            {getModeLabel(session.type)}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{session.duration} min</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{format(session.completedAt, "h:mm a")}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
