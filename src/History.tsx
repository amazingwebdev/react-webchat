import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, User } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { ActivityView } from './ActivityView';
import { sendMessage, sendPostBack, trySendMessage, FormatOptions } from './Chat';
import { Strings } from './Strings';

interface Props {
    store: ChatStore,
    selectActivity?: (activity: Activity) => void
}

export class History extends React.Component<Props, {}> {
    scrollMe: HTMLElement;
    scrollToBottom = true;
    atBottomThreshold = 80;
    scrollEventListener: () => void;
    resizeListener: () => void;

    constructor(props: Props) {
        super(props);
        this.scrollEventListener = () => this.checkBottom();
        this.resizeListener = () => this.checkBottom();
    }

    componentDidMount() {
        this.scrollMe.addEventListener('scroll', this.scrollEventListener);
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        this.scrollMe.removeEventListener('scroll', this.scrollEventListener);
        window.removeEventListener('resize', this.resizeListener);
    }

    checkBottom() {
        const offBottom = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight - this.scrollMe.scrollTop; 
        this.scrollToBottom = offBottom <= this.atBottomThreshold;
    }

    componentDidUpdate() {
        this.autoscroll();
    }

    autoscroll = () => {
        if (this.scrollToBottom && (this.scrollMe.scrollHeight > this.scrollMe.offsetHeight))
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    onClickRetry(e: React.MouseEvent<HTMLAnchorElement>, activity: Activity) {
        // Since this is a click on an anchor, we need to stop it
        // from trying to actually follow a (nonexistant) link
        e.preventDefault();
        e.stopPropagation();
        trySendMessage(this.props.store)(activity.channelData.clientActivityId, true);
    }

    render() {
        const state = this.props.store.getState();

        return <HistoryView
                activities={ state.history.activities }
                selectedActivity={ state.history.selectedActivity }
                user={ state.connection.user }
                options={ state.format.options }
                strings={ state.format.strings }
                sendMessage={ sendMessage(this.props.store) }
                sendPostBack={ sendPostBack(this.props.store) }
                onClickActivity={ this.props.selectActivity }
                onClickRetry={ (e, activity) => this.onClickRetry(e, activity) }
                autoscroll={ this.autoscroll }
                setScroll={ div => this.scrollMe = div }
            />;
    }
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

const HistoryView = (props: {
    activities: Activity[],
    selectedActivity: Activity,
    user: User,
    options: FormatOptions,
    strings: Strings,
    sendMessage: (value: string) => void,
    sendPostBack: (value: string) => void,
    onClickActivity: (activity: Activity) => void,
    onClickRetry: (e: React.MouseEvent<HTMLAnchorElement>, activity: Activity) => void,
    autoscroll: () => void,
    setScroll: (div: HTMLDivElement) => void
}) => 
    <div className="wc-message-groups" ref={ props.setScroll }>
        <div className="wc-message-group">
            <div className="wc-message-group-content">
                { props.activities.map((activity, index) => 
                    <WrappedActivity 
                        key={ 'message' + index }
                        activity={ activity }
                        showTimestamp={ index === props.activities.length - 1 || (index + 1 < props.activities.length && suitableInterval(activity, props.activities[index + 1])) }
                        selected={ activity === props.selectedActivity }
                        fromMe={ activity.from.id === props.user.id }
                        options={ props.options }
                        strings={ props.strings }
                        sendMessage={ props.sendMessage }
                        sendPostBack={ props.sendPostBack }
                        onClickActivity={ props.onClickActivity && (() => props.onClickActivity(activity)) }
                        onClickRetry={ e => props.onClickRetry(e, activity) }
                        autoscroll={ props.autoscroll }
                    />
                ) }
            </div>
        </div>
    </div>;

interface WrappedActivityProps {
    activity: Activity,
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    options: FormatOptions,
    strings: Strings,
    sendMessage: (value: string) => void,
    sendPostBack: (value: string) => void,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>
    autoscroll: () => void,
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    render () {
        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ this.props.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ this.props.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { this.props.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ this.props.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = this.props.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        } 

        const who = this.props.fromMe ? 'me' : 'bot';

        return (
            <div className={ "wc-message-wrapper" + (this.props.onClickActivity ? ' clickable' : '') } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who }>
                    <div className={ 'wc-message-content' + (this.props.selected ? ' selected' : '') }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        <ActivityView options={ this.props.options} strings={ this.props.strings } activity={ this.props.activity } sendMessage={ this.props.sendMessage } sendPostBack={ this.props.sendPostBack } onImageLoad={ this.props.autoscroll }/>
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}