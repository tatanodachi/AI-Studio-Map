import { useMemo } from 'react';
import { targetRegions, ageCohorts } from '../data';

interface Props {
  activeRegions: Set<string>;
  pyramidShrunk: boolean;
  onToggleExpand: () => void;
}

export default function DemographicsPyramid({ activeRegions, pyramidShrunk, onToggleExpand }: Props) {
  const activePopulationTotal = useMemo(() => {
    return targetRegions
      .filter((r) => activeRegions.has(r.id))
      .reduce((sum, r) => sum + r.population, 0);
  }, [activeRegions]);

  const absoluteTotalPop = useMemo(() => {
    return targetRegions.reduce((sum, r) => sum + r.population, 0);
  }, []);

  const { combinedMale, combinedFemale, maxCohortValue } = useMemo(() => {
    const male = [0, 0, 0, 0, 0, 0, 0, 0];
    const female = [0, 0, 0, 0, 0, 0, 0, 0];
    targetRegions.forEach((r) => {
      if (activeRegions.has(r.id) && r.maleDistribution && r.femaleDistribution) {
        for (let i = 0; i < 8; i++) {
          male[i] += r.maleDistribution[i];
          female[i] += r.femaleDistribution[i];
        }
      }
    });
    const max = Math.max(...male, ...female, 1);
    return { combinedMale: male, combinedFemale: female, maxCohortValue: max };
  }, [activeRegions]);

  const formatAxisLabel = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  const percentOfTotal = absoluteTotalPop > 0 ? ((activePopulationTotal / absoluteTotalPop) * 100).toFixed(1) : '0.0';

  return (
    <div className="panel-col">
      <div 
        className="section-header" 
        onClick={onToggleExpand}
        style={{ borderBottom: 'none', marginBottom: 0 }}
      >
        <div className="pyramid-title-wrapper">
          <span className="pyramid-title">Demographics</span>
          <span className="pyramid-subtitle">
            <b>{activePopulationTotal.toLocaleString('en-US')}</b> (Population in Selected Regions)
          </span>
        </div>
        <svg
          className={`chevron ${pyramidShrunk ? 'collapsed' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <div className={`pyramid-content ${pyramidShrunk ? 'shrunk' : ''}`}>
        {ageCohorts.map((cohort, index) => {
          const maleVal = combinedMale[index];
          const femaleVal = combinedFemale[index];
          const mPercentOfMax = (maleVal / maxCohortValue) * 100;
          const fPercentOfMax = (femaleVal / maxCohortValue) * 100;
          
          const mPercentOfTotal = activePopulationTotal > 0 ? ((maleVal / activePopulationTotal) * 100).toFixed(1) : '0.0';
          const fPercentOfTotal = activePopulationTotal > 0 ? ((femaleVal / activePopulationTotal) * 100).toFixed(1) : '0.0';

          return (
            <div className="pyramid-row" key={cohort}>
              <div className="pyramid-bar-container male">
                <div
                  className="pyramid-bar male"
                  style={{ width: `${mPercentOfMax}%` }}
                  title={`Male ${cohort}: ${maleVal.toLocaleString('en-US')} (${mPercentOfTotal}%)`}
                ></div>
              </div>
              <div className="pyramid-cohort">{cohort}</div>
              <div className="pyramid-bar-container female">
                <div
                  className="pyramid-bar female"
                  style={{ width: `${fPercentOfMax}%` }}
                  title={`Female ${cohort}: ${femaleVal.toLocaleString('en-US')} (${fPercentOfTotal}%)`}
                ></div>
              </div>
            </div>
          );
        })}

        <div className="pyramid-footer">
          <span style={{ color: '#1C6048' }}>♂ Men</span>
          <span>Cohort Age</span>
          <span style={{ color: '#A95C3E' }}>♀ Women</span>
        </div>

        <div style={{ display: 'flex', fontSize: '9px', color: '#9B8B70', marginTop: '4px', marginBottom: '12px', height: '14px' }}>
          <div style={{ flex: 1, position: 'relative', borderTop: '1px solid rgba(155, 139, 112, 0.4)', paddingTop: '4px' }}>
            <div style={{ position: 'absolute', left: 0, top: '-1px', height: '3px', borderLeft: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <div style={{ position: 'absolute', left: '50%', top: '-1px', height: '3px', borderLeft: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <div style={{ position: 'absolute', right: 0, top: '-1px', height: '3px', borderRight: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <span style={{ position: 'absolute', left: 0 }}>0</span>
            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {formatAxisLabel(maxCohortValue / 2)}
            </span>
            <span style={{ position: 'absolute', right: 0 }}>
              {formatAxisLabel(maxCohortValue)}
            </span>
          </div>
          <div style={{ width: '54px' }}></div>
          <div style={{ flex: 1, position: 'relative', borderTop: '1px solid rgba(155, 139, 112, 0.4)', paddingTop: '4px' }}>
            <div style={{ position: 'absolute', left: 0, top: '-1px', height: '3px', borderLeft: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <div style={{ position: 'absolute', left: '50%', top: '-1px', height: '3px', borderLeft: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <div style={{ position: 'absolute', right: 0, top: '-1px', height: '3px', borderRight: '1px solid rgba(155, 139, 112, 0.4)' }}></div>
            <span style={{ position: 'absolute', left: 0 }}>0</span>
            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {formatAxisLabel(maxCohortValue / 2)}
            </span>
            <span style={{ position: 'absolute', right: 0 }}>
              {formatAxisLabel(maxCohortValue)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '12px', borderTop: '1px dashed rgba(216, 216, 216, 0.8)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#4C4A4B' }}>
            <span>ACTIVE POPULATION SHARE</span>
            <span style={{ color: '#9B8B70' }}>{percentOfTotal}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(155, 139, 112, 0.1)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: `${percentOfTotal}%`, height: '100%', backgroundColor: '#9B8B70', borderRadius: '3px', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
          </div>
          <div style={{ fontSize: '9px', color: '#9B8B70', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
            <span>{(activePopulationTotal / 1000000).toFixed(2)}M / {(absoluteTotalPop / 1000000).toFixed(1)}M</span>
            <span>of Greater Jakarta</span>
          </div>
        </div>

      </div>
    </div>
  );
}
