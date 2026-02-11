import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScheduleEditorProps {
    schedule: Record<string, string[]>
    onChange: (newSchedule: Record<string, string[]>) => void
    disabled?: boolean
}

const ALL_HOURS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
]

const DAYS_OF_WEEK = [
    { key: 'segunda', label: 'Segunda' },
    { key: 'terca', label: 'Terça' },
    { key: 'quarta', label: 'Quarta' },
    { key: 'quinta', label: 'Quinta' },
    { key: 'sexta', label: 'Sexta' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
]

export function ScheduleEditor({ schedule, onChange, disabled }: ScheduleEditorProps) {

    const toggleHour = (dayKey: string, hour: string) => {
        const currentHours = schedule[dayKey] || []
        const newHours = currentHours.includes(hour)
            ? currentHours.filter(h => h !== hour)
            : [...currentHours, hour].sort()

        onChange({
            ...schedule,
            [dayKey]: newHours
        })
    }

    const copyToAllDays = (sourceDayKey: string) => {
        const sourceHours = schedule[sourceDayKey] || []
        const newSchedule = { ...schedule }

        DAYS_OF_WEEK.forEach(day => {
            newSchedule[day.key] = [...sourceHours]
        })

        onChange(newSchedule)
    }

    const clearDay = (dayKey: string) => {
        onChange({
            ...schedule,
            [dayKey]: []
        })
    }

    return (
        <Tabs defaultValue="segunda" className="w-full">
            <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7 mb-4 bg-muted/50">
                {DAYS_OF_WEEK.map(day => (
                    <TabsTrigger key={day.key} value={day.key} className="text-xs sm:text-sm">
                        {day.label.slice(0, 3)}
                    </TabsTrigger>
                ))}
            </TabsList>

            {DAYS_OF_WEEK.map(day => (
                <TabsContent key={day.key} value={day.key} className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                        <h3 className="font-semibold">{day.label}</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToAllDays(day.key)}
                            className="text-xs"
                            disabled={disabled}
                        >
                            Copiar para todos os dias
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {ALL_HOURS.map((hora) => {
                            const isActive = (schedule[day.key] || []).includes(hora)
                            return (
                                <button
                                    key={hora}
                                    type="button"
                                    onClick={() => toggleHour(day.key, hora)}
                                    disabled={disabled}
                                    className={`
                                        px-2 py-2 rounded-lg text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'bg-background text-muted-foreground border border-input hover:border-primary disabled:opacity-50'
                                        }
                                    `}
                                >
                                    {hora}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                        <span>
                            {(schedule[day.key] || []).length} horários selecionados
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearDay(day.key)}
                            disabled={disabled}
                        >
                            Limpar dia
                        </Button>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    )
}
