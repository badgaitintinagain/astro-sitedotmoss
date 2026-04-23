import React, { useEffect, useState } from 'react';

const WeatherTile = () => {
    const [weather, setWeather] = useState<any>(null);

    useEffect(() => {
        // Simplified weather fetch
        setWeather({ temp: 32, condition: 'Sunny', city: 'Bangkok' });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-white">
            {weather ? (
                <>
                    <div className="text-2xl font-semibold">{weather.temp}°C</div>
                    <div className="text-xs font-semibold uppercase opacity-60 tracking-wide">{weather.condition}</div>
                </>
            ) : (
                <div className="text-xs font-semibold animate-pulse uppercase">Syncing...</div>
            )}
        </div>
    );
};

export default WeatherTile;
