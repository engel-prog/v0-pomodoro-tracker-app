"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Settings, CheckCircle } from "lucide-react"
import { PomodoroSettings } from "./pomodoro-settings"
import { SessionHistory } from "./session-history"

type TimerMode = "focus" | "shortBreak" | "longBreak"
type TimerState = "idle" | "running" | "paused"

interface Session {
  id: string
  type: TimerMode
  duration: number
  completedAt: Date
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [state, setState] = useState<TimerState>("idle")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [focusCount, setFocusCount] = useState(0)

  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 0.5
  }, [])

  // Update timer when mode or settings change
  useEffect(() => {
    if (state === "idle") {
      switch (mode) {
        case "focus":
          setTimeLeft(settings.focusTime * 60)
          break
        case "shortBreak":
          setTimeLeft(settings.shortBreakTime * 60)
          break
        case "longBreak":
          setTimeLeft(settings.longBreakTime * 60)
          break
      }
    }
  }, [mode, settings, state])

  // Timer logic
  useEffect(() => {
    if (state === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, timeLeft])

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && state === "running") {
      handleTimerComplete()
    }
  }, [timeLeft, state])

  const handleTimerComplete = () => {
    setState("idle")

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    }

    // Add session to history
    const newSession: Session = {
      id: Date.now().toString(),
      type: mode,
      duration: getCurrentDuration(),
      completedAt: new Date(),
    }
    setSessions((prev) => [newSession, ...prev])

    // Handle mode transitions
    if (mode === "focus") {
      const newFocusCount = focusCount + 1
      setFocusCount(newFocusCount)

      if (newFocusCount % settings.longBreakInterval === 0) {
        setMode("longBreak")
      } else {
        setMode("shortBreak")
      }

      if (settings.autoStartBreaks) {
        setState("running")
      }
    } else {
      setMode("focus")
      if (settings.autoStartFocus) {
        setState("running")
      }
    }
  }

  const getCurrentDuration = () => {
    switch (mode) {
      case "focus":
        return settings.focusTime
      case "shortBreak":
        return settings.shortBreakTime
      case "longBreak":
        return settings.longBreakTime
    }
  }

  const handleStart = () => {
    setState("running")
  }

  const handlePause = () => {
    setState("paused")
  }

  const handleReset = () => {
    setState("idle")
    switch (mode) {
      case "focus":
        setTimeLeft(settings.focusTime * 60)
        break
      case "shortBreak":
        setTimeLeft(settings.shortBreakTime * 60)
        break
      case "longBreak":
        setTimeLeft(settings.longBreakTime * 60)
        break
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = getCurrentDuration() * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getModeLabel = () => {
    switch (mode) {
      case "focus":
        return "Focus Time"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case "focus":
        return "bg-primary text-primary-foreground"
      case "shortBreak":
        return "bg-secondary text-secondary-foreground"
      case "longBreak":
        return "bg-accent text-accent-foreground"
    }
  }

  if (showSettings) {
    return (
      <PomodoroSettings settings={settings} onSettingsChange={setSettings} onClose={() => setShowSettings(false)} />
    )
  }

  if (showHistory) {
    return (
      <SessionHistory
        sessions={sessions}
        onClose={() => setShowHistory(false)}
        onClearHistory={() => setSessions([])}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pomodoro Timer</h1>
          <Badge className={`${getModeColor()} text-sm px-3 py-1`}>{getModeLabel()}</Badge>
        </div>

        {/* Timer Card */}
        <Card className="p-8 text-center space-y-6 bg-card border-border">
          {/* Progress Ring */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-border"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                className={mode === "focus" ? "text-primary" : mode === "shortBreak" ? "text-secondary" : "text-accent"}
                strokeLinecap="round"
              />
            </svg>
            {/* Timer display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {state === "idle" || state === "paused" ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                {state === "paused" ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="outline" className="px-8 bg-transparent">
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}

            <Button onClick={handleReset} size="lg" variant="outline" className="px-6 bg-transparent">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center bg-card border-border">
            <div className="text-2xl font-bold text-primary">{focusCount}</div>
            <div className="text-sm text-muted-foreground">Focus Sessions</div>
          </Card>
          <Card className="p-4 text-center bg-card border-border">
            <div className="text-2xl font-bold text-secondary">{sessions.length}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </Card>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setMode("focus")
              setState("idle")
            }}
            variant={mode === "focus" ? "default" : "outline"}
            className="flex-1"
            disabled={state === "running"}
          >
            Focus
          </Button>
          <Button
            onClick={() => {
              setMode("shortBreak")
              setState("idle")
            }}
            variant={mode === "shortBreak" ? "default" : "outline"}
            className="flex-1"
            disabled={state === "running"}
          >
            Short Break
          </Button>
          <Button
            onClick={() => {
              setMode("longBreak")
              setState("idle")
            }}
            variant={mode === "longBreak" ? "default" : "outline"}
            className="flex-1"
            disabled={state === "running"}
          >
            Long Break
          </Button>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm" className="text-muted-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowHistory(true)} variant="ghost" size="sm" className="text-muted-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>
    </div>
  )
}
