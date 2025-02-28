import 'calypso/state/rewind/init';

/**
 * Get the list of Rewind backups
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {Array} Rewind backups list
 */
export default function getRewindBackups( state, siteId ) {
	return state.rewind?.[ siteId ]?.backups?.backups ?? null;
}
