import React, { useRef, useState, useEffect } from 'react';
import Tile from './Tile';
import WeatherTile from './WeatherTile';
import CalendarTile from './CalendarTile';
import ClockTile from './ClockTile';
import SpotifyAnalysisTile from './SpotifyAnalysisTile';
import NextWbcTile from './NextWbcTile';
import BlogTile from './BlogTile';
import PhotosTile from './PhotosTile';
import ResourceTile from './ResourceTile';
import ShoeDemoTile from './ShoeDemoTile';
import AdTile from './AdTile';

const Dashboard = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDown(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDown(false);
    };

    const handleMouseUp = () => {
        setIsDown(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <main 
            ref={scrollContainerRef}
            className="pt-16 md:pt-20 px-6 md:px-12 w-full mx-auto min-h-[min(100vh,950px)] pb-12 transition duration-300 md:flex md:items-center overflow-x-hidden md:overflow-x-auto md:overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            <div className="grid justify-center md:justify-start gap-3 grid-flow-dense grid-cols-[repeat(auto-fit,minmax(var(--cell),var(--cell)))] md:grid-cols-[none] auto-rows-[var(--cell)] md:grid-rows-[repeat(5,var(--cell))] uw:grid-rows-[repeat(4,var(--cell))] suw:grid-rows-[repeat(3,var(--cell))] md:grid-flow-col md:auto-cols-[var(--cell)] w-full md:w-max min-h-[min-content] pointer-events-auto">
                
                <Tile size="2x2" label="AI Vision" icon={() => <svg className="w-8 h-8 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
                
                <NextWbcTile size="2x2" />

                <PhotosTile size="2x1" />

                <Tile size="2x1" label="Network" icon={() => <svg className="w-8 h-8 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>} />

                <Tile size="2x1" label="Bangkok">
                    <WeatherTile />
                </Tile>

                <Tile size="2x2" label="Local Time">
                    <ClockTile />
                </Tile>

                <SpotifyAnalysisTile size="3x2" />

                <Tile size="2x3" label="Calendar">
                    <CalendarTile />
                </Tile>

                <BlogTile size="2x2" />

                <ShoeDemoTile size="2x2" />

                <Tile size="3x2" label="Marketplace">
                    <AdTile title="New Collection 2025" description="Discover the future of design." />
                </Tile>

                {/* Filler tiles */}
                <Tile size="1x1" />
                <Tile size="1x1" />
                <Tile size="1x1" />
                <Tile size="1x1" />
                <Tile size="1x1" />
            </div>
        </main>
    );
};

export default Dashboard;
