import { useState, useMemo } from 'react';
import { ViewMode } from '../types';
import { targetRegions, locations } from '../data';
import Switch from './Switch';
import DemographicsPyramid from './DemographicsPyramid';

interface DashboardProps {
    panelOpen: boolean;
    setPanelOpen: (open: boolean) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    activeRegions: Set<string>;
    setActiveRegions: (regions: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    activePOIs: Set<string>;
    setActivePOIs: (pois: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    mapMethods: any;
    regionDataLoaded: Set<string>;
}

export default function Dashboard({
    panelOpen, setPanelOpen, viewMode, setViewMode, activeRegions, setActiveRegions,
    activePOIs, setActivePOIs, mapMethods, regionDataLoaded
}: DashboardProps) {
    
    // UI Layout states
    const [regionsCollapsed, setRegionsCollapsed] = useState(false);
    const [poisCollapsed, setPoisCollapsed] = useState(true);
    const [pyramidShrunk, setPyramidShrunk] = useState(true);
    const [collapsedRegionGroups, setCollapsedRegionGroups] = useState<Record<string, boolean>>(
        { "DKI Jakarta": true, "Banten": true, "West Java": true }
    );

    const groupedRegions = useMemo(() => {
        const groups: Record<string, typeof targetRegions> = {};
        targetRegions.forEach(r => {
            if (!groups[r.group]) groups[r.group] = [];
            groups[r.group].push(r);
        });
        return groups;
    }, []);

    const allPOIAreActive = locations.every(l => activePOIs.has(l.id));

    const handlePyramidExpand = () => {
        setPyramidShrunk(!pyramidShrunk);
        if (pyramidShrunk) { // Expanding
            setRegionsCollapsed(false);
        }
    };

    return (
        <div className={`top-panel-container ${!panelOpen ? 'collapsed-panel' : ''}`}>
            <div className="control-panel">
                
                {/* COLUMN 1: Main Controls */}
                <div className="panel-col">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E2f31', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                            <span>Dashboard</span>
                        </div>
                        <div onClick={() => setPanelOpen(false)} title="Hide Panel" style={{ cursor: 'pointer', color: '#9B8B70', transition: 'color 0.2s ease' }} className="hover:text-red-500">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>

                    <select 
                        className="view-dropdown" 
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    >
                        <option value="admin">Administrative Regions</option>
                        <option value="population">Total Population</option>
                        <option value="density">Population Density</option>
                        <option value="economy">Economic Profile (GDRP)</option>
                        <option value="commuter">Commuter Flow (% to Core)</option>
                        <option value="age">Age Demographics (Median Age)</option>
                    </select>

                    <Legend viewMode={viewMode} />
                </div>

                {/* COLUMN 2: Regions List */}
                <div className="panel-col">
                    <div className="section-header" onClick={() => setRegionsCollapsed(!regionsCollapsed)}>
                        <span>Regions Layer</span>
                        <svg className={`chevron ${regionsCollapsed ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div className="scrollable-list" style={{ display: regionsCollapsed ? 'none' : 'block' }}>
                        {Object.entries(groupedRegions).map(([groupName, regions]) => {
                            const groupIsCollapsed = collapsedRegionGroups[groupName];
                            const allGroupActive = regions.every(r => activeRegions.has(r.id));
                            return (
                                <div key={groupName}>
                                    <div className="group-header">
                                        <div 
                                            className="group-header-title" 
                                            onClick={() => setCollapsedRegionGroups(prev => ({...prev, [groupName]: !groupIsCollapsed}))}
                                        >
                                            <svg className={`chevron ${groupIsCollapsed ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> 
                                            <span>{groupName}</span>
                                        </div>
                                        <Switch 
                                            className="group-switch"
                                            checked={allGroupActive} 
                                            onChange={(checked) => {
                                                setActiveRegions(prev => {
                                                    const next = new Set(prev);
                                                    regions.forEach(r => checked ? next.add(r.id) : next.delete(r.id));
                                                    return next;
                                                });
                                            }} 
                                        />
                                    </div>
                                    <div className="group-content" style={{ display: groupIsCollapsed ? 'none' : 'block' }}>
                                        {regions.map(region => {
                                            const isLoaded = regionDataLoaded.has(region.id);
                                            return (
                                                <div 
                                                    className="region-item" 
                                                    key={region.id}
                                                    onMouseEnter={() => mapMethods?.onRegionHover(region.id)}
                                                    onMouseLeave={() => mapMethods?.onRegionLeave(region.id)}
                                                >
                                                    <div 
                                                        className="region-item-text" 
                                                        title="Click to focus camera"
                                                        onClick={() => mapMethods?.flyToRegion(region.id)}
                                                    >
                                                        <span>{region.name}</span>
                                                        {!isLoaded && <span className="loading-text ml-1">(loading...)</span>}
                                                    </div>
                                                    <Switch 
                                                        className="item-switch"
                                                        disabled={!isLoaded}
                                                        checked={activeRegions.has(region.id)}
                                                        onChange={(checked) => {
                                                            setActiveRegions(prev => {
                                                                const next = new Set(prev);
                                                                checked ? next.add(region.id) : next.delete(region.id);
                                                                return next;
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* COLUMN 3: Point of Interests */}
                <div className="panel-col">
                    <div className="section-header" onClick={() => setPoisCollapsed(!poisCollapsed)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexGrow: 1 }}>
                            <span>Points of Interest</span>
                            <svg className={`chevron ${poisCollapsed ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
                            <Switch 
                                className="group-switch"
                                checked={allPOIAreActive}
                                onChange={(checked) => {
                                    if (checked) {
                                        setActivePOIs(new Set(locations.map(l => l.id)));
                                    } else {
                                        setActivePOIs(new Set());
                                    }
                                }}
                            />
                        </div>
                    </div>
                    
                    <div className="group-content scrollable-list" style={{ display: poisCollapsed ? 'none' : 'block' }}>
                        {locations.map(loc => (
                            <div className="poi-item" key={loc.id}>
                                <div 
                                    className="poi-title-container hover:text-[#1c6048] transition-colors"
                                    onClick={() => mapMethods?.flyToLatLng(loc.lat, loc.lon)}
                                >
                                    <span style={{ fontWeight: 600 }}>{loc.name}</span>
                                    <span className="poi-desc">{loc.desc}</span>
                                </div>
                                <Switch 
                                    className="item-switch"
                                    checked={activePOIs.has(loc.id)}
                                    onChange={(checked) => {
                                        setActivePOIs(prev => {
                                            const next = new Set(prev);
                                            checked ? next.add(loc.id) : next.delete(loc.id);
                                            return next;
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMN 4: Demographics Pyramid */}
                <DemographicsPyramid 
                    activeRegions={activeRegions} 
                    pyramidShrunk={pyramidShrunk}
                    onToggleExpand={handlePyramidExpand}
                />
            </div>
        </div>
    );
}

// Map Legend Component extracted
function Legend({ viewMode }: { viewMode: ViewMode }) {
    if (viewMode === 'admin') return null;

    return (
        <div className="map-legend" style={{ display: 'block' }}>
            {viewMode === 'population' && (
                <>
                    <div className="legend-title">Total Population</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#7C3A21'}}></div>&gt; 3.0 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#A95C3E'}}></div>2.0 - 3.0 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#D08C70'}}></div>1.5 - 2.0 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#E8C2B3'}}></div>&lt; 1.5 Million</div>
                </>
            )}
            {viewMode === 'density' && (
                <>
                    <div className="legend-title">People / km²</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#134433'}}></div>&gt; 15,000</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#1C6048'}}></div>10,000 - 15,000</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#41856B'}}></div>5,000 - 10,000</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#99B6AA'}}></div>&lt; 5,000</div>
                </>
            )}
            {viewMode === 'economy' && (
                <>
                    <div className="legend-title">Estimated GDRP (IDR/year)</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#8C7A5E'}}></div>&gt; 500 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#AFA189'}}></div>300 - 500 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#C8BEAC'}}></div>100 - 300 Million</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#E1DCD3'}}></div>&lt; 100 Million</div>
                </>
            )}
            {viewMode === 'commuter' && (
                <>
                    <div className="legend-title">Commuters to Core (%)</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#1E3A8A'}}></div>&gt; 60%</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#3B82F6'}}></div>45% - 60%</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#60A5FA'}}></div>30% - 45%</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#DBEAFE'}}></div>&lt; 30%</div>
                </>
            )}
            {viewMode === 'age' && (
                <>
                    <div className="legend-title">Median Age (Years)</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#581C87'}}></div>&gt;= 31 Years</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#8B5CF6'}}></div>29 - 30 Years</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#C084FC'}}></div>27 - 28 Years</div>
                    <div className="legend-item"><div className="legend-color" style={{background:'#F3E8FF'}}></div>&lt; 27 Years</div>
                </>
            )}
        </div>
    );
}

