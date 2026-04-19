import React from 'react';
import { useCrossFilter } from '../context/CrossFilterContext';
import { KPIData } from '../types';
import { BaseMetricCard } from './BaseMetricCard';

interface KPISectionProps {
  kpis: KPIData[];
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  const { toggleFilter, filters } = useCrossFilter();
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
      {kpis.map(kpi => {
        let onClick = undefined;
        let opacity = 1;

        if (kpi.id === 'mic') {
          onClick = () => {
            return toggleFilter('providers', 'MIC');
          };
          opacity = filters['providers'] && filters['providers'] !== 'MIC' ? 0.3 : 1;
        } else if (kpi.id === 'baolong') {
          onClick = () => {
            return toggleFilter('providers', 'BaoLong');
          };
          opacity = filters['providers'] && filters['providers'] !== 'BaoLong' ? 0.3 : 1;
        }

        return (
          <div key={kpi.id} className="h-full transition-opacity duration-300" style={{ opacity }}>
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
