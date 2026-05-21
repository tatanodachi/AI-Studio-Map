import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { targetRegions, locations } from '../data';
import { ViewMode, Region, POI } from '../types';
import {
    getDensityColor, getEconomyColor, getPopulationColor, 
    getCommuterColor, getAgeColor, getTooltipContent, 
    getRegionGroupColor, isBoundsValid, isLatLngValid
} from '../utils';

interface MapWrapperProps {
    viewMode: ViewMode;
    activeRegions: Set<string>;
    activePOIs: Set<string>;
    isMeasuring: boolean;
    setLoadingState: (state: { done: boolean, text: string }) => void;
    setRegionDataLoaded: (cb: (prev: Set<string>) => Set<string>) => void;
    onMapReady: (methods: any) => void;
}

export default function MapWrapper({
    viewMode, activeRegions, activePOIs, isMeasuring, 
    setLoadingState, setRegionDataLoaded, onMapReady
}: MapWrapperProps) {
    const mapRef = useRef<L.Map | null>(null);
    const regionLayersRef = useRef<Record<string, L.GeoJSON>>({});
    const regionDataMapRef = useRef<Record<string, Region & { groupColor: string }>>({});
    const poiMasterGroupRef = useRef<L.LayerGroup | null>(null);
    const poiLayerGroupsRef = useRef<Record<string, L.LayerGroup>>({});
    
    // Tools references to prevent stale closures
    const viewModeRef = useRef(viewMode);
    const activeRegionsRef = useRef(activeRegions);
    const isMeasuringRef = useRef(isMeasuring);
    useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
    useEffect(() => { activeRegionsRef.current = activeRegions; }, [activeRegions]);
    useEffect(() => { isMeasuringRef.current = isMeasuring; }, [isMeasuring]);

    // Hover tooltips state
    const hoverTooltipRef = useRef(L.tooltip({ className: 'custom-tooltip', direction: 'top', offset: [0, -10] }));
    const [hoverContext, setHoverContext] = useState<any>({ timeout: null, intentTimeout: null, mouseLatLng: null });
    
    // Measure tool state
    const measureStateRef = useRef({
        points: [] as L.LatLng[],
        line: null as L.Polyline | null,
        dynamicLine: null as L.Polyline | null,
        dynamicTooltip: null as L.Tooltip | null,
        markers: [] as L.CircleMarker[]
    });

    // Helper
    const applyLayerStyle = (layer: L.GeoJSON, regionId: string, isHovered: boolean) => {
        const region = regionDataMapRef.current[regionId];
        if (!region) return;
        const currentViewMode = viewModeRef.current;

        if (currentViewMode === 'admin') {
            layer.setStyle({
                color: region.groupColor, weight: isHovered ? 2.5 : 1.5,
                dashArray: '4, 4', fillColor: region.groupColor, fillOpacity: isHovered ? 0.35 : 0.20
            });
        } else {
            let fillColor;
            if (currentViewMode === 'density') fillColor = getDensityColor(region.density);
            else if (currentViewMode === 'economy') fillColor = getEconomyColor(region.income);
            else if (currentViewMode === 'population') fillColor = getPopulationColor(region.population);
            else if (currentViewMode === 'commuter') fillColor = getCommuterColor(region.commuter);
            else if (currentViewMode === 'age') fillColor = getAgeColor(region.medianAge);
            
            layer.setStyle({
                color: '#EFEBE7', weight: isHovered ? 2.5 : 1.2,
                dashArray: '', fillColor: fillColor, fillOpacity: isHovered ? 0.95 : 0.75
            });
        }
    };

    const flyToWithOffset = (bounds: L.LatLngBounds, isPoint = false) => {
        if (!mapRef.current) return;
        const paddingTop = window.innerWidth > 768 ? window.innerHeight * 0.45 : 180;
        const options: L.FitBoundsOptions = {
            paddingTopLeft: [40, paddingTop],
            paddingBottomRight: [40, 40],
            duration: 1.8,
            easeLinearity: 0.25
        };
        if (isPoint) options.maxZoom = 13.5;
        mapRef.current.flyToBounds(bounds, options);
    };

    const handleRegionHover = (regionId: string, customLatLng?: L.LatLng) => {
        if (isMeasuringRef.current) return;
        const layer = regionLayersRef.current[regionId];
        if (layer && mapRef.current?.hasLayer(layer)) {
            applyLayerStyle(layer, regionId, true);
            if (layer.bringToFront) layer.bringToFront();
            const latlng = customLatLng || layer.getBounds().getCenter();
            if (isLatLngValid(latlng)) {
                hoverTooltipRef.current
                    .setLatLng(latlng)
                    .setContent(getTooltipContent(regionDataMapRef.current[regionId], viewModeRef.current))
                    .addTo(mapRef.current!);
            }
        }
    };

    const handleRegionLeave = (regionId: string) => {
        const layer = regionLayersRef.current[regionId];
        if (layer && mapRef.current?.hasLayer(layer)) {
            applyLayerStyle(layer, regionId, false);
        }
        if (mapRef.current?.hasLayer(hoverTooltipRef.current)) {
            mapRef.current.removeLayer(hoverTooltipRef.current);
        }
    };

    useEffect(() => {
        if (mapRef.current) return; // Prevent double initialization

        const mapInstance = L.map('map', { zoomControl: false }).setView([-6.2400, 106.8300], 11);
        L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance);

        mapInstance.createPane('ringsPane');
        mapInstance.getPane('ringsPane')!.style.zIndex = '410';
        mapInstance.createPane('markersPane');
        mapInstance.getPane('markersPane')!.style.zIndex = '420';

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(mapInstance);

        mapRef.current = mapInstance;

        // Initialize POIs
        poiMasterGroupRef.current = L.layerGroup().addTo(mapInstance);
        locations.forEach(loc => {
            const singlePoiGroup = L.layerGroup();
            if (loc.radii) {
                loc.radii.sort((a, b) => b - a).forEach((radius, index) => {
                    const isOuter = index === 0;
                    L.circle([loc.lat, loc.lon], {
                        radius: radius, color: '#9B8B70', weight: isOuter ? 2 : 2.5,
                        dashArray: isOuter ? '4, 8' : '6, 6', fillColor: '#9B8B70',
                        fillOpacity: isOuter ? 0.3 : 0.35, interactive: false, pane: 'ringsPane',
                        className: isOuter ? 'breathe-outer' : 'breathe-inner'
                    }).addTo(singlePoiGroup);
                });
            }
            const marker = L.circleMarker([loc.lat, loc.lon], {
                radius: 8, fillColor: loc.color, color: '#EFEBE7', weight: 2,
                opacity: 1, fillOpacity: 0.9, pane: 'markersPane'
            }).addTo(singlePoiGroup);

            marker.bindTooltip(`<b>${loc.name}</b><br><span style="font-size:11px;color:#777;">${loc.desc}</span>`, { direction: 'top', offset: [0, -10], className: 'custom-tooltip' });
            
            singlePoiGroup.addTo(poiMasterGroupRef.current!);
            poiLayerGroupsRef.current[loc.id] = singlePoiGroup;
        });

        onMapReady({
            flyToRegion: (id: string) => {
                const layer = regionLayersRef.current[id];
                if (layer && mapRef.current?.hasLayer(layer)) {
                    const bounds = layer.getBounds();
                    if (isBoundsValid(bounds)) flyToWithOffset(bounds);
                }
            },
            flyToLatLng: (lat: number, lon: number) => {
                const targetBounds = L.latLngBounds([lat, lon], [lat, lon]);
                flyToWithOffset(targetBounds, true);
            },
            onRegionHover: handleRegionHover,
            onRegionLeave: handleRegionLeave
        });

        // Load Region Borders
        const loadRegions = async () => {
            let loadedCount = 0;
            for (const region of targetRegions) {
                setLoadingState({ done: false, text: `Loading boundary: ${region.name} (${loadedCount + 1}/${targetRegions.length})` });
                try {
                    let data;
                    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region.query)}&polygon_geojson=1&format=json&email=canvas_map_tester@example.com`;
                    try {
                        const response = await fetch(apiUrl);
                        if (!response.ok) throw new Error("Network error");
                        data = await response.json();
                    } catch (err) {
                        const proxyUrl2 = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
                        const proxyResponse2 = await fetch(proxyUrl2);
                        const proxyData = await proxyResponse2.json();
                        if (proxyData && proxyData.contents) {
                            data = JSON.parse(proxyData.contents);
                        } else throw err;
                    }

                    if (data && data.length > 0 && data[0].geojson) {
                        regionDataMapRef.current[region.id] = { ...region, groupColor: getRegionGroupColor(region.group) };
                        const layer = L.geoJSON(data[0].geojson, { className: 'region-polygon' });
                        
                        if (isBoundsValid(layer.getBounds())) {
                            applyLayerStyle(layer, region.id, false);

                            let currentMouseLatLng: L.LatLng | null = null;
                            let intTimeout: any = null;
                            let timeout: any = null;

                            layer.on('mouseover', (e) => {
                                applyLayerStyle(layer, region.id, true);
                                currentMouseLatLng = e.latlng;
                                clearTimeout(intTimeout); clearTimeout(timeout);
                                intTimeout = setTimeout(() => {
                                    if (currentMouseLatLng && isLatLngValid(currentMouseLatLng)) {
                                        hoverTooltipRef.current
                                            .setLatLng(currentMouseLatLng)
                                            .setContent(getTooltipContent(regionDataMapRef.current[region.id], viewModeRef.current))
                                            .addTo(mapRef.current!);
                                        timeout = setTimeout(() => {
                                            if (mapRef.current?.hasLayer(hoverTooltipRef.current)) {
                                                mapRef.current.removeLayer(hoverTooltipRef.current);
                                            }
                                        }, 1000);
                                    }
                                }, 500);
                            });

                            layer.on('mousemove', (e) => currentMouseLatLng = e.latlng);
                            layer.on('mouseout', () => {
                                applyLayerStyle(layer, region.id, false);
                                clearTimeout(intTimeout); clearTimeout(timeout);
                                if (mapRef.current?.hasLayer(hoverTooltipRef.current)) {
                                    mapRef.current.removeLayer(hoverTooltipRef.current);
                                }
                            });
                            
                            layer.bindPopup(() => getTooltipContent(regionDataMapRef.current[region.id], viewModeRef.current));
                            regionLayersRef.current[region.id] = layer;

                            if (activeRegionsRef.current.has(region.id)) {
                                layer.addTo(mapRef.current!);
                            }
                            setRegionDataLoaded((prev) => new Set(prev).add(region.id));
                        }
                    }
                } catch (error) {
                    console.error(`Failed loading: ${region.name}`, error);
                }
                loadedCount++;
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
            
            setLoadingState({ done: true, text: "Region boundaries successfully loaded" });
            
            // Initial Fly
            const loadedLayers = Object.values(regionLayersRef.current).filter(layer => layer && typeof layer.getBounds === 'function' && isBoundsValid(layer.getBounds()));
            if (loadedLayers.length > 0) {
                const boundaryGroup = L.featureGroup(loadedLayers);
                const bounds = boundaryGroup.getBounds();
                if (isBoundsValid(bounds)) {
                    mapInstance.invalidateSize();
                    flyToWithOffset(bounds);
                }
            }
        };
        
        loadRegions();
    }, []); // Run only once

    // Sync View Mode
    useEffect(() => {
        Object.keys(regionLayersRef.current).forEach(id => {
            const layer = regionLayersRef.current[id];
            if (layer && mapRef.current?.hasLayer(layer)) {
                applyLayerStyle(layer, id, false);
                layer.setPopupContent(getTooltipContent(regionDataMapRef.current[id], viewMode));
            }
        });
    }, [viewMode]);

    // Sync Active Regions
    useEffect(() => {
        Object.keys(regionLayersRef.current).forEach(id => {
            const layer = regionLayersRef.current[id];
            if (activeRegions.has(id)) {
                if (!mapRef.current?.hasLayer(layer)) {
                    layer.addTo(mapRef.current!);
                    applyLayerStyle(layer, id, false); // Ensure correct style on add
                }
            } else {
                if (mapRef.current?.hasLayer(layer)) {
                    mapRef.current.removeLayer(layer);
                }
            }
        });
    }, [activeRegions]);

    // Sync Active POIs
    useEffect(() => {
        if (!poiMasterGroupRef.current) return;
        locations.forEach(loc => {
            const layerGroup = poiLayerGroupsRef.current[loc.id];
            if (activePOIs.has(loc.id)) {
                if (!poiMasterGroupRef.current!.hasLayer(layerGroup)) {
                    poiMasterGroupRef.current!.addLayer(layerGroup);
                }
            } else {
                if (poiMasterGroupRef.current!.hasLayer(layerGroup)) {
                    poiMasterGroupRef.current!.removeLayer(layerGroup);
                }
            }
        });
    }, [activePOIs]);

    // Measurement Tool Logic
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const state = measureStateRef.current;

        const clearMeasure = () => {
            state.points = [];
            if (state.line) map.removeLayer(state.line);
            if (state.dynamicLine) map.removeLayer(state.dynamicLine);
            if (state.dynamicTooltip && map.hasLayer(state.dynamicTooltip)) map.removeLayer(state.dynamicTooltip);
            state.markers.forEach(m => map.removeLayer(m));
            state.markers = [];
            state.line = null;
            state.dynamicLine = null;
        };

        const onMeasureClick = (e: L.LeafletMouseEvent) => {
            if (state.points.length === 0 || state.points.length === 2) {
                clearMeasure();
                state.points.push(e.latlng);
                const marker = L.circleMarker(e.latlng, { radius: 5, fillColor: '#1C6048', color: '#EFEBE7', weight: 2, fillOpacity: 1, pane: 'markersPane' }).addTo(map);
                state.markers.push(marker);
                state.dynamicLine = L.polyline([e.latlng, e.latlng], { color: '#1C6048', weight: 2.5, dashArray: '6, 8', pane: 'ringsPane' }).addTo(map);
                state.dynamicTooltip = L.tooltip({ permanent: true, className: 'measure-tooltip', direction: 'center' }).setLatLng(e.latlng).setContent('0.00 km').addTo(map);
            } else if (state.points.length === 1) {
                state.points.push(e.latlng);
                const marker = L.circleMarker(e.latlng, { radius: 5, fillColor: '#1C6048', color: '#EFEBE7', weight: 2, fillOpacity: 1, pane: 'markersPane' }).addTo(map);
                state.markers.push(marker);

                if (state.dynamicLine) map.removeLayer(state.dynamicLine);
                state.line = L.polyline(state.points, { color: '#1C6048', weight: 2.5, dashArray: '6, 8', pane: 'ringsPane' }).addTo(map);

                const distance = (map.distance(state.points[0], state.points[1]) / 1000).toFixed(2);
                state.dynamicTooltip!.setLatLng([(state.points[0].lat + state.points[1].lat) / 2, (state.points[0].lng + state.points[1].lng) / 2]).setContent(`${distance} km`);
            }
        };

        const onMeasureMove = (e: L.LeafletMouseEvent) => {
            if (state.points.length === 1 && state.dynamicLine && state.dynamicTooltip) {
                state.dynamicLine.setLatLngs([state.points[0], e.latlng]);
                const distance = (map.distance(state.points[0], e.latlng) / 1000).toFixed(2);
                state.dynamicTooltip.setLatLng([(state.points[0].lat + e.latlng.lat) / 2, (state.points[0].lng + e.latlng.lng) / 2]).setContent(`${distance} km`);
            }
        };

        if (isMeasuring) {
            map.getContainer().style.cursor = 'crosshair';
            map.getContainer().classList.add('map-measuring'); 
            map.on('click', onMeasureClick);
            map.on('mousemove', onMeasureMove);
        } else {
            map.getContainer().style.cursor = '';
            map.getContainer().classList.remove('map-measuring'); 
            map.off('click', onMeasureClick);
            map.off('mousemove', onMeasureMove);
            clearMeasure();
        }

        return () => {
            map.off('click', onMeasureClick);
            map.off('mousemove', onMeasureMove);
        }
    }, [isMeasuring]);

    return <div id="map" className="w-screen h-screen z-[1]"></div>;
}
