/**
 * Serviço de integração com Tomorrow.io API
 * API paga de previsão do tempo (com plano free)
 * https://www.tomorrow.io/
 */

const TOMORROW_API_KEY = "r09SCjrykgMo9o7J208eAC7qjmomBDoe"

// Tipos para dados do clima
export interface WeatherDay {
    date: string
    weatherCode: number
    tempMax: number
    tempMin: number
    precipitation: number
    uvIndex: number
    description: string
    icon: string
    isSunny: boolean
}

// Mapeamento de códigos Tomorrow.io para descrições e ícones
// https://docs.tomorrow.io/reference/data-layers-weather-codes
const weatherCodeMap: Record<number, { description: string; icon: string; isSunny: boolean }> = {
    0: { description: "Desconhecido", icon: "❓", isSunny: false },
    1000: { description: "Céu Limpo", icon: "☀️", isSunny: true },
    1100: { description: "Predominantemente Limpo", icon: "🌤️", isSunny: true },
    1101: { description: "Parcialmente Nublado", icon: "⛅", isSunny: true },
    1102: { description: "Nublado", icon: "☁️", isSunny: false },
    1001: { description: "Nublado", icon: "☁️", isSunny: false },
    2000: { description: "Nevoeiro", icon: "🌫️", isSunny: false },
    2100: { description: "Nevoeiro Leve", icon: "🌫️", isSunny: false },
    4000: { description: "Garoa", icon: "🌦️", isSunny: false },
    4001: { description: "Chuva", icon: "🌧️", isSunny: false },
    4200: { description: "Chuva Leve", icon: "🌧️", isSunny: false },
    4201: { description: "Chuva Pesada", icon: "🌧️", isSunny: false },
    5000: { description: "Neve", icon: "🌨️", isSunny: false },
    5001: { description: "Neve Leve", icon: "🌨️", isSunny: false },
    5100: { description: "Neve Pesada", icon: "🌨️", isSunny: false },
    5101: { description: "Neve Pesada", icon: "🌨️", isSunny: false },
    6000: { description: "Chuva Congelante", icon: "🌧️", isSunny: false },
    6001: { description: "Chuva Congelante", icon: "🌧️", isSunny: false },
    6200: { description: "Chuva Congelante Leve", icon: "🌧️", isSunny: false },
    6201: { description: "Chuva Congelante Pesada", icon: "🌧️", isSunny: false },
    7000: { description: "Granizo", icon: "🌨️", isSunny: false },
    7101: { description: "Granizo Pesado", icon: "🌨️", isSunny: false },
    7102: { description: "Granizo", icon: "🌨️", isSunny: false },
    8000: { description: "Tempestade", icon: "⛈️", isSunny: false },
}

// Função para obter detalhes do código do tempo
function getWeatherDetails(code: number): { description: string; icon: string; isSunny: boolean } {
    return weatherCodeMap[code] || { description: "Indisponível", icon: "❓", isSunny: false }
}

// Interface da resposta da API Tomorrow.io
interface TomorrowIoResponse {
    data: {
        timelines: Array<{
            timestep: string
            endTime: string
            startTime: string
            intervals: Array<{
                startTime: string
                values: {
                    weatherCode: number
                    temperatureMax: number
                    temperatureMin: number
                    precipitationProbability: number
                    uvIndex: number
                }
            }>
        }>
    }
}

// Cache de 2 horas para previsão do tempo
const WEATHER_CACHE_KEY = 'sunsync_weather_cache_tomorrow_v1'
const WEATHER_CACHE_TTL = 2 * 60 * 60 * 1000 // 2 horas em ms

interface WeatherCache {
    data: WeatherDay[]
    timestamp: number
    key: string
}

function getWeatherCache(cacheKey: string): WeatherDay[] | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY)
        if (!raw) return null
        const cache: WeatherCache = JSON.parse(raw)
        if (cache.key !== cacheKey) return null
        if (Date.now() - cache.timestamp > WEATHER_CACHE_TTL) return null
        return cache.data
    } catch {
        return null
    }
}

function setWeatherCache(cacheKey: string, data: WeatherDay[]) {
    if (typeof window === 'undefined') return
    try {
        const cache: WeatherCache = { data, timestamp: Date.now(), key: cacheKey }
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache))
    } catch {
        // localStorage cheio ou indisponível — ignora
    }
}

/**
 * Busca previsão do tempo para os próximos 5 dias (com cache de 2h) usando Tomorrow.io
 * @param lat Latitude (padrão: São Paulo)
 * @param lng Longitude (padrão: São Paulo)
 */
export async function getWeatherForecast(lat: number = -23.55, lng: number = -46.63): Promise<WeatherDay[]> {
    const cacheKey = `${lat},${lng}`

    // Tentar cache primeiro
    const cached = getWeatherCache(cacheKey)
    if (cached) return cached

    try {
        // Tomorrow.io Free Tier limitation: 1d timestep for max 15 days, generic endpoint
        const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=weatherCode,temperatureMax,temperatureMin,precipitationProbability,uvIndex&timesteps=1d&units=metric&apikey=${TOMORROW_API_KEY}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Falha ao buscar previsão do tempo (Tomorrow.io)')
        }

        const data: TomorrowIoResponse = await response.json()
        const timeline = data.data.timelines[0]

        if (!timeline || !timeline.intervals) {
            return []
        }

        const forecast: WeatherDay[] = timeline.intervals.map((interval) => {
            const code = interval.values.weatherCode || 0
            const weatherDetails = getWeatherDetails(code)
            const date = interval.startTime.split('T')[0]

            return {
                date,
                weatherCode: code,
                tempMax: Math.round(interval.values.temperatureMax),
                tempMin: Math.round(interval.values.temperatureMin),
                precipitation: interval.values.precipitationProbability, // Tomorrow.io retorna probabilidade % ou intensidade? probability pedido nos fields.
                uvIndex: Math.round(interval.values.uvIndex || 0),
                description: weatherDetails.description,
                icon: weatherDetails.icon,
                isSunny: weatherDetails.isSunny,
            }
        })

        // Salvar no cache
        setWeatherCache(cacheKey, forecast)

        return forecast
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error)
        return []
    }
}

/**
 * Obtém cor do UV index
 */
export function getUVColor(uv: number): string {
    if (uv <= 2) return "text-green-600"
    if (uv <= 5) return "text-yellow-600"
    if (uv <= 7) return "text-orange-600"
    if (uv <= 10) return "text-red-600"
    return "text-purple-600"
}

/**
 * Obtém descrição do UV index
 */
export function getUVDescription(uv: number): string {
    if (uv <= 2) return "Baixo"
    if (uv <= 5) return "Moderado"
    if (uv <= 7) return "Alto"
    if (uv <= 10) return "Muito Alto"
    return "Extremo"
}
