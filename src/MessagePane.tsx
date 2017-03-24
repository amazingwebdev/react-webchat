import * as React from 'react';
import { Activity, CardAction, User, Message } from 'botframework-directlinejs';
import { ChatState, TrackedActivity, HistoryAction } from './Store';
import { connect } from 'react-redux';
import { HScroll } from './HScroll';
import { konsole, classList, doCardAction, sendMessage } from './Chat';

export interface MessagePaneProps {
    activityWithActions: Message,
    onClickSuggestedActions: (activity: TrackedActivity) => any,
    doCardAction: (sendMessage: (text: string, from: User, locale: string) => void) => (type: string, value: string) => void,
    sendMessage: (value: string, user: User, locale: string) => void,
    children: React.ReactNode
}

const MessagePaneView = (props: MessagePaneProps) => 
    <div className={ classList('wc-message-pane', props.activityWithActions && 'show-actions' ) }>
        { props.children }
        <SuggestedActions { ... props }/>
    </div>;

class SuggestedActions extends React.Component<MessagePaneProps, {}> {
    constructor(props: MessagePaneProps) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {

        //click is only valid if there are props.actions
        if (this.props.activityWithActions) {

            this.props.onClickSuggestedActions(this.props.activityWithActions);

            this.props.doCardAction(this.props.sendMessage)(cardAction.type, cardAction.value);
        }
    
        e.stopPropagation();
    }

    shouldComponentUpdate(nextProps: MessagePaneProps) {
        //update only when there are actions. We want the old actions to remain displayed as it animates down.
        return !!nextProps.activityWithActions;
    }

    render() {
        if (!this.props.activityWithActions) return null;

        return (
            <div className="wc-suggested-actions">
                <HScroll
                    prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                    nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                    scrollUnit="page"
                >
                    <ul>
                        { this.props.activityWithActions.suggestedActions.map((action, index) => <li key={ index }><button onClick={ e => this.actionClick(e, action) } title={ action.title } >{ action.title }</button></li>) }
                    </ul>
                </HScroll>
            </div>
        );
    }

}

function activityWithSuggestedActions(activities: Activity[]) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (!lastActivity 
        || lastActivity.type !== 'message' 
        || !lastActivity.suggestedActions 
        || lastActivity.suggestedActions.length === 0 
        || (lastActivity as TrackedActivity).clicked)
        return;
    return lastActivity;
}

export const MessagePane = connect(
    (state: ChatState): Partial<MessagePaneProps> => ({
        activityWithActions: activityWithSuggestedActions(state.history.activities),
        doCardAction: doCardAction(state.connection.botConnection, state.connection.user, state.format.locale),
    }),
    {
        onClickSuggestedActions: (activity: TrackedActivity) => {
            return { type: 'Clicked_SuggestedActions', clickedActivity: activity } as HistoryAction;
        },
        sendMessage: sendMessage
    }
)(MessagePaneView);
