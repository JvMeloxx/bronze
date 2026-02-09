/**
 * Serviço de integração com Open-Meteo API
 * API gratuita de previsão do tempo (não requer API key)
 * https://open-meteo.com/
 */

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

// Mapeamento de códigos WMO para descrições e ícones
const weatherCodeMap: Record<number, { description: string; icon: string; isSunny: boolean }> = {
    0: { description: "Céu limpo", icon: "☀️", isSunny: true },
    1: { description: "Predominantemente limpo", icon: "🌤️", isSunny: true },
    2: { description: "Parcialmente nublado", icon: "⛅", isSunny: true },
    3: { description: "Nublado", icon: "☁️", isSunny: false },
    45: { description: "Nevoeiro", icon: "🌫️", isSunny: false },
    48: { description: "Nevoeiro com geada", icon: "🌫️", isSunny: false },
    51: { description: "Garoa leve", icon: "🌦️", isSunny: false },
    53: { description: "Garoa moderada", icon: "🌦️", isSunny: false },
    55: { description: "Garoa intensa", icon: "🌧️", isSunny: false },
    56: { description: "Garoa congelante", icon: "🌧️", isSunny: false },
    57: { description: "Garoa congelante intensa", icon: "🌧️", isSunny: false },
    61: { description: "Chuva leve", icon: "🌧️", isSunny: false },
    63: { description: "Chuva moderada", icon: "🌧️", isSunny: false },
    65: { description: "Chuva forte", icon: "🌧️", isSunny: false },
    66: { description: "Chuva congelante", icon: "🌧️", isSunny: false },
    67: { description: "Chuva congelante forte", icon: "🌧️", isSunny: false },
    71: { description: "Neve leve", icon: "🌨️", isSunny: false },
    73: { description: "Neve moderada", icon: "🌨️", isSunny: false },
    75: { description: "Neve forte", icon: "🌨️", isSunny: false },
    77: { description: "Granizo", icon: "🌨️", isSunny: false },
    80: { description: "Pancadas de chuva", icon: "🌦️", isSunny: false },
    81: { description: "Pancadas de chuva moderadas", icon: "🌧️", isSunny: false },
    82: { description: "Pancadas de chuva violentas", icon: "⛈️", isSunny: false },
    85: { description: "Pancadas de neve", icon: "🌨️", isSunny: false },
    86: { description: "Pancadas de neve intensas", icon: "🌨️", isSunny: false },
    95: { description: "Tempestade", icon: "⛈️", isSunny: false },
    96: { description: "Tempestade com granizo", icon: "⛈️", isSunny: false },
    99: { description: "Tempestade severa", icon: "⛈️", isSunny: false },
}

// Função para obter detalhes do código do tempo
function getWeatherDetails(code: number): { description: string; icon: string; isSunny: boolean } {
    return weatherCodeMap[code] || { description: "Indisponível", icon: "❓", isSunny: false }
}

// Interface da resposta da API Open-Meteo
interface OpenMeteoResponse {
    daily: {
        time: string[]
        weather_code: number[]
        temperature_2m_max: number[]
        temperature_2m_min: number[]
        precipitation_sum: number[]
        uv_index_max: number[]
    }
}

// Cache de 2 horas para previsão do tempo
const WEATHER_CACHE_KEY = 'sunsync_weather_cache'
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
 * Busca previsão do tempo para os próximos 14 dias (com cache de 2h)
 * @param lat Latitude (padrão: São Paulo)
 * @param lng Longitude (padrão: São Paulo)
 */
export async function getWeatherForecast(lat: number = -23.55, lng: number = -46.63): Promise<WeatherDay[]> {
    const cacheKey = `${lat},${lng}`

    // Tentar cache primeiro
    const cached = getWeatherCache(cacheKey)
    if (cached) return cached

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=America/Sao_Paulo&forecast_days=7`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Falha ao buscar previsão do tempo')
        }

        const data: OpenMeteoResponse = await response.json()

        const forecast: WeatherDay[] = data.daily.time.map((date, index) => {
            const weatherDetails = getWeatherDetails(data.daily.weather_code[index])

            return {
                date,
                weatherCode: data.daily.weather_code[index],
                tempMax: Math.round(data.daily.temperature_2m_max[index]),
                tempMin: Math.round(data.daily.temperature_2m_min[index]),
                precipitation: data.daily.precipitation_sum[index],
                uvIndex: Math.round(data.daily.uv_index_max[index]),
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
