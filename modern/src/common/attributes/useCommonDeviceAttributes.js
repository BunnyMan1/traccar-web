import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  hasCamera: {
    name: t('attributeHasCamera'),
    type: 'boolean',
  },
  speedLimit: {
    name: t('attributeSpeedLimit'),
    type: 'number',
    subtype: 'speed',
  },
  fuelDropThreshold: {
    name: t('attributeFuelDropThreshold'),
    type: 'number',
  },
  fuelIncreaseThreshold: {
    name: t('attributeFuelIncreaseThreshold'),
    type: 'number',
  },
  'report.ignoreOdometer': {
    name: t('attributeReportIgnoreOdometer'),
    type: 'boolean',
  },
}), [t]);
