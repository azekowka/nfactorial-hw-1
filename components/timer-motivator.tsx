"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Timer, RotateCcw, Play, RefreshCw, Volume2, VolumeX, Moon, Sun, Trophy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

const motivationalPhrases = [
  "Ты справился, {name}! 💪",
  "The GOAT {name}! 🐐",
  "Ты мотивируешь, {name}! 🚀",
  "Браво, {name}! 👏",
]

const celebrationEmojis = ["🎉", "🚀", "⭐", "🏆", "💪", "👏", "✨", "🌟", "💯", "🔥"]

export default function Component() {
  const [name, setName] = useState("")
  const [timerDuration, setTimerDuration] = useState(10)
  const [timeLeft, setTimeLeft] = useState(10)
  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "completed">("idle")
  const [motivationalPhrase, setMotivationalPhrase] = useState("")
  const [completedCount, setCompletedCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedEmoji, setSelectedEmoji] = useState("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { theme, setTheme } = useTheme()

  // Загрузка данных из localStorage при первом рендере
  useEffect(() => {
    const savedName = localStorage.getItem("timerMotivatorName")
    const savedCount = localStorage.getItem("timerMotivatorCompletedCount")
    const savedSoundEnabled = localStorage.getItem("timerMotivatorSoundEnabled")

    if (savedName) setName(savedName)
    if (savedCount) setCompletedCount(Number.parseInt(savedCount))
    if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === "true")
  }, [])

  // Сохранение имени в localStorage при изменении
  useEffect(() => {
    if (name.trim()) {
      localStorage.setItem("timerMotivatorName", name)
    }
  }, [name])

  // Сохранение счетчика завершенных таймеров
  useEffect(() => {
    localStorage.setItem("timerMotivatorCompletedCount", completedCount.toString())
  }, [completedCount])

  // Сохранение настройки звука
  useEffect(() => {
    localStorage.setItem("timerMotivatorSoundEnabled", soundEnabled.toString())
  }, [soundEnabled])

  // Основной эффект для управления таймером
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerStatus === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setTimerStatus("completed")
            setCompletedCount((prev) => prev + 1)

            const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]
            setMotivationalPhrase(randomPhrase.replace("{name}", name || "Друг"))

            setSelectedEmoji(celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)])

            if (soundEnabled && audioRef.current) {
              audioRef.current.volume = 1.0
              audioRef.current.play().catch((e) => console.error("Ошибка воспроизведения звука:", e))
            }

            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timerStatus, timeLeft, name, soundEnabled])

  const startTimer = () => {
    if (name.trim()) {
      setTimeLeft(timerDuration)
      setTimerStatus("running")
    }
  }

  const resetTimer = () => {
    setTimerStatus("idle")
    setTimeLeft(timerDuration)
    setMotivationalPhrase("")
    setSelectedEmoji("")
  }

  const tryAgain = () => {
    setTimerStatus("idle")
    setTimeLeft(timerDuration)
    setMotivationalPhrase("")
    setSelectedEmoji("")
  }

  const handleTimerDurationChange = (value: string) => {
    const duration = Number.parseInt(value)
    setTimerDuration(duration)
    if (timerStatus === "idle") {
      setTimeLeft(duration)
    }
  }

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev)
  }

  const getTimerDisplay = () => {
    if (timerStatus === "running") {
      return `${name || "Друг"}, осталось ${timeLeft} сек`
    }
    if (timerStatus === "completed") {
      return motivationalPhrase
    }
    return "Готов к старту?"
  }

  const getTimerColor = () => {
    if (timerStatus === "running") {
      return timeLeft <= 3 ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-400"
    }
    if (timerStatus === "completed") {
      return "text-green-500 dark:text-green-400"
    }
    return "text-gray-500 dark:text-gray-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <audio ref={audioRef} src="/success-sound.mp3" preload="auto" />

      <Card className="w-full max-w-md shadow-lg dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={toggleSound} className="absolute left-4">
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            <CardTitle className="flex items-center justify-center gap-2 text-2xl w-full">
              <Timer className="h-6 w-6" />
              Таймер Мотиватрр
            </CardTitle>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="absolute right-4"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {completedCount > 0 && (
            <Badge variant="secondary" className="mt-2 mx-auto">
              <Trophy className="h-3 w-3 mr-1" />
              Завершено таймеров: {completedCount}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="timer">Таймер</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Как тебя зовут?</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Введи своё имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={timerStatus === "running"}
                  className="text-center"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timer-duration">Продолжительность таймера</Label>
                <Select
                  value={timerDuration.toString()}
                  onValueChange={handleTimerDurationChange}
                  disabled={timerStatus === "running"}
                >
                  <SelectTrigger id="timer-duration">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 секунд</SelectItem>
                    <SelectItem value="20">20 секунд</SelectItem>
                    <SelectItem value="30">30 секунд</SelectItem>
                    <SelectItem value="60">1 минута</SelectItem>
                    <SelectItem value="120">2 минуты</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Звуковые эффекты</Label>
                  <Button variant={soundEnabled ? "default" : "outline"} size="sm" onClick={toggleSound}>
                    {soundEnabled ? "Включены" : "Выключены"}
                  </Button>
                </div>
              </div>

              {completedCount > 0 && (
                <div className="space-y-2">
                  <Label>Статистика</Label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span>Завершено таймеров:</span>
                      <Badge variant="secondary">{completedCount}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timer" className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={timerStatus}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  {timerStatus === "completed" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="text-7xl mb-4"
                    >
                      {selectedEmoji}
                    </motion.div>
                  )}

                  <div className={`text-6xl font-bold mb-4 ${getTimerColor()}`}>
                    {timerStatus === "idle" ? timerDuration : timeLeft}
                  </div>
                  <div className={`text-lg font-medium ${getTimerColor()}`}>{getTimerDisplay()}</div>
                </motion.div>
              </AnimatePresence>

              <div className="space-y-3">
                {timerStatus === "idle" && (
                  <Button onClick={startTimer} disabled={!name.trim()} className="w-full" size="lg" variant="default">
                    <Play className="h-4 w-4 mr-2" />
                    Старт таймера
                  </Button>
                )}

                {timerStatus === "running" && (
                  <Button onClick={resetTimer} variant="outline" className="w-full" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Сброс
                  </Button>
                )}

                {timerStatus === "completed" && (
                  <div className="space-y-2">
                    <Button onClick={tryAgain} className="w-full" size="lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Попробовать ещё раз
                    </Button>
                    <Button onClick={resetTimer} variant="outline" className="w-full" size="lg">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Полный сброс
                    </Button>
                  </div>
                )}
              </div>

              {timerStatus === "running" && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${((timerDuration - timeLeft) / timerDuration) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-center text-xs text-gray-500 dark:text-gray-400 pt-0">
          <p className="w-full">nFactorial homework 1</p>
        </CardFooter>
      </Card>
    </div>
  )
}
