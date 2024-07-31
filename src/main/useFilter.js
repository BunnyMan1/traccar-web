import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// * CUSTOM CODE START * // (added filterByCamera)
export default (keyword, filter, filterSort, filterMap, positions, filterByCamera,filterByOfflineStatus, setFilteredDevices, setFilteredPositions) => {
// * CUSTOM CODE END * //

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);
  // const now = Date.now();
  // const twentyHoursInMillis = 20 * 60 * 60 * 1000;
  // * CUSTOM CODE START * //
  // const positions = useSelector((state) => state.session.positions);
  // * CUSTOM CODE END * //

  // eslint-disable-next-line function-paren-newline
  useEffect(() => {
    const deviceGroups = (device) => {
      const groupIds = [];
      let { groupId } = device;
      while (groupId) {
        groupIds.push(groupId);
        groupId = groups[groupId]?.groupId || 0;
      }
      return groupIds;
    };

    const filtered = Object.values(devices)
      .filter((device) => !filter.statuses.length || filter.statuses.includes(device.status))
      .filter((device) => !filter.groups.length || deviceGroups(device).some((id) => filter.groups.includes(id)))

      // * CUSTOM CODE START * //
      .filter((device) => {
        if (filter.motion === 'all') return true;

        const p = positions[device.id];
        if (filter.motion === 'motion') {
          if (!p || !p.attributes) return false;
          return p.attributes.motion === true;
        }

        // no-motion
        return !p || !p.attributes || p.attributes.motion === false;
      })
      // * CUSTOM CODE END * //

      .filter((device) => {
        const lowerCaseKeyword = keyword.toLowerCase();
        return [device.name, device.uniqueId, device.phone, device.model, device.contact].some((s) => s && s.toLowerCase().includes(lowerCaseKeyword));
      });
    switch (filterSort) {
      case 'name':
        filtered.sort((device1, device2) => device1.name.localeCompare(device2.name));
        break;
      case 'lastUpdate':
        filtered.sort((device1, device2) => {
          const time1 = device1.lastUpdate ? dayjs(device1.lastUpdate).valueOf() : 0;
          const time2 = device2.lastUpdate ? dayjs(device2.lastUpdate).valueOf() : 0;
          return time2 - time1;
        });
        break;
      default:
        break;
    }

    // * CUSTOM CODE START * //
    // setFilteredDevices(filtered);
    // Conditionally filters 'devices' based on the 'hasCamera' attribute and the 'filterByCamera' flag.
    // eslint-disable-next-line no-nested-ternary
    setFilteredDevices(filterByCamera === 'All' ? filtered : filterByCamera === 'Has Camera' ? filtered.filter((device) => device.attributes.hasCamera === true) : filtered.filter((device) => device.attributes.hasCamera === false));
    // * CUSTOM CODE END * //

    const now = Date.now(); 
    const twentyHoursInMillis = 20 * 60 * 60 * 1000;
    
    setFilteredDevices(
      filterByOfflineStatus === 'All'
        ? filtered
        : filterByOfflineStatus === 'Offline more than 20 hours'
        ? filtered.filter((device) => device.lastUpdate === null || (now - new Date(device.lastUpdate).getTime()) > twentyHoursInMillis)
        :  filtered.filter((device) => device.lastUpdate !== null && (now - new Date(device.lastUpdate).getTime()) <= twentyHoursInMillis)
    );

    setFilteredPositions(filterMap
      ? filtered.map((device) => positions[device.id]).filter(Boolean)
      : Object.values(positions));
  },

  // * CUSTOM CODE START * // (added filterByCamera)
  [keyword, filter, filterSort, filterMap, groups, devices, positions, filterByCamera,filterByOfflineStatus, setFilteredDevices, setFilteredPositions],
  );
  // * CUSTOM CODE END * //
};
