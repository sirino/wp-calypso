import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import type { Moment } from 'moment/moment';

export default function useBannerSubtitle(
	currentPlanSlug: string | null,
	trialExpired: boolean | null,
	trialDaysLeftToDisplay: number,
	trialExpiration: Moment | null
): string {
	const locale = useLocale();
	const translate = useTranslate();
	const [ bannerSubtitle, setBannerSubtitle ] = useState( '' );

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = trialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	useEffect( () => {
		let subtitle;

		switch ( currentPlanSlug ) {
			case PLAN_MIGRATION_TRIAL_MONTHLY:
				subtitle = trialExpired
					? translate(
							'Your free trial has expired. Upgrade to a plan to unlock new features and launch your migrated website.'
					  )
					: translate(
							'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and launch your migrated website.',
							'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and launch your migrated website.',
							{
								count: trialDaysLeftToDisplay,
								args: {
									daysLeft: trialDaysLeftToDisplay,
									expirationdate: readableExpirationDate as string,
								},
							}
					  );
				break;
			default:
				subtitle = trialExpired
					? translate(
							'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
					  )
					: translate(
							'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
							'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
							{
								count: trialDaysLeftToDisplay,
								args: {
									daysLeft: trialDaysLeftToDisplay,
									expirationdate: readableExpirationDate as string,
								},
							}
					  );
				break;
		}

		setBannerSubtitle( subtitle as string );
	}, [ currentPlanSlug, trialExpired, trialDaysLeftToDisplay, readableExpirationDate ] );

	return bannerSubtitle;
}
