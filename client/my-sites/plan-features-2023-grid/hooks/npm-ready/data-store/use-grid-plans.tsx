import {
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_WOOEXPRESS_MEDIUM,
	TYPE_WOOEXPRESS_SMALL,
	getPlan,
	isBloggerPlan,
	TERMS_LIST,
	applyTestFiltersToPlansList,
	isMonthly,
	isWpcomEnterpriseGridPlan,
	TERM_MONTHLY,
	isWpComFreePlan,
	type FeatureList,
	type PlanSlug,
	type FeatureObject,
	type StorageOption,
} from '@automattic/calypso-products';
import useHighlightLabels from './use-highlight-labels';
import usePlansFromTypes from './use-plans-from-types';
import type { PricedAPIPlan } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

// TODO clk: move to plans data store
export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
};

// TODO clk: move to plans data store
export interface PlanFeaturesForGridPlan {
	wpcomFeatures: TransformedFeatureObject[];
	jetpackFeatures: TransformedFeatureObject[];
	storageOptions: StorageOption[];
	// used for comparison grid so far
	conditionalFeatures?: FeatureObject[];
}

// TODO clk: move to plans data store
export interface PricingMetaForGridPlan {
	billingPeriod?: PricedAPIPlan[ 'bill_period' ] | null;
	currencyCode?: PricedAPIPlan[ 'currency_code' ] | null;
	originalPrice: {
		monthly: number | null;
		full: number | null;
	};
	// if discounted prices are provided (not null), they will take precedence over originalPrice.
	// UI will show original with a strikethrough or grayed out
	discountedPrice: {
		monthly: number | null;
		full: number | null;
	};
}

export type UsePricedAPIPlans = ( { planSlugs }: { planSlugs: PlanSlug[] } ) => {
	[ planSlug: string ]: PricedAPIPlan | null | undefined;
};

export type UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits,
}: {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
} ) => { [ planSlug: string ]: PricingMetaForGridPlan };

// TODO clk: move to types. will consume plan properties
export type GridPlan = {
	planSlug: PlanSlug;
	isVisible: boolean;
	features: {
		wpcomFeatures: TransformedFeatureObject[];
		jetpackFeatures: TransformedFeatureObject[];
		storageOptions: StorageOption[];
		conditionalFeatures?: FeatureObject[];
	};
	tagline: string;
	availableForPurchase: boolean;
	productNameShort?: string | null;
	planTitle: TranslateResult;
	billingTimeframe?: TranslateResult | null;
	current?: boolean;
	isMonthlyPlan?: boolean;
	cartItemForPlan?: {
		product_slug: string;
	} | null;
	highlightLabel?: React.ReactNode | null;
	pricing: PricingMetaForGridPlan;
};

// TODO clk: move to plans data store
export type PlansIntent =
	| 'plans-blog-onboarding'
	| 'plans-newsletter'
	| 'plans-link-in-bio'
	| 'plans-new-hosted-site'
	| 'plans-plugins'
	| 'plans-jetpack-app'
	| 'plans-import'
	| 'plans-woocommerce'
	| 'plans-paid-media'
	| 'plans-default-wpcom'
	| 'plans-business-trial'
	| 'default';

interface Props {
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
	// API plans will be ported to data store and be queried from there
	usePricedAPIPlans: UsePricedAPIPlans;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	selectedFeature?: string | null;
	term?: ( typeof TERMS_LIST )[ number ]; // defaults to monthly
	intent?: PlansIntent;
	selectedPlan?: PlanSlug;
	sitePlanSlug?: PlanSlug | null;
	hideEnterprisePlan?: boolean;
	isInSignup?: boolean;
	// whether plan is upgradable from current plan (used in logged-in state)
	usePlanUpgradeabilityCheck?: ( { planSlugs }: { planSlugs: PlanSlug[] } ) => {
		[ key: string ]: boolean;
	};
	showLegacyStorageFeature?: boolean;
	// for AB Test experiment:
	isGlobalStylesOnPersonal?: boolean;
}

const usePlanTypesWithIntent = ( {
	intent,
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
}: Pick< Props, 'intent' | 'selectedPlan' | 'sitePlanSlug' | 'hideEnterprisePlan' > ): string[] => {
	const isEnterpriseAvailable = ! hideEnterprisePlan;
	const isBloggerAvailable =
		( selectedPlan && isBloggerPlan( selectedPlan ) ) ||
		( sitePlanSlug && isBloggerPlan( sitePlanSlug ) );

	let currentSitePlanType = null;
	if ( sitePlanSlug ) {
		currentSitePlanType = getPlan( sitePlanSlug )?.type;
	}

	const availablePlanTypes = [
		TYPE_FREE,
		...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
		TYPE_PERSONAL,
		TYPE_PREMIUM,
		TYPE_BUSINESS,
		TYPE_ECOMMERCE,
		...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
		TYPE_WOOEXPRESS_SMALL,
		TYPE_WOOEXPRESS_MEDIUM,
	];

	let planTypes;
	switch ( intent ) {
		case 'plans-woocommerce':
			planTypes = [ TYPE_WOOEXPRESS_SMALL, TYPE_WOOEXPRESS_MEDIUM ];
			break;
		case 'plans-blog-onboarding':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-newsletter':
		case 'plans-link-in-bio':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-new-hosted-site':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-import':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-plugins':
			planTypes = [
				...( currentSitePlanType ? [ currentSitePlanType ] : [] ),
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
			];
			break;
		case 'plans-jetpack-app':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-paid-media':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-default-wpcom':
			planTypes = [
				TYPE_FREE,
				...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
			];
			break;
		case 'plans-business-trial':
			planTypes = [
				TYPE_BUSINESS,
				...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
			];
			break;
		default:
			planTypes = availablePlanTypes;
	}

	return planTypes;
};

// TODO clk: move to plans data store
const useGridPlans = ( {
	usePricedAPIPlans,
	usePricingMetaForGridPlans,
	term = TERM_MONTHLY,
	intent,
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
	isInSignup,
	usePlanUpgradeabilityCheck,
	isGlobalStylesOnPersonal,
}: Props ): Omit< GridPlan, 'features' >[] => {
	const availablePlanSlugs = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent: 'default',
			selectedPlan,
			sitePlanSlug,
			hideEnterprisePlan,
		} ),
		term,
	} );
	const planSlugsForIntent = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent,
			selectedPlan,
			sitePlanSlug,
			hideEnterprisePlan,
		} ),
		term,
	} );
	const planUpgradeability = usePlanUpgradeabilityCheck?.( { planSlugs: availablePlanSlugs } );

	// only fetch highlights for the plans that are available for the intent
	const highlightLabels = useHighlightLabels( {
		intent,
		planSlugs: planSlugsForIntent,
		currentSitePlanSlug: sitePlanSlug,
		selectedPlan,
		planUpgradeability,
	} );

	// TODO: pricedAPIPlans to be queried from data-store package
	const pricedAPIPlans = usePricedAPIPlans( { planSlugs: availablePlanSlugs } );

	const pricingMeta = usePricingMetaForGridPlans( { planSlugs: availablePlanSlugs } );

	return availablePlanSlugs.map( ( planSlug ) => {
		const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
		const planObject = pricedAPIPlans[ planSlug ];
		const isMonthlyPlan = isMonthly( planSlug );
		const availableForPurchase = !! ( isInSignup || planUpgradeability?.[ planSlug ] );

		let tagline = '';
		if ( 'plans-newsletter' === intent ) {
			tagline = planConstantObj.getNewsletterTagLine?.( isGlobalStylesOnPersonal ) ?? '';
		} else if ( 'plans-link-in-bio' === intent ) {
			tagline = planConstantObj.getLinkInBioTagLine?.( isGlobalStylesOnPersonal ) ?? '';
		} else if ( 'plans-blog-onboarding' === intent ) {
			tagline = planConstantObj.getBlogOnboardingTagLine?.( isGlobalStylesOnPersonal ) ?? '';
		} else {
			tagline = planConstantObj.getPlanTagline?.( isGlobalStylesOnPersonal ) ?? '';
		}

		const productNameShort =
			isWpcomEnterpriseGridPlan( planSlug ) && planConstantObj.getPathSlug
				? planConstantObj.getPathSlug()
				: planObject?.product_name_short ?? null;

		// cartItemForPlan done in line here as it's a small piece of logic to pass another selector for
		const cartItemForPlan =
			isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug )
				? null
				: {
						product_slug: planSlug,
				  };

		return {
			planSlug,
			isVisible: planSlugsForIntent.includes( planSlug ),
			tagline,
			availableForPurchase,
			productNameShort,
			planTitle: planConstantObj.getTitle?.() ?? '',
			billingTimeframe: planConstantObj.getBillingTimeFrame?.(),
			current: sitePlanSlug === planSlug,
			isMonthlyPlan,
			cartItemForPlan,
			highlightLabel: highlightLabels[ planSlug ],
			pricing: pricingMeta[ planSlug ],
		};
	} );
};

export default useGridPlans;
