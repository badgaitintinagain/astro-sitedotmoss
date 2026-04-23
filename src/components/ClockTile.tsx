import React, { useEffect, useState } from 'react';

const ClockTile = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-white font-mono">
            <div className="text-3xl font-semibold tracking-tighter tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="text-[8px] font-semibold uppercase opacity-50 tracking-wide mt-1">Local_Time_Node</div>
        </div>
    );
};

export default ClockTile;
