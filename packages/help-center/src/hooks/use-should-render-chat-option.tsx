import { useSupportAvailability } from '@automattic/data-stores';
import useMessagingAvailability from './use-messaging-availability';

type Result = {
	render: boolean;
	state: 'AVAILABLE' | 'UNAVAILABLE' | 'CLOSED';
	isLoading: boolean;
	eligible: boolean;
};

export function useShouldRenderChatOption(): Result {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { data, isLoading } = useMessagingAvailability( Boolean( chatStatus?.is_user_eligible ) );

	if ( ! chatStatus?.is_user_eligible ) {
		return {
			render: false,
			isLoading,
			state: chatStatus?.is_chat_closed ? 'CLOSED' : 'UNAVAILABLE',
			eligible: false,
		};
	} else if ( chatStatus?.is_chat_closed ) {
		return {
			render: true,
			state: 'CLOSED',
			isLoading,
			eligible: true,
		};
	} else if ( data?.is_available ) {
		return {
			render: true,
			state: 'AVAILABLE',
			isLoading,
			eligible: true,
		};
	}
	return {
		render: true,
		state: 'UNAVAILABLE',
		isLoading,
		eligible: true,
	};
}
