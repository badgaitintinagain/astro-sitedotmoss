import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CityConfig {
    city: string;
    lat: number;
    lon: number;
    bgImage: string;
}

interface CityWeather {
    temp: number;
    condition: string;
}

const LIVE_WEATHER_CITIES: CityConfig[] = [
    {
        city: 'Bangkok',
        lat: 13.7563,
        lon: 100.5018,
        bgImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'Tokyo',
        lat: 35.6762,
        lon: 139.6503,
        bgImage: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'London',
        lat: 51.5072,
        lon: -0.1276,
        bgImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'Sydney',
        lat: -33.8688,
        lon: 151.2093,
        bgImage: 'https://images.unsplash.com/photo-1506973035872-a4f23ad3f89a?auto=format&fit=crop&w=1200&q=80'
    }
];

const weatherCodeToCondition = (code: number) => {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Cloudy';
    if (code === 45 || code === 48) return 'Fog';
    if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return 'Drizzle';
    if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) return 'Rain';
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return 'Snow';
    if (code === 95 || code === 96 || code === 99) return 'Storm';
    return 'Weather';
};

const TileFace = ({
    city,
    weather,
    className = ''
}: {
    city: CityConfig;
    weather?: CityWeather;
    className?: string;
}) => (
    <div
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{ backfaceVisibility: 'hidden' }}
    >
        <div className="absolute inset-0 z-0">
            <img src={city.bgImage} alt={city.city} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,36,0.24)_0%,rgba(14,23,36,0.58)_100%)]"></div>
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-slate-50">
            <div className="text-2xl font-bold tracking-tight">{weather ? `${weather.temp}°C` : '--°C'}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/95">
                {weather ? weather.condition : 'Syncing'}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200/95">{city.city}</div>
        </div>
    </div>
);

const WeatherTile = () => {
    const [cityIndex, setCityIndex] = useState(0);
    const [nextCityIndex, setNextCityIndex] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);
    const [weatherByCity, setWeatherByCity] = useState<Record<string, CityWeather>>({});
    const settleTimerRef = useRef<number | null>(null);

    const fetchWeatherForCity = useCallback(async (city: CityConfig) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather request failed for ${city.city}`);
        }

        const data = await response.json();
        const current = data?.current;
        if (!current || typeof current.temperature_2m !== 'number' || typeof current.weather_code !== 'number') {
            throw new Error(`Unexpected weather payload for ${city.city}`);
        }

        return {
            temp: Math.round(current.temperature_2m),
            condition: weatherCodeToCondition(current.weather_code)
        } as CityWeather;
    }, []);

    const syncWeather = useCallback(async () => {
        try {
            const pairs = await Promise.all(
                LIVE_WEATHER_CITIES.map(async (city) => {
                    const weather = await fetchWeatherForCity(city);
                    return [city.city, weather] as const;
                })
            );

            setWeatherByCity((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
        } catch {
            // Keep previous weather values if a request fails.
        }
    }, [fetchWeatherForCity]);

    useEffect(() => {
        syncWeather();

        const refreshInterval = window.setInterval(() => {
            syncWeather();
        }, 10 * 60_000);

        const rotateInterval = window.setInterval(() => {
            setNextCityIndex((cityIndex + 1) % LIVE_WEATHER_CITIES.length);
            setIsFlipping(true);

            settleTimerRef.current = window.setTimeout(() => {
                setCityIndex((prev) => {
                    const next = (prev + 1) % LIVE_WEATHER_CITIES.length;
                    setNextCityIndex((next + 1) % LIVE_WEATHER_CITIES.length);
                    return next;
                });
                setIsFlipping(false);
            }, 900);
        }, 60_000);

        return () => {
            window.clearInterval(rotateInterval);
            window.clearInterval(refreshInterval);
            if (settleTimerRef.current !== null) {
                window.clearTimeout(settleTimerRef.current);
            }
        };
    }, [cityIndex, syncWeather]);

    const currentCity = LIVE_WEATHER_CITIES[cityIndex];
    const upcomingCity = LIVE_WEATHER_CITIES[nextCityIndex];

    const currentWeather = useMemo(() => weatherByCity[currentCity.city], [weatherByCity, currentCity.city]);
    const nextWeather = useMemo(() => weatherByCity[upcomingCity.city], [weatherByCity, upcomingCity.city]);

    return (
        <div className="relative h-full w-full overflow-hidden" style={{ perspective: '1200px' }}>
            <div
                className="relative h-full w-full transition-transform duration-900 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipping ? 'rotateX(180deg) translateY(-1px)' : 'rotateX(0deg) translateY(0)'
                }}
            >
                <TileFace city={currentCity} weather={currentWeather} />
                <TileFace city={upcomingCity} weather={nextWeather} className="[transform:rotateX(180deg)]" />
            </div>
        </div>
    );
};

export default WeatherTile;
