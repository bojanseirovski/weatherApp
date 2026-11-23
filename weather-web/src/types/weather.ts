export type ForecastDay = {
    date: string
    maxtemp: number | null
    mintemp: number | null
    condition: string | null
    condition_icon: string | null
}

export type Forecast = {
    city: string
    region: string | null
    updated_at: string | null
    fetched_at: string
    units: { temperature: string }
    source: string
    days: ForecastDay[]
}