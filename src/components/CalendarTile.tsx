import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarTile = () => {
    const [date, setDate] = useState(new Date());

    return (
        <div className="w-full h-full p-2 flex flex-col font-mono text-white overflow-hidden scale-90 origin-center">
            <Calendar 
                onChange={(d: any) => setDate(d)} 
                value={date}
                className="!bg-transparent !border-none !w-full !font-mono text-xs"
            />
            <style dangerouslySetInnerHTML={{ __html: `
                .react-calendar { color: white !important; }
                .react-calendar__navigation button { color: white !important; font-weight: 900 !important; font-family: "JetBrains Mono" !important; }
                .react-calendar__tile { color: white !important; font-size: 8px !important; font-weight: bold !important; }
                .react-calendar__tile--active { background: rgba(255, 255, 255, 0.2) !important; color: white !important; }
                .react-calendar__tile--now { background: rgba(255, 255, 255, 0.1) !important; }
                .react-calendar__month-view__weekdays { font-size: 6px !important; text-transform: uppercase !important; color: rgba(255, 255, 255, 0.5) !important; }
            `}} />
        </div>
    );
};

export default CalendarTile;
