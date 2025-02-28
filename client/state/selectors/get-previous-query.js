import { get } from 'lodash';

import 'calypso/state/route/init';

/**
 * Gets the previous query set by a ROUTE_SET action
 *
 * @param {Object} state - global redux state
 * @returns {string} previous query value
 */
export const getPreviousQuery = ( state ) => get( state, 'route.query.previous', '' );

export default getPreviousQuery;
