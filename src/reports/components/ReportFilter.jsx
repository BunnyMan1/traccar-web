// * CUSTOM CODE START * //
/* eslint-disable no-unused-vars */
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Alert, Snackbar, Checkbox, Autocomplete,
} from '@mui/material';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import SelectField from '../../common/components/SelectField';
import SplitButton from '../../common/components/SplitButton';
import { useRestriction } from '../../common/util/permissions';
import { devicesActions, reportsActions } from '../../store';
import useReportStyles from '../common/useReportStyles';

const ReportFilter = (
  {
    children, handleSubmit, handleSchedule, showOnly, ignoreDevice, multiDevice, includeGroups, fromReplayPage,
  },
) => {
  // * CUSTOM CODE END * //
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);
  // const [button, setButton] = useState('json');
  const button = useSelector((state) => state.reports.button);

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled = button === 'schedule' && (!description || !calendarId);
  const disabled = (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) || scheduleDisabled;

  // * CUSTOM CODE START * //
  const [isDevicesSelectAll, setIsDevicesSelectAll] = useState(false);
  const [isGroupsSelectAll, setIsGroupsSelectAll] = useState(false);

  const [isShowErrorSnackbar, setIsShowErrorSnackbar] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const [isExportDisable, setIsExportDisable] = useState(false);

  const vertical = 'top';
  const horizontal = 'center';

  let timer = null;

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const snackbarClose = () => {
    setIsShowErrorSnackbar(false);
  };

  const disableAfterExport = () => {
    setIsExportDisable(true);
    setSnackbarMessage('Report email has been requested and it will be delivered between 5-30 minutes from now. \n \n \n Note: Do NOT request report email once again. Please wait for the current request report to be delivered.');
    setSnackbarSeverity('success');
    setIsShowErrorSnackbar(true);
    timer = setTimeout(() => {
      setIsExportDisable(false);
      setIsShowErrorSnackbar(false);
      clearTimeout(timer);
    }, 30000);
  };
  // Step 1: Add state to keep track of the selected "from" date
  const [selectedFrom, setSelectedFrom] = useState(moment().startOf('day'));

  // Step 2: Handle changes in the "from" date and adjust the "to" date accordingly
  const handleFromDateChange = (value) => {
    const newFromDate = moment(value, moment.HTML5_FMT.DATETIME_LOCAL);
    setSelectedFrom(newFromDate);
    // Automatically adjust the "to" date to be one month beyond the new "from" date
    const newToDate = newFromDate.clone().add(1, 'month');
    dispatch(reportsActions.updateFrom(value)); // Update the Redux state with the new "from" value
    dispatch(reportsActions.updateTo(newToDate.format(moment.HTML5_FMT.DATETIME_LOCAL))); // Update the Redux state with the new "to" value
  };

  const handleClick = (type) => {
    let selectedFromDate; // Declare selectedFromDate variable here
    let selectedToDate; // Declare selectedToDate variable here
    let diffInMonths;
    let adjustedToDate;
    // * CUSTOM CODE END * //
    if (type === 'schedule') {
      handleSchedule(deviceIds, groupIds, {
        description,
        calendarId,
        attributes: {},
      });
    } else {
      let selectedFrom;
      let selectedTo;
      switch (period) {
        // * CUSTOM CODE START * //
        case 'today':
          selectedFromDate = moment().startOf('day');
          selectedToDate = moment().endOf('day');
          break;
        case 'yesterday':
          selectedFromDate = moment().subtract(1, 'day').startOf('day');
          selectedToDate = moment().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFromDate = moment().startOf('week');
          selectedToDate = moment().endOf('week');
          break;
        case 'previousWeek':
          selectedFromDate = moment().subtract(1, 'week').startOf('week');
          selectedToDate = moment().subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFromDate = moment().startOf('month');
          selectedToDate = moment().endOf('month');
          break;
        case 'previousMonth':
          selectedFromDate = moment().subtract(1, 'month').startOf('month');
          selectedToDate = moment().subtract(1, 'month').endOf('month');
          break;
        case 'custom':
          // In case of 'custom', use the value directly from the 'TextField' as the "from" date
          selectedFromDate = moment(from, moment.HTML5_FMT.DATETIME_LOCAL);
          // If "to" date is beyond one month from "from" date, adjust it to be one month beyond the "from" date
          selectedToDate = moment(to, moment.HTML5_FMT.DATETIME_LOCAL);
          diffInMonths = selectedToDate.diff(selectedFromDate, 'months', true);
          adjustedToDate = diffInMonths > 1 ? selectedFromDate.clone().add(1, 'month') : selectedToDate;

          // Update the Redux state and local state with the new "from" value
          dispatch(reportsActions.updateFrom(selectedFromDate.toISOString()));
          setSelectedFrom(selectedFromDate);

          // Update the Redux state with the new "to" value
          dispatch(reportsActions.updateTo(adjustedToDate.toISOString()));
          // * CUSTOM CODE END * //
          break;
        default:
          break;
      }

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        // * CUSTOM CODE START * //
        from: selectedFromDate ? selectedFromDate.toISOString() : selectedFrom.toISOString(), // Use the new selectedFromDate if available, otherwise use the previous selectedFrom
        to: selectedToDate.toISOString(),
        // * CUSTOM CODE END * //
        calendarId,
        type,
      });

      // * CUSTOM CODE START * //
      if (type === 'mail') { disableAfterExport(); }
      // * CUSTOM CODE END * //
    }
  };

  // * CUSTOM CODE START * //
  /// Function to handle changes made to Device/Devices dropdown by the user.
  function handleChangeInDeviceSelect(e) {
    // console.log(e);
    const map = {};
    let ids = [];
    if (e.id) {
      ids.push(e.id);
    } else {
      e.forEach(
        (d) => {
          const id = (d.id ? d.id : d);
          ids.push(id);
          if (map[id]) map[id] += 1;
          else map[id] = 1;
        },
      );
    }
    if (multiDevice && ids.includes(-999)) {
      ids = [];
      if (isDevicesSelectAll) {
        // unselect all case.
        // setting state to false ==> unselect done.
        setIsDevicesSelectAll(false);
      } else {
        Object.keys(devices).forEach((d) => ids.push(devices[d].id));
        setIsDevicesSelectAll(true);
      }
      // console.log(`sending these : ${ids}`);
      dispatch(devicesActions.selectIds(ids));

      return;
    }
    // console.log(`sending these : ${ids}`);

    const temp = [...ids];
    ids = [];
    temp.forEach((t) => {
      if (map[t] === 1) ids.push(t);
    });

    dispatch(
      multiDevice
        ? devicesActions.selectIds(ids)
        : devicesActions.selectId(ids),
    );

    setIsDevicesSelectAll(false);
  }

  /// Function to handle changes made to Groups dropdown by the user.
  function handleChangeInGroupSelect(e) {
    // console.log(e);
    const map = {};
    let ids = [];

    e.forEach(
      (d) => {
        const id = (d.id ? d.id : d);
        ids.push(id);
        if (map[id]) map[id] += 1;
        else map[id] = 1;
      },
    );
    e.forEach((g) => {
      if (!ids.includes((g.id ? g.id : g))) {
        ids.push(g.id ? g.id : g);
      }
    });
    if (ids.includes(-999)) {
      ids = [];
      if (isGroupsSelectAll) {
        // unselect all case.
        // setting state to false ==> unselect done.
        setIsGroupsSelectAll(false);
      } else {
        Object.keys(groups).forEach((d) => ids.push(groups[d].id));
        setIsGroupsSelectAll(true);
      }
      dispatch(reportsActions.updateGroupIds(ids));

      return;
    }
    const temp = [...ids];
    ids = [];
    temp.forEach((t) => {
      if (map[t] === 1) ids.push(t);
    });

    dispatch(reportsActions.updateGroupIds(ids));

    setIsGroupsSelectAll(false);
  }
  // * CUSTOM CODE END * //

  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <Snackbar
            open={isShowErrorSnackbar}
            onClose={snackbarClose}
            autoHideDuration={15000}
            anchorOrigin={{ vertical, horizontal }}
            ClickAwayListenerProps={{ onClickAway: () => null }}
          >
            <Alert onClose={snackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
          <FormControl fullWidth>
            {multiDevice && (
              <Autocomplete
                multiple={multiDevice}
                id="select-device"
                options={multiDevice ? [{ name: 'select all', id: -999 }, ...Object.values(devices)] : Object.values(devices)}
                getOptionLabel={(option) => {
                  let n;
                  Object.values(devices).forEach((e) => {
                    if (e.id === option) {
                      n = e.name;
                    }
                  });
                  return n ?? option.name;
                }}
                limitTags={1}
                disableCloseOnSelect
                value={multiDevice ? deviceIds : deviceId}
                isOptionEqualToValue={(options, value) => options.valueOf === value.valueOf}
                onChange={(e, v, r, d) => handleChangeInDeviceSelect(v)}
                renderOption={(props, device) => (
                  <li {...props}>

                    {(device.id === -999 && multiDevice)
                      ? (
                        <div className={classes.selectAll}>
                          {isDevicesSelectAll ? 'Unselect All' : 'Select All'}
                        </div>
                      )
                      : (
                        <div className={classes.rowC}>
                          <Checkbox size="small" checked={multiDevice ? (deviceIds.includes(device.id)) : (deviceId === device.id)} />
                          <div className={classes.dropdownText}>
                            {device.name}
                          </div>
                        </div>
                      )}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label={t('deviceTitle')} />
                )}
              />
            )}
            {!multiDevice && (<InputLabel>{t(multiDevice ? 'deviceTitle' : 'reportDevice')}</InputLabel>)}
            {!multiDevice && (
              <Select
                label={t('reportDevice')}
                value={deviceId || ''}
                onChange={(e) => dispatch(devicesActions.selectId(e.target.value))}
              >

                {Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)).map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    <div className={classes.rowC}>
                      {multiDevice ? (<Checkbox checked={deviceIds?.indexOf(device.id) > -1} />) : null}
                      <div className={classes.dropdownText}>
                        {device.name}
                      </div>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
          {/* <SelectField
            label={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
            data={Object.values(devices).sort((a, b) => a.name.localeCompare(b.name))}
            value={multiDevice ? deviceIds : deviceId}
            onChange={(e) => dispatch(multiDevice ? devicesActions.selectIds(e.target.value) : devicesActions.selectId(e.target.value))}
            multiple={multiDevice}
            fullWidth
          /> */}
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          {/* <InputLabel>{t('settingsGroups')}</InputLabel> */}

          <Autocomplete
            multiple
            id="select-groups"
            options={[{ name: 'select all', id: -999 }, ...Object.values(groups)]}
            size="small"
            limitTags={1}
            getOptionLabel={(option) => {
              let n;
              Object.values(groups).forEach((e) => {
                if (e.id === option) {
                  n = e.name;
                }
              });
              return n ?? option.name;
            }}
            disableCloseOnSelect
            value={groupIds}
            isOptionEqualToValue={(options, value) => options.valueOf === value.valueOf}
            onChange={(e, v, r, d) => handleChangeInGroupSelect(v)}
            renderOption={(props, group) => (
              <li {...props}>
                {group.id === -999
                  ? (
                    <div className={classes.selectAll}>
                      {isGroupsSelectAll ? 'Unselect All' : 'Select All'}
                    </div>
                  )
                  : (
                    <div className={classes.rowC}>
                      <Checkbox size="small" checked={groupIds.includes(group.id)} />
                      <div className={classes.dropdownText}>
                        {group.name}
                      </div>
                    </div>
                  )}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label={t('settingsGroups')} />
            )}
          />
          {/*
          <SelectField
            label={t('settingsGroups')}
            data={Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))}
            value={groupIds}
            onChange={(e) => dispatch(reportsActions.updateGroupIds(e.target.value))}
            multiple
            fullWidth
          /> */}
        </div>
      )}
      {button !== 'schedule' ? (
        <>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t('reportPeriod')}</InputLabel>
              <Select label={t('reportPeriod')} value={period} onChange={(e) => dispatch(reportsActions.updatePeriod(e.target.value))}>
                <MenuItem value="today">{t('reportToday')}</MenuItem>
                <MenuItem value="yesterday">{t('reportYesterday')}</MenuItem>
                <MenuItem value="thisWeek">{t('reportThisWeek')}</MenuItem>
                <MenuItem value="previousWeek">{t('reportPreviousWeek')}</MenuItem>
                {/* <MenuItem value="thisMonth">{t('reportThisMonth')}</MenuItem>
                <MenuItem value="previousMonth">{t('reportPreviousMonth')}</MenuItem> */}
                <MenuItem value="custom">{t('reportCustom')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                value={from}
                // onChange={(e) => dispatch(reportsActions.updateFrom(e.target.value))}
                onChange={(e) => handleFromDateChange(e.target.value)} // Use the new function to handle "from" date changes
                fullWidth
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                value={to}
                onChange={(e) => dispatch(reportsActions.updateTo(e.target.value))}
                fullWidth
                // * CUSTOM CODE START * //
                inputProps={{
                  max: moment(selectedFrom).add(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL), // Use the adjusted "to" date value
                }}
              // * CUSTOM CODE END * //
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem}>
            <TextField
              value={description || ''}
              onChange={(event) => setDescription(event.target.value)}
              label={t('sharedDescription')}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <SelectField
              value={calendarId}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t('sharedCalendar')}
              fullWidth
            />
          </div>
        </>
      )}
      {children}
      <div className={classes.filterItem}>
        {showOnly ? (
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            // * CUSTOM CODE START * //
            // disabled={disabled}
            // onClick={() => handleClick('json')}
            disabled={disabled || isExportDisable}
            onClick={() => (fromReplayPage ? handleClick('json') : handleClick('mail'))}
          >
            {/* <Typography variant="button" noWrap>{t('reportShow')}</Typography> */}
            <Typography variant="button" noWrap>{fromReplayPage ? t('reportShow') : t('reportEmail')}</Typography>
          </Button>
          // * CUSTOM CODE END * //
        ) : (
          <SplitButton
            fullWidth
            variant="outlined"
            color="secondary"
            // * CUSTOM CODE START * //
            // disabled={disabled}
            // onClick={handleClick}
            disabled={disabled || isExportDisable}
            onClick={isExportDisable ? null : handleClick}
            // * CUSTOM CODE END * //
            selected={button}
            // setSelected={(value) => setButton(value)}
            setSelected={(value) => dispatch(reportsActions.updateButton(value))}
            options={readonly ? {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
            } : {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
              schedule: t('reportSchedule'),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
