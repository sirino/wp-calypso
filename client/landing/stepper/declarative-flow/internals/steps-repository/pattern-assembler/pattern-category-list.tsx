import { NavigatorItem } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCategoriesOrder } from './hooks';
import type { Pattern, Category } from './types';
import './pattern-category-list.scss';

interface Props {
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedCategory: string;
	onSelectCategory: ( selectedCategory: string ) => void;
}

const PatternCategoryList = ( {
	categories,
	patternsMapByCategory,
	selectedCategory,
	onSelectCategory,
}: Props ) => {
	const translate = useTranslate();
	const categoriesInOrder = useCategoriesOrder( categories );
	const composite = useCompositeState( { orientation: 'vertical' } );

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="pattern-category-list"
			aria-label={ translate( 'Block pattern categories' ) }
		>
			<VStack spacing={ 0 }>
				{ categoriesInOrder.map( ( { name, label, description } ) => {
					const isActive = selectedCategory === name;
					const hasPatterns = name && patternsMapByCategory[ name ]?.length;
					const isHeaderCategory = name === 'header';
					const isFooterCategory = name === 'footer';

					if ( ! hasPatterns || isHeaderCategory || isFooterCategory ) {
						return null;
					}

					return (
						<CompositeItem
							key={ name }
							role="option"
							as="button"
							{ ...composite }
							aria-label={ label }
							aria-describedby={ description }
							aria-current={ isActive }
							onClick={ () => {
								if ( ! isActive ) {
									onSelectCategory( name );
								}
							} }
						>
							<NavigatorItem active={ isActive }>{ label }</NavigatorItem>
						</CompositeItem>
					);
				} ) }
			</VStack>
		</Composite>
	);
};

export default PatternCategoryList;
