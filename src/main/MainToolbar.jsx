import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar, IconButton, OutlinedInput, InputAdornment, Popover, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Badge, ListItemButton, ListItemText, Tooltip,
  // * CUSTOM CODE START * //
  Button,
  // * CUSTOM CODE END * //
} from '@mui/material';

// * CUSTOM CODE START * //
import dayjs from 'dayjs';
// * CUSTOM CODE END * //

import { makeStyles, useTheme } from '@mui/styles';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

// * CUSTOM CODE START * //
import { useCatch } from '../reactHelper';
// * CUSTOM CODE END * //

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },

  // * CUSTOM CODE START * //

  selectAll: {
    fontSize: '12px',
    fontWeight: 400,
  },
  rowC: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
  },

  // * CUSTOM CODE END * //
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,

  // * CUSTOM CODE START * //

  filterByCamera,
  setFilterByCamera,

  // * CUSTOM CODE END * //

  filterMap,
  setFilterMap,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  // * CUSTOM CODE START * //
  const positions = useSelector((state) => state.session.positions);
  // * CUSTOM CODE END * //

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  // * CUSTOM CODE START * //
  const [isGroupsSelectAll, setIsGroupsSelectAll] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState('all');
  // * CUSTOM CODE END * //

  const deviceStatusCount = (status) => Object.values(devices).filter((d) => d.status === status).length;

  // * CUSTOM CODE START * //
  const deviceMovingCount = (status) => {
    if (status === 'all') return Object.values(devices).length;

    if (Object.values(positions).length === 0 && status === 'no-motion') return Object.values(devices).length;

    return Object.values(positions).filter((p) => {
      if (status === 'motion') return p.attributes?.motion === true;

      return !p.attributes || p.attributes.motion === false;
    }).length;
  };

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
        setFilter({ ...filter, groups: [] });
        // setting state to false ==> unselect done.
        setIsGroupsSelectAll(false);
        return;
      }

      // select all case.
      const ids = [];
      Object.keys(groups).forEach((d) => ids.push(groups[d].id));
      setFilter({ ...filter, groups: ids });
      setIsGroupsSelectAll(true);
      return;
    }

    setFilter({ ...filter, groups: e.target.value });

    setIsGroupsSelectAll(false);
  }

  function renderValueForGroupsDropdown(e) {
    let items = Object.values(groups).filter((g) => e.includes(g.id));
    items = items.map((i) => (items.indexOf(i) !== items.length - 1 ? `${i.name}, ` : i.name));
    return items;
  }

  const handleButtonClick = useCatch(async () => {
    const now = dayjs();
    const query = new URLSearchParams({});
    filteredDevices.forEach((device) => {
      const lastUpdate = dayjs(device.lastUpdate);
      const isOfflineMoreThan20Hours = !lastUpdate.isValid() || now.diff(lastUpdate, 'hour') > 20;

      if (offlineStatus === 'all'
        || (offlineStatus === 'offline20Plus' && isOfflineMoreThan20Hours)
        || (offlineStatus === 'offlineLess20' && !isOfflineMoreThan20Hours)) {
        query.append('deviceId', device.id);
      }
    });
    window.location.assign(`/api/devices/xlsx?${query.toString()}`);
  });

  const resetFiltersClick = useCatch(async () => {
    setFilter({ statuses: [], groups: [], motion: 'all' });
    setFilterSort('name');
    setFilterByCamera('All');
    setFilterMap(false);
  });

  // * CUSTOM CODE END * //

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
        {devicesOpen ? <MapIcon /> : <ViewListIcon />}
      </IconButton>
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setDevicesAnchorEl(null)}
        endAdornment={(
          // * CUSTOM CODE START * //
          <InputAdornment position="end">
            <IconButton size="small" edge="end" onClick={() => setFilterAnchorEl(inputRef.current)}>
              <Badge color="info" variant="dot" invisible={!filter.statuses.length && !filter.groups.length && filter.motion === 'all'}>
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </InputAdornment>
          // * CUSTOM CODE END * //
        )}
        size="small"
        fullWidth
      />
      <Popover
        open={!!devicesAnchorEl && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: Number(theme.spacing(2).slice(0, -2)),
        }}
        marginThreshold={0}
        slotProps={{
          paper: {
            style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
          },
        }}
        elevation={1}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <DeviceRow key={filteredDevices[index].id} data={filteredDevices} index={index} />
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
            <ListItemText
              primary={t('notificationAlways')}
              style={{ textAlign: 'center' }}
            />
          </ListItemButton>
        )}
      </Popover>
      <Popover
        open={!!filterAnchorEl}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className={classes.filterPanel}>
          <FormControl>
            <InputLabel>{t('deviceStatus')}</InputLabel>
            <Select
              label={t('deviceStatus')}
              value={filter.statuses}
              onChange={(e) => setFilter({ ...filter, statuses: e.target.value })}
              multiple
            >
              <MenuItem value="online">{`${t('deviceStatusOnline')} (${deviceStatusCount('online')})`}</MenuItem>
              <MenuItem value="offline">{`${t('deviceStatusOffline')} (${deviceStatusCount('offline')})`}</MenuItem>

              <MenuItem value="unknown">{`Offline - Unknown (${deviceStatusCount('unknown')})`}</MenuItem>

            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Motion</InputLabel>
            <Select
              label="Motion"
              value={filter.motion}
              onChange={(e) => setFilter({ ...filter, motion: e.target.value })}
            >
              <MenuItem value="all">{`All (${deviceMovingCount('all')})`}</MenuItem>
              <MenuItem value="motion">{`In Motion (${deviceMovingCount('motion')})`}</MenuItem>
              <MenuItem value="no-motion">{`No Motion (${deviceMovingCount('no-motion')})`}</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>{t('settingsGroups')}</InputLabel>
            <Select
              label={t('settingsGroups')}
              value={filter.groups}
              onChange={(e) => handleChangeInGroupSelect(e)}
              renderValue={(e) => renderValueForGroupsDropdown(e)}
              multiple
            >
              <MenuItem key="all" value="all" className={classes.selectAll}>
                {isGroupsSelectAll ? 'Unselect All' : 'Select All'}
              </MenuItem>
              {Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
                // <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                <MenuItem key={group.id} value={group.id}>
                  <div className={classes.rowC}>
                    <Checkbox checked={filter.groups.includes(group.id)} />
                    <div className={classes.dropdownText}>
                      {group.name}
                    </div>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>{t('sharedSortBy')}</InputLabel>
            <Select
              label={t('sharedSortBy')}
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              displayEmpty
            >
              <MenuItem value="name">{t('sharedName')}</MenuItem>
              <MenuItem value="lastUpdate">{t('deviceLastUpdate')}</MenuItem>
            </Select>
          </FormControl>
          {/* search by camera filter */}
          <FormControl>
            <InputLabel>{t('sharedFilterByCamera')}</InputLabel>
            <Select
              label={t('sharedFilterByCamera')}
              value={filterByCamera}
              onChange={(e) => setFilterByCamera(e.target.value)}
              displayEmpty
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Has Camera">{t('sharedHasCamera')}</MenuItem>
              <MenuItem value="Has No Camera">{t('sharedHasNoCamera')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Offline Status</InputLabel>
            <Select
              label="Offline Status"
              value={offlineStatus}
              onChange={(e) => setOfflineStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="offline20Plus">Offline for more than 20 hours</MenuItem>
              <MenuItem value="offlineLess20">Not (Offline for more than 20 hours)</MenuItem>
            </Select>
          </FormControl>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />}
              label={t('sharedFilterMap')}
            />
          </FormGroup>
          {/* Custom Code Start */}
          <Button variant="outlined" color="error" onClick={resetFiltersClick}>Reset Filters</Button>
          {/* Custom Code End */}
          <Button variant="outlined" onClick={handleButtonClick}>Export Devices</Button>
        </div>
      </Popover>
      <IconButton edge="end" onClick={() => navigate('/settings/device')} disabled={deviceReadonly}>
        <Tooltip open={!deviceReadonly && Object.keys(devices).length === 0} title={t('deviceRegisterFirst')} arrow>
          <AddIcon />
        </Tooltip>
      </IconButton>
    </Toolbar>
  );
};

export default MainToolbar;
