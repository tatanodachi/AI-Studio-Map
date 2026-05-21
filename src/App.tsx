import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MapWrapper from './components/MapWrapper';
import { ViewMode } from './types';
import { targetRegions, locations } from './data';

export default function App() {
    const [panelOpen, setPanelOpen] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('admin');
    const [activeRegions, setActiveRegions] = useState<Set<string>>(
        new Set(targetRegions.filter(r => !r.defaultOff).map(r => r.id))
    );
    const [activePOIs, setActivePOIs] = useState<Set<string>>(
        new Set(locations.map(l => l.id))
    );
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [loadingState, setLoadingState] = useState({ done: false, text: 'Loading boundaries...' });
    const [regionDataLoaded, setRegionDataLoaded] = useState<Set<string>>(new Set());
    const [mapMethods, setMapMethods] = useState<any>(null);

    // Hide status panel softly after done
    const [showStatusPanel, setShowStatusPanel] = useState(true);
    useEffect(() => {
        if (loadingState.done) {
            const timer = setTimeout(() => setShowStatusPanel(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [loadingState.done]);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <div className="vignette"></div>

            {/* Map Status Panel */}
            <div 
                className={`status-panel z-[1000] transition-opacity duration-500`}
                style={{ opacity: showStatusPanel ? 1 : 0, pointerEvents: 'none' }}
            >
                <span className="status-dot" style={{ animation: loadingState.done ? 'none' : 'pulse 1.5s infinite ease-in-out', backgroundColor: '#1C6048' }}></span>
                <span>{loadingState.text}</span>
            </div>

            {/* Floating Pull-Down Button */}
            <div 
                className={`open-panel-btn ${!panelOpen ? 'visible' : ''}`}
                title="Open Dashboard"
                onClick={() => setPanelOpen(true)}
            >
                <span>Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            <Dashboard
                panelOpen={panelOpen}
                setPanelOpen={setPanelOpen}
                viewMode={viewMode}
                setViewMode={setViewMode}
                activeRegions={activeRegions}
                setActiveRegions={setActiveRegions}
                activePOIs={activePOIs}
                setActivePOIs={setActivePOIs}
                mapMethods={mapMethods}
                regionDataLoaded={regionDataLoaded}
            />

            {/* Floating Action Button for Measurement Tool */}
            <div 
                className={`measure-btn ${isMeasuring ? 'active' : ''}`}
                title="Measure Distance"
                onClick={() => setIsMeasuring(!isMeasuring)}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5" cy="19" r="2"></circle>
                    <circle cx="19" cy="5" r="2"></circle>
                    <path d="M6.5 17.5L17.5 6.5"></path>
                </svg>
            </div>

            <MapWrapper 
                viewMode={viewMode}
                activeRegions={activeRegions}
                activePOIs={activePOIs}
                isMeasuring={isMeasuring}
                setLoadingState={setLoadingState}
                setRegionDataLoaded={setRegionDataLoaded}
                onMapReady={setMapMethods}
            />
        </div>
    );
}
