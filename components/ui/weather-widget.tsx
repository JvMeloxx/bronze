"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWeatherForecast, WeatherDay, getUVColor, getUVDescription } from "@/lib/weather"
import { Skeleton } from "@/components/ui/skeleton"

interface WeatherWidgetProps {
    latitude: number
    longitude: number
    establishmentName?: string
}

export function WeatherWidget({ latitude, longitude, establishmentName }: WeatherWidgetProps) {
    const [forecast, setForecast] = useState<WeatherDay[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadWeather() {
            if (!latitude || !longitude) return

            setIsLoading(true)
            try {
                const data = await getWeatherForecast(latitude, longitude)
                setForecast(data || [])
            } catch (error) {
                console.error("Erro ao carregar clima:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadWeather()
    }, [latitude, longitude])

    if (!latitude || !longitude) return null

    if (isLoading) {
        return (
            <Card className="border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-32 w-24 flex-shrink-0" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (forecast.length === 0) return null

    return (
        <Card className="border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 animate-in fade-in duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-cyan-700 dark:text-cyan-300">
                    <span>🌦️</span> Previsão do Tempo
                </CardTitle>
                {establishmentName && (
                    <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80">
                        para {establishmentName}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-cyan-200 dark:scrollbar-thumb-cyan-800">
                    {forecast.map((day) => (
                        <div
                            key={day.date}
                            className={`
                                flex flex-col items-center p-3 rounded-lg border min-w-[100px] text-center transition-all hover:scale-105
                                ${day.isSunny
                                    ? "bg-amber-100/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                                    : "bg-white/50 border-cyan-100 dark:bg-zinc-800/50 dark:border-zinc-700"
                                }
                            `}
                        >
                            <span className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                            </span>
                            <span className="text-xs text-muted-foreground mb-2">
                                {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>

                            <span className="text-3xl mb-2" role="img" aria-label={day.description}>
                                {day.icon}
                            </span>

                            <div className="flex gap-2 text-sm font-bold w-full justify-center">
                                <span className="text-red-500">{Math.round(day.tempMax)}°</span>
                                <span className="text-blue-500">{Math.round(day.tempMin)}°</span>
                            </div>

                            <div className="mt-2 w-full pt-2 border-t border-dashed border-cyan-200 dark:border-zinc-700">
                                <p className="text-[10px] text-muted-foreground">UV Index</p>
                                <p className={`text-xs font-bold ${getUVColor(day.uvIndex)}`}>
                                    {day.uvIndex} - {getUVDescription(day.uvIndex)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
