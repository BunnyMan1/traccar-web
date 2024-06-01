import { useMemo } from 'react';

export default (t) => useMemo(() => ({

  // * CUSTOM CODE START * //
  speedLimit: {
    name: t('attributeSpeedLimit'),
    type: 'number',
    subtype: 'speed',
  },
  // * CUSTOM CODE END * //

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
