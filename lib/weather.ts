/**
 * Serviço de integração com Open-Meteo API
 * API gratuita de previsão do tempo (sem chave)
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

// Mapeamento de códigos WMO (Open-Meteo) para descrições e ícones
// https://open-meteo.com/en/docs
const weatherCodeMap: Record<number, { description: string; icon: string; isSunny: boolean }> = {
    0: { description: "Céu Limpo", icon: "☀️", isSunny: true },
    1: { description: "Predominantemente Limpo", icon: "🌤️", isSunny: true },
    2: { description: "Parcialmente Nublado", icon: "⛅", isSunny: true },
    3: { description: "Nublado", icon: "☁️", isSunny: false },
    45: { description: "Nevoeiro", icon: "🌫️", isSunny: false },
    48: { description: "Nevoeiro com Geada", icon: "🌫️", isSunny: false },
    51: { description: "Garoa Leve", icon: "🌦️", isSunny: false },
    53: { description: "Garoa Moderada", icon: "🌦️", isSunny: false },
    55: { description: "Garoa Densa", icon: "🌦️", isSunny: false },
    56: { description: "Garoa Congelante Leve", icon: "🌧️", isSunny: false },
    57: { description: "Garoa Congelante Densa", icon: "🌧️", isSunny: false },
    61: { description: "Chuva Leve", icon: "🌧️", isSunny: false },
    63: { description: "Chuva Moderada", icon: "🌧️", isSunny: false },
    65: { description: "Chuva Forte", icon: "🌧️", isSunny: false },
    66: { description: "Chuva Congelante Leve", icon: "🌧️", isSunny: false },
    67: { description: "Chuva Congelante Forte", icon: "🌧️", isSunny: false },
    71: { description: "Neve Leve", icon: "🌨️", isSunny: false },
    73: { description: "Neve Moderada", icon: "🌨️", isSunny: false },
    75: { description: "Neve Forte", icon: "🌨️", isSunny: false },
    77: { description: "Grãos de Neve", icon: "🌨️", isSunny: false },
    80: { description: "Pancadas de Chuva Leves", icon: "🌦️", isSunny: false },
    81: { description: "Pancadas de Chuva Moderadas", icon: "🌦️", isSunny: false },
    82: { description: "Pancadas de Chuva Violentas", icon: "⛈️", isSunny: false },
    85: { description: "Pancadas de Neve Leves", icon: "🌨️", isSunny: false },
    86: { description: "Pancadas de Neve Fortes", icon: "🌨️", isSunny: false },
    95: { description: "Tempestade", icon: "⛈️", isSunny: false },
    96: { description: "Tempestade com Granizo Leve", icon: "⛈️", isSunny: false },
    99: { description: "Tempestade com Granizo Forte", icon: "⛈️", isSunny: false },
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
        precipitation_probability_max: number[]
        uv_index_max: number[]
    }
}

// Cache de 2 horas para previsão do tempo
const WEATHER_CACHE_KEY = 'sunsync_weather_cache_openmeteo_v1'
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

// Função para gerar dados de clima simulados (Fallback)
function getMockWeather(): WeatherDay[] {
    const mockWeather: WeatherDay[] = []
    const today = new Date()

    // Gerar 7 dias
    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        // Alternar entre dias de sol e nublado para parecer real
        const isSunny = [0, 1, 3, 4, 6].includes(i)

        mockWeather.push({
            date: dateStr,
            weatherCode: isSunny ? 0 : 3, // 0 = Limpo, 3 = Nublado
            tempMax: isSunny ? 28 + Math.floor(Math.random() * 5) : 22 + Math.floor(Math.random() * 3),
            tempMin: isSunny ? 18 + Math.floor(Math.random() * 3) : 16 + Math.floor(Math.random() * 2),
            precipitation: isSunny ? 0 : 40 + Math.floor(Math.random() * 40),
            uvIndex: isSunny ? 8 + Math.floor(Math.random() * 3) : 3,
            description: isSunny ? "Céu Limpo" : "Nublado",
            icon: isSunny ? "☀️" : "☁️",
            isSunny: isSunny
        })
    }

    return mockWeather
}

/**
 * Busca previsão do tempo para os próximos 7 dias (com cache de 2h) usando Open-Meteo
 * @param lat Latitude (padrão: São Paulo)
 * @param lng Longitude (padrão: São Paulo)
 */
export async function getWeatherForecast(lat: number = -23.55, lng: number = -46.63): Promise<WeatherDay[]> {
    const cacheKey = `${lat},${lng},7days`

    // Tentar cache primeiro
    const cached = getWeatherCache(cacheKey)
    if (cached) return cached

    try {
        // Open-Meteo API: forecast_days=7
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=America%2FSao_Paulo&forecast_days=7`

        const response = await fetch(url)

        if (!response.ok) {
            console.warn(`Open-Meteo API falhou (${response.status}). Usando dados simulados.`)
            throw new Error('Falha ao buscar previsão do tempo (Open-Meteo)')
        }

        const data: OpenMeteoResponse = await response.json()
        const daily = data.daily

        if (!daily || !daily.time) {
            return getMockWeather()
        }

        const forecast: WeatherDay[] = daily.time.map((time, index) => {
            const code = daily.weather_code[index]
            const weatherDetails = getWeatherDetails(code)

            return {
                date: time,
                weatherCode: code,
                tempMax: Math.round(daily.temperature_2m_max[index]),
                tempMin: Math.round(daily.temperature_2m_min[index]),
                precipitation: daily.precipitation_probability_max[index] || 0,
                uvIndex: Math.round(daily.uv_index_max[index] || 0),
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
        const mockData = getMockWeather()
        setWeatherCache(cacheKey, mockData)
        return mockData
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
