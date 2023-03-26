/* eslint-disable no-unused-vars */
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Alert,
  Autocomplete, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, Snackbar, TextField, Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import SelectField from '../../common/components/SelectField';
import SplitButton from '../../common/components/SplitButton';
import { useRestriction } from '../../common/util/permissions';
import { devicesActions, reportsActions } from '../../store';
import useReportStyles from '../common/useReportStyles';

const ReportFilter = ({ children, handleSubmit, handleSchedule, showOnly, ignoreDevice, multiDevice, includeGroups }) => {
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
  const button = useSelector((state) => state.reports.button);

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled = button === 'schedule' && (!description || !calendarId);
  const disabled = (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) || scheduleDisabled;

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

  const handleClick = (type) => {
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
        case 'today':
          selectedFrom = moment().startOf('day');
          selectedTo = moment().endOf('day');
          break;
        case 'yesterday':
          selectedFrom = moment().subtract(1, 'day').startOf('day');
          selectedTo = moment().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFrom = moment().startOf('week');
          selectedTo = moment().endOf('week');
          break;
        case 'previousWeek':
          selectedFrom = moment().subtract(1, 'week').startOf('week');
          selectedTo = moment().subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFrom = moment().startOf('month');
          selectedTo = moment().endOf('month');
          break;
        case 'previousMonth':
          selectedFrom = moment().subtract(1, 'month').startOf('month');
          selectedTo = moment().subtract(1, 'month').endOf('month');
          break;
        default:
          selectedFrom = moment(from, moment.HTML5_FMT.DATETIME_LOCAL);
          selectedTo = moment(to, moment.HTML5_FMT.DATETIME_LOCAL);
          break;
      }
      if (selectedTo.diff(selectedFrom, 'minutes') > 10080) {
        // show snackbar.
        setSnackbarMessage('Difference between from and to dates should be less than one week.');
        setSnackbarSeverity('warning');
        setIsShowErrorSnackbar(true);
        return;
      }
      // console.log(selectedFrom);
      // console.log(selectedTo);

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
      });

      if (type === 'mail') { disableAfterExport(); }
    }
  };

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

  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <Snackbar
            open={isShowErrorSnackbar}
            onClose={snackbarClose}
            anchorOrigin={{ vertical, horizontal }}
            autoHideDuration={15000}
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
                onChange={(e, v, r, d) => handleChangeInDeviceSelect(v)}
                renderOption={(props, device) => (
                  <li {...props}>

                    {(device.id === -999 && multiDevice) ?
                      (
                        <div className={classes.selectAll}>
                          {isDevicesSelectAll ? 'Unselect All' : 'Select All'}
                        </div>
                      )
                      :
                      (
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

                  <div key={device.id} className={classes.rowC}>
                    {multiDevice ? (<Checkbox checked={deviceIds?.indexOf(device.id) > -1} />) : null}
                    <div className={classes.dropdownText}>
                      {device.name}
                    </div>
                  </div>

                ))}
              </Select>
            )}
          </FormControl>
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
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
              onChange={(e, v, r, d) => handleChangeInGroupSelect(v)}
              renderOption={(props, group) => (
                <li {...props}>
                  {group.id === -999 ?
                    (
                      <div className={classes.selectAll}>
                        {isGroupsSelectAll ? 'Unselect All' : 'Select All'}
                      </div>
                    )
                    :
                    (
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

            {/* <Select
              label={t('settingsGroups')}
              value={groupIds}
              onChange={(e) => handleChangeInGroupSelect(e)}
              multiple
              renderValue={(e) => renderValueForGroupsDropdown(e)}
            >
              <MenuItem key="all" value="all" className={classes.selectAll}>
                {isGroupsSelectAll ? 'Unselect All' : 'Select All'}
              </MenuItem>

              {Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  <div className={classes.rowC}>
                    <Checkbox checked={groupIds?.indexOf(group.id) > -1} />
                    <div className={classes.dropdownText}>
                      {group.name}
                    </div>
                  </div>
                </MenuItem>
              ))}
            </Select> */}
          </FormControl>
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
                onChange={(e) => dispatch(reportsActions.updateFrom(e.target.value))}
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
              value={calendarId || 0}
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
            disabled={disabled || isExportDisable}
            onClick={() => handleClick('mail')}
          >
            <Typography variant="button" noWrap>{t('reportEmail')}</Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled || isExportDisable}
            onClick={isExportDisable ? null : handleClick}
            selected={button}
            setSelected={(value) => dispatch(reportsActions.updateButton(value))}
            options={(readonly) ? {
              mail: t('reportEmail'),
              json: t('reportShow'),
              export: t('reportExport'),
            } : {
              mail: t('reportEmail'),
              json: t('reportShow'),
              export: t('reportExport'),
              schedule: t('reportSchedule'),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
