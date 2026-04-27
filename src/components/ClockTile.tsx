import React, { useEffect, useMemo, useState } from 'react';

const ClockTile = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = time.getHours() % 12;
    const minute = time.getMinutes();
    const second = time.getSeconds();

    const hourAngle = hour * 30 + minute * 0.5;
    const minuteAngle = minute * 6 + second * 0.1;
    const secondAngle = second * 6;

    const ticks = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);

    const amPm = time.getHours() >= 12 ? 'PM' : 'AM';

    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-stone-800 font-mono">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-stone-300 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.84)_0%,rgba(244,235,222,0.95)_62%,rgba(226,219,203,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(110,86,60,0.1)]">
                <div className="absolute inset-[10px] rounded-full border border-stone-200/70"></div>

                {ticks.map((tick) => (
                    <span
                        key={tick}
                        className="absolute left-1/2 top-1/2 h-[1px] w-1.5 bg-stone-500/70"
                        style={{
                            transform: `translate(-50%, -50%) rotate(${tick * 30}deg) translateY(-40px)`,
                            transformOrigin: 'center'
                        }}
                    />
                ))}

                <div
                    className="absolute left-1/2 top-1/2 h-8 w-[2px] origin-bottom rounded-full bg-stone-700"
                    style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }}
                />
                <div
                    className="absolute left-1/2 top-1/2 h-10 w-[1.5px] origin-bottom rounded-full bg-stone-600"
                    style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }}
                />
                <div
                    className="absolute left-1/2 top-1/2 h-11 w-[1px] origin-bottom rounded-full bg-[rgb(199,83,61)]"
                    style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)` }}
                />

                <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-800 shadow-[0_0_0_2px_rgba(255,255,255,0.4)]"></div>
            </div>

            <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} {amPm}
            </div>
            <div className="text-[8px] font-semibold uppercase opacity-70 tracking-wide mt-1 text-stone-600">Local_Time_Node</div>
        </div>
    );
};

export default ClockTile;
