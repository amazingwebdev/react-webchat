import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, User, IBotConnection, Message } from 'botframework-directlinejs';
import { HistoryAction, ChatState, FormatState } from './Store';
import { ActivityView } from './ActivityView';
import { sendMessage, sendPostBack, konsole, ActivityOrID } from './Chat';
import { Dispatch, connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface Props {
    format: FormatState
    activities: Activity[],
    selectedActivity: Activity
    user: User,
    botConnection: IBotConnection,
    selectedActivitySubject: BehaviorSubject<ActivityOrID>,
    dispatch: Dispatch<any>
}

class HistoryContainer extends React.Component<Props, {}> {
    private scrollMe: HTMLDivElement;
    private scrollContent: HTMLDivElement;
    private scrollToBottom = true;

    constructor(props: Props) {
        super(props);
    }

    componentWillUpdate() {
        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= 1);
    }

    componentDidUpdate() {
        this.autoscroll();
    }

    private autoscroll() {
        const vAlignBottomPadding = Math.max(0, measurePaddedHeight(this.scrollMe) - this.scrollContent.offsetHeight);
        this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';

        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    private onClickRetry(activity: Activity) {
        this.props.dispatch<HistoryAction>({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId });
    }

    private onCardAction(type: string, value: string) {
        switch (type) {
            case "imBack":
                sendMessage(this.props.dispatch, value, this.props.user, this.props.format.locale);
                break;
            case "postBack":
                sendPostBack(this.props.botConnection, value, this.props.user, this.props.format.locale);
                break;

            case "call":
            case "openUrl":
            case "playAudio":
            case "playVideo":
            case "showImage":
            case "downloadFile":
            case "signin":
                window.open(value);
                break;

            default:
                konsole.log("unknown button type", type);
            }
    }

    private onSelectActivity(activity: Activity) {
        this.props.selectedActivitySubject.next({ activity });
    }

    private measureMessage(measurableActivity: WrappedActivity, largeWidth: number) {
        if (!measurableActivity) return;

        //measure the message padding by subtracting the known large width
        const paddedWidth = measurePaddedWidth(measurableActivity.messageDiv) - largeWidth;

        //subtract the padding from the offsetParent's width to get the width of the content
        const maxContentWidth = (measurableActivity.messageDiv.offsetParent as HTMLElement).offsetWidth - paddedWidth;
        
        //subtract the content width from the chat width to get the margin.
        //Next time we need to get the content width (in a resize) we only will need to use this margin to get the maximum content width
        const contentMargin = this.props.format.chatWidth - maxContentWidth;
        
        konsole.log('history measureMessage ' + contentMargin);

        this.props.dispatch<FormatAction>({ 
            type: 'Set_Measurements',
            contentMargin: contentMargin }
        );
    }

    private measurableMessage() {

        //only measure when we don't have the measurement
        if (this.props.format.maxMessageContentMargin != undefined) return;

        //can't measure unless we have the chat width
        if (!this.props.format.chatWidth) return;

        //any value arbitrarily larger than the chat width
        const largeWidth = this.props.format.chatWidth * 2;
        
        //by setting the width larger than the chat itself, we are able to find the largest possible message content size
        const tempStyle: React.CSSProperties = { width: largeWidth };

        //create a fake Activity object with carousel layout
        const tempActivity: Activity = { id: '', type: 'message', from: { id: '' }, attachmentLayout: 'carousel' };

        return (
            <WrappedActivity 
                ref = { x => this.measureMessage(x, largeWidth) }
                activity = { tempActivity }
                format = { null }
                fromMe = { false }
                onCardAction = { null }
                onClickActivity = { null }
                onClickRetry = { null }
                onImageLoad = { null }
                selected = { false }
                showTimestamp = { false }
                children = { <div style={ tempStyle } >&nbsp;</div> }
            />
        );
        
    }

    render() {

        return (
            <div className="wc-message-groups" ref={ div => this.scrollMe = div || this.scrollMe }>
                <div className="wc-message-group-content" ref={ div => this.scrollContent = div }>
                    { this.measurableMessage() }
                    { this.props.activities.map((activity, index) =>
                        <WrappedActivity
                            key={ 'message' + index }
                            activity={ activity }
                            showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                            selected={ activity === this.props.selectedActivity }
                            fromMe={ activity.from.id === this.props.user.id }
                            format={ this.props.format }
                            onCardAction={ (type, value) => this.onCardAction(type, value) }
                            onClickActivity={ this.props.selectedActivitySubject && (() => this.onSelectActivity(activity)) }
                            onClickRetry={ e => {
                                // Since this is a click on an anchor, we need to stop it
                                // from trying to actually follow a (nonexistant) link
                                e.preventDefault();
                                e.stopPropagation();
                                this.onClickRetry(activity)
                            } }
                            onImageLoad={ () => this.autoscroll() }
                        />
                    ) }
                </div>
            </div>
        )
    }
}

export const History = connect(
    (state: ChatState): Partial<Props> => ({
        activities: state.history.activities,
        selectedActivity: state.history.selectedActivity,
        format: state.format,
        user: state.connection.user,
        botConnection: state.connection.botConnection,
        selectedActivitySubject: state.connection.selectedActivity
    })
)(HistoryContainer)

const getComputedStyleValues = (el: HTMLElement, stylePropertyNames: string[]) => {
    const s = window.getComputedStyle(el);
    const result: { [key: string]: number } = {};
    stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
    return result;
}

const measurePaddedHeight = (el: HTMLElement): number => {
    const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
}

const measurePaddedWidth = (el: HTMLElement): number => {
    const paddingLeft = 'padding-left', paddingRight = 'padding-right';
    const values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
    return el.offsetWidth + values[paddingLeft] + values[paddingRight];
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

interface WrappedActivityProps {
    activity: Activity,
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    format: FormatState,
    onCardAction: (type: string, value: string) => void,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>
    onImageLoad: () => void,
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
    public messageDiv: HTMLDivElement;

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    render () {
        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ this.props.format.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ this.props.format.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { this.props.format.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ this.props.format.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        }

        const who = this.props.fromMe ? 'me' : 'bot';

        const wrapperClassName = [
            'wc-message-wrapper',
            (this.props.activity as Message).attachmentLayout || 'list',
            this.props.onClickActivity ? 'clickable' : ''
        ].join(' ');

        const contentClassName = [
            'wc-message-content',
            this.props.selected ? 'selected' : ''
        ].join(' ');


        return (
            <div data-activity-id={ this.props.activity.id } className={ wrapperClassName } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who } ref={ div => this.messageDiv = div }>
                    <div className={ contentClassName }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        <ActivityView
                            activity={ this.props.activity }
                            format={ this.props.format }
                            onCardAction={ this.props.onCardAction }
                            onImageLoad={ this.props.onImageLoad }
                        />
                        { this.props.children }
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}