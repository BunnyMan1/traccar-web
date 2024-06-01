import React from 'react';
import {
  FormControl, InputLabel, MenuItem, Select,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';

// * CUSTOM CODE START  (Added `columnsObject`) * //
const ColumnSelect = ({
  columns, setColumns, columnsArray, columnsObject, rawValues, disabled,
}) => {
  // * CUSTOM CODE END * //
  const classes = useReportStyles();
  const t = useTranslation();

  // * CUSTOM CODE START * //
  const excludeList = ['totalDistance', 'startOdometer', 'endOdometer', 'hours', 'engineHours', 'odometer', 'serviceOdometer', 'tripOdometer'];
  let columnsObjectKeys = [];
  columns = columns.filter((item) => (!excludeList.includes(item)));
  if (columnsArray) columnsArray = columnsArray.filter((item) => (!excludeList.includes(item[0])));
  if (columnsObject) columnsObjectKeys = Object.keys(columnsObject).filter((item) => (!excludeList.includes(item)));
  console.log('columnsObjectKeys', columnsObjectKeys);
  // * CUSTOM CODE END * //

  return (
    <div className={classes.filterItem}>
      <FormControl fullWidth>
        <InputLabel>{t('sharedColumns')}</InputLabel>
        <Select
          label={t('sharedColumns')}
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          multiple
          disabled={disabled}
        >
          {columnsArray.map(([key, string]) => (
            <MenuItem key={key} value={key}>{rawValues ? string : t(string)}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ColumnSelect;
