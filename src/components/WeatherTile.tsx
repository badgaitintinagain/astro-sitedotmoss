import React, { useEffect, useState } from 'react';

interface WeatherSnapshot {
    city: string;
    temp: number;
    condition: string;
    bgImage: string;
}

const LIVE_WEATHER: WeatherSnapshot[] = [
    {
        city: 'Bangkok',
        temp: 32,
        condition: 'Sunny',
        bgImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'Tokyo',
        temp: 21,
        condition: 'Cloudy',
        bgImage: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'London',
        temp: 16,
        condition: 'Rain',
        bgImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'
    },
    {
        city: 'Sydney',
        temp: 24,
        condition: 'Breeze',
        bgImage: 'https://images.unsplash.com/photo-1506973035872-a4f23ad3f89a?auto=format&fit=crop&w=1200&q=80'
    }
];

const WeatherTile = () => {
    const [weatherIndex, setWeatherIndex] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);

    useEffect(() => {
        const rotateInterval = window.setInterval(() => {
            setIsSwapping(true);

            window.setTimeout(() => {
                setWeatherIndex((prev) => (prev + 1) % LIVE_WEATHER.length);
                setIsSwapping(false);
            }, 350);
        }, 60_000);

        return () => window.clearInterval(rotateInterval);
    }, []);

    const weather = LIVE_WEATHER[weatherIndex];

    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src={weather.bgImage}
                    alt={weather.city}
                    className={`h-full w-full object-cover transition-all duration-700 ${isSwapping ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,34,0.25)_0%,rgba(11,20,34,0.56)_100%)]"></div>
            </div>

            <div className={`relative z-10 flex flex-col items-center justify-center text-slate-50 transition-all duration-500 ${isSwapping ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <div className="text-2xl font-bold tracking-tight">{weather.temp}°C</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/95">{weather.condition}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-200/95">{weather.city}</div>
            </div>

            <div className="absolute right-2 top-2 z-20 rounded-none border border-white/35 bg-black/35 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-100">
                Live 1 min
            </div>
        </div>
    );
};

export default WeatherTile;
