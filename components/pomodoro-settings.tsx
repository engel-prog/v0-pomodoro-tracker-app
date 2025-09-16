"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"

interface Settings {
  focusTime: number
  shortBreakTime: number
  longBreakTime: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

interface PomodoroSettingsProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  onClose: () => void
}

export function PomodoroSettings({ settings, onSettingsChange, onClose }: PomodoroSettingsProps) {
  const handleChange = (key: keyof Settings, value: number | boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Timer Settings */}
        <Card className="p-6 space-y-6 bg-card border-border">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Timer Duration</h2>

            <div className="space-y-2">
              <Label htmlFor="focus-time" className="text-sm font-medium">
                Focus Time (minutes)
              </Label>
              <Input
                id="focus-time"
                type="number"
                min="1"
                max="60"
                value={settings.focusTime}
                onChange={(e) => handleChange("focusTime", Number.parseInt(e.target.value) || 25)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break" className="text-sm font-medium">
                Short Break (minutes)
              </Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakTime}
                onChange={(e) => handleChange("shortBreakTime", Number.parseInt(e.target.value) || 5)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break" className="text-sm font-medium">
                Long Break (minutes)
              </Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => handleChange("longBreakTime", Number.parseInt(e.target.value) || 15)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break-interval" className="text-sm font-medium">
                Long Break Interval (focus sessions)
              </Label>
              <Input
                id="long-break-interval"
                type="number"
                min="2"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) => handleChange("longBreakInterval", Number.parseInt(e.target.value) || 4)}
                className="bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Auto-start Settings */}
        <Card className="p-6 space-y-4 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground">Auto-start</h2>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-start breaks</Label>
              <p className="text-xs text-muted-foreground">Automatically start break timers</p>
            </div>
            <Switch
              checked={settings.autoStartBreaks}
              onCheckedChange={(checked) => handleChange("autoStartBreaks", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-start focus</Label>
              <p className="text-xs text-muted-foreground">Automatically start focus sessions after breaks</p>
            </div>
            <Switch
              checked={settings.autoStartFocus}
              onCheckedChange={(checked) => handleChange("autoStartFocus", checked)}
            />
          </div>
        </Card>

        {/* Reset to Defaults */}
        <Button
          onClick={() => {
            onSettingsChange({
              focusTime: 25,
              shortBreakTime: 5,
              longBreakTime: 15,
              longBreakInterval: 4,
              autoStartBreaks: false,
              autoStartFocus: false,
            })
          }}
          variant="outline"
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
