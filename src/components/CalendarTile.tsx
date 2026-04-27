import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarTile = () => {
    const [date, setDate] = useState(new Date());

    return (
        <div className="w-full h-full p-2 flex flex-col font-mono text-stone-800 overflow-hidden scale-90 origin-center">
            <Calendar 
                onChange={(d: any) => setDate(d)} 
                value={date}
                className="!bg-transparent !border-none !w-full !font-mono text-xs"
            />
            <style dangerouslySetInnerHTML={{ __html: `
                .react-calendar { color: #2f281f !important; }
                .react-calendar__navigation button { color: #2f281f !important; font-weight: 900 !important; font-family: "JetBrains Mono" !important; }
                .react-calendar__tile { color: #2f281f !important; font-size: 8px !important; font-weight: bold !important; }
                .react-calendar__tile--active { background: rgba(158, 122, 88, 0.22) !important; color: #1f1b16 !important; }
                .react-calendar__tile--now { background: rgba(158, 122, 88, 0.12) !important; }
                .react-calendar__month-view__weekdays { font-size: 6px !important; text-transform: uppercase !important; color: rgba(82, 62, 45, 0.62) !important; }
            `}} />
        </div>
    );
};

export default CalendarTile;
