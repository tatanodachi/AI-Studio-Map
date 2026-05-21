import type { LatLng, LatLngBounds } from 'leaflet';
import { Region, ViewMode } from './types';

export function getDensityColor(density: number) {
    return density > 15000 ? '#134433' : density > 10000 ? '#1C6048' : density > 5000 ? '#41856B' : '#99B6AA';
}

export function getEconomyColor(income: number) {
    return income >= 500 ? '#8C7A5E' : income >= 300 ? '#AFA189' : income >= 100 ? '#C8BEAC' : '#E1DCD3';
}

export function getPopulationColor(population: number) {
    return population >= 3000000 ? '#7C3A21' :  
           population >= 2000000 ? '#A95C3E' :  
           population >= 1500000 ? '#D08C70' :  
                                   '#E8C2B3';   
}

export function getCommuterColor(rate: number) {
    return rate > 60  ? '#1E3A8A' :  
           rate > 45  ? '#3B82F6' :  
           rate > 30  ? '#60A5FA' :  
                        '#DBEAFE';   
}

export function getAgeColor(age: number) {
    return age >= 31 ? '#581C87' :  
           age >= 29 ? '#8B5CF6' :  
           age >= 27 ? '#C084FC' :  
                       '#F3E8FF';   
}

export function getTooltipContent(region: Region, currentViewMode: ViewMode) {
    if (currentViewMode === 'admin') return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.group}</span>`;
    if (currentViewMode === 'population') return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Total: ${(region.population / 1000000).toFixed(1)} Million People</span>`;
    if (currentViewMode === 'density') return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.density.toLocaleString('en-US')} people / km²</span>`;
    if (currentViewMode === 'commuter') return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Commuter Rate: ${region.commuter}%</span>`;
    if (currentViewMode === 'age') return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Median Age: ${region.medianAge} Years</span>`;
    return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Est. GDRP: IDR ${region.income}M / year</span>`;
}

export function getRegionGroupColor(group: string) {
    return group === "DKI Jakarta" ? "#1C6048" : group === "Banten" ? "#1E2f31" : "#9B8B70";
}

export function isLatLngValid(latlng: LatLng | [number, number] | null) {
    if (!latlng) return false;
    const lat = typeof (latlng as any).lat !== 'undefined' ? (latlng as any).lat : (latlng as any)[0];
    const lng = typeof (latlng as any).lng !== 'undefined' ? (latlng as any).lng : (latlng as any)[1];
    return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng) && isFinite(lat) && isFinite(lng);
}

export function isBoundsValid(bounds: LatLngBounds | null) {
    if (!bounds || typeof bounds.isValid !== 'function' || !bounds.isValid()) return false;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return isLatLngValid(sw) && isLatLngValid(ne);
}
