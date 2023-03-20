/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, TextField, Typography, Checkbox, Snackbar, Alert,
  // Autocomplete,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import { devicesActions, reportsActions } from '../../store';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';

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

  const [snackbarSeverity, setSnackbarSeverity] = useState('');

  const [isExportDisable, setIsExportDisable] = useState(false);

  const vertical = 'top';
  const horizontal = 'center';

  let timer = null;

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
    // Check the current event item's target's value and if multi select option is on or off.
    // if it contains 'all' user has clicked on select all option.
    // if not then user has clicked on something else.
    if (multiDevice && e.target.value.includes('all')) {
      // Check if select all is already tapped
      //  if true => `unselect all` action should be performed.
      //  if false => `select all` action should be performed.
      if (isDevicesSelectAll) {
        // unselect all case.
        dispatch(devicesActions.selectIds([]));
        setIsDevicesSelectAll(false);
        return;
      }

      // select all case.
      const ids = [];
      Object.keys(devices).forEach((d) => ids.push(devices[d].id));
      dispatch(devicesActions.selectIds(ids));
      setIsDevicesSelectAll(true);
      return;
    }

    dispatch(
      multiDevice
        ? devicesActions.selectIds(e.target.value)
        : devicesActions.selectId(e.target.value),
    );

    setIsDevicesSelectAll(false);
  }

  /// Function to handle changes made to Groups dropdown by the user.
  function handleChangeInGroupSelect(e) {
    // Check the current event item's target's value.
    // if it contains 'all' user has clicked on select all option.
    // if not then user has clicked on something else.
    if (e.target.value.includes('all')) {
      // Check if select all is already tapped
      //  if true => `unselect all` action should be performed.
      //  if false => `select all` action should be performed.
      if (isGroupsSelectAll) {
        // unselect all case.
        dispatch(reportsActions.updateGroupIds([]));
        // setting state to false ==> unselect done.
        setIsGroupsSelectAll(false);
        return;
      }

      // select all case.
      const ids = [];
      Object.keys(groups).forEach((d) => ids.push(groups[d].id));
      dispatch(reportsActions.updateGroupIds(ids));
      setIsGroupsSelectAll(true);
      return;
    }

    dispatch(reportsActions.updateGroupIds(e.target.value));

    setIsGroupsSelectAll(false);
  }

  // eslint-disable-next-line no-unused-vars, arrow-body-style
  const snackbarMessageData = () => {
    // eslint-disable-next-line react/no-danger
    return (<p dangerouslySetInnerHTML={snackbarMessage} />);
  };

  function renderValueForDevicesDropdown(e) {
    let items = Object.values(devices).filter((d) => e.includes(d.id));
    items = items.map((i) => (items.indexOf(i) !== items.length - 1 ? `${i.name}, ` : i.name));
    return items;
  }

  function renderValueForGroupsDropdown(e) {
    let items = Object.values(groups).filter((g) => e.includes(g.id));
    items = items.map((i) => (items.indexOf(i) !== items.length - 1 ? `${i.name}, ` : i.name));
    return items;
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
            <InputLabel>{t(multiDevice ? 'deviceTitle' : 'reportDevice')}</InputLabel>
            <Select
              label={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
              value={multiDevice ? deviceIds : deviceId || ''}
              onChange={(e) => handleChangeInDeviceSelect(e)}
              multiple={multiDevice}
              renderValue={
                multiDevice ? (e) => renderValueForDevicesDropdown(e) : null
              }
            >
              {multiDevice ? (
                <MenuItem key="all" value="all" className={classes.selectAll}>
                  {isDevicesSelectAll ? 'Unselect All' : 'Select All'}
                </MenuItem>
              ) : null}

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
          </FormControl>
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('settingsGroups')}</InputLabel>
            {/* <Autocomplete
              disablePortal
              multiple
              // label={t('settingsGroups')}
              // values={groupIds}
              value={groupIds}
              options={Object.values(groups).map((g) => g.name)}
              // options={Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
              //   <MenuItem key={group.id} value={group.id}>
              //     <div className={classes.rowC}>
              //       <Checkbox checked={groupIds?.indexOf(group.id) > -1} />
              //       <div className={classes.dropdownText}>
              //         {group.name}
              //       </div>
              //     </div>
              //   </MenuItem>
              // ))}
              // options={['1', '2', '3']}
              // values={['1', '2', '3']}
              filterSelectedOptions
              onChange={(e) => handleChangeInGroupSelect(e)}
              renderInput={(params) => (
                <TextField
                  {...params}
                />
              )}
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
            </Autocomplete> */}

            <Select
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
            </Select>
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
