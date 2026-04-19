import React from 'react';
import { KPIData } from '../types';
import { BaseMetricCard } from './BaseMetricCard';
import { useCrossFilter } from '../context/CrossFilterContext';

interface KPISectionProps {
  kpis: KPIData[];
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  const { toggleFilter, filters } = useCrossFilter();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
      {kpis.map((kpi) => {
        let onClick = undefined;
        let opacity = 1;

        if (kpi.id === 'mic') {
          onClick = () => toggleFilter('providers', 'MIC');
          opacity = filters['providers'] && filters['providers'] !== 'MIC' ? 0.3 : 1;
        } else if (kpi.id === 'baolong') {
          onClick = () => toggleFilter('providers', 'BaoLong');
          opacity = filters['providers'] && filters['providers'] !== 'BaoLong' ? 0.3 : 1;
        }

        return (
          <div key={kpi.id} className="transition-opacity duration-300 h-full" style={{ opacity }}>
            <BaseMetricCard
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              bgColor={kpi.bgColor}
              textColor={kpi.textColor}
              logo={kpi.logo}
              onClick={onClick}
            />
          </div>
        );
      })}
    </div>
  );
};
