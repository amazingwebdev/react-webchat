import * as React from 'react';
import { Attachment } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { FormatState } from './Store';
import { konsole } from './Chat';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/Observable/fromEvent';
import 'rxjs/add/Observable/merge';

export interface CarouselProps {
    format: FormatState,
    attachments: Attachment[],
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}

export interface CarouselState {
    contentWidth: number;
    previousButtonEnabled: boolean;
    nextButtonEnabled: boolean;
}

export class Carousel extends React.Component<CarouselProps, CarouselState> {
    private root: HTMLDivElement;
    private scrollDiv: HTMLDivElement;
    private scrollStartTimer: number;
    private scrollSyncTimer: number;
    private scrollDurationTimer: number;
    private animateDiv: HTMLDivElement;
    private scrollAllowInterrupt = true;

    private scrollSubscription: Subscription;
    private previousButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;

    constructor(props: CarouselProps) {
        super(props);

        this.state = {
            contentWidth: undefined,
            previousButtonEnabled: false,
            nextButtonEnabled: false
        };
    }

    private clearScrollTimers() {
        clearInterval(this.scrollStartTimer);
        clearInterval(this.scrollSyncTimer);
        clearTimeout(this.scrollDurationTimer);

        document.body.removeChild(this.animateDiv);

        this.animateDiv = null;
        this.scrollStartTimer = null;
        this.scrollSyncTimer = null;
        this.scrollDurationTimer = null;
        this.scrollAllowInterrupt = true;
    }

    private manageScrollButtons(forceUpdate = false) {
        const previousButtonEnabled = this.scrollDiv.scrollLeft > 0;
        const nextButtonEnabled = this.scrollDiv.scrollLeft < this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth;
        if (forceUpdate
            || nextButtonEnabled != this.state.nextButtonEnabled
            || previousButtonEnabled != this.state.previousButtonEnabled) {
                console.log("change button state");
                this.setState({ previousButtonEnabled, nextButtonEnabled });
            }
    }

    componentDidMount() {
        konsole.log('carousel componentDidUpdate');
        this.manageScrollButtons(true);

        this.scrollSubscription = Observable.fromEvent<UIEvent>(this.scrollDiv, 'scroll').subscribe(event => {
            this.manageScrollButtons();
        });

        Observable.merge(
            Observable.fromEvent<UIEvent>(this.previousButton, 'click').map(_ => -1),
            Observable.fromEvent<UIEvent>(this.nextButton, 'click').map(_ => 1)
        ).subscribe(delta => {
            console.log("scroll button", delta);
            this.scrollBy(delta);
        });

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
    }

    componentDidUpdate() {
        konsole.log('carousel componentDidUpdate');

        if (this.state.contentWidth == undefined) {
            console.log("measuring contentWidth");
            this.root.style.width = '';
            this.setState({ contentWidth: this.root.offsetWidth });
        } else {
            this.manageScrollButtons();
        }
    }

    componentWillReceiveProps(nextProps: CarouselProps) {
        konsole.log('carousel componentWillReceiveProps');

        if (this.props.format.chatWidth != nextProps.format.chatWidth) {
            //this will invalidate the saved measurement, in componentDidUpdate a new measurement will be triggered
            this.setState({ contentWidth: undefined });
        }
    }

    componentWillUnmount() {
        this.scrollSubscription.unsubscribe();
    }

    private scrollBy(increment: number) {
        if (!this.scrollAllowInterrupt) return;

        let easingClassName = 'wc-animate-scroll';

        //cancel existing animation when clicking fast
        if (this.animateDiv) {
            easingClassName = 'wc-animate-scroll-rapid';
            this.clearScrollTimers();
        }

        //the width of the li is measured on demand in case CSS has resized it
        const firstItem = this.scrollDiv.querySelector('.wc-carousel-item') as HTMLElement;
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth;
        const scrollLeft = this.scrollDiv.scrollLeft;
        let dest = scrollLeft + increment * itemWidth;

        //don't exceed boundaries
        dest = Math.max(dest, 0);
        dest = Math.min(dest, this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);

        if (scrollLeft == dest) return;

        //use proper easing curve when distance is small
        if (Math.abs(dest - scrollLeft) < itemWidth) {
            easingClassName = 'wc-animate-scroll-near';
            this.scrollAllowInterrupt = false;
        }

        this.animateDiv = document.createElement('div');
        this.animateDiv.className = easingClassName;
        this.animateDiv.style.left = scrollLeft + 'px';
        document.body.appendChild(this.animateDiv);

        //capture ComputedStyle every millisecond
        this.scrollSyncTimer = setInterval(() => {
            this.scrollDiv.scrollLeft = parseFloat(getComputedStyle(this.animateDiv).left);
        }, 1);

        //don't let the browser optimize the setting of 'this.animateDiv.style.left' - we need this to change values to trigger the CSS animation
        //we accomplish this by calling 'this.animateDiv.style.left' off this thread, using setTimeout
        this.scrollStartTimer = setTimeout(() => {
            this.animateDiv.style.left = dest + 'px';

            let duration = 1000 * parseFloat(getComputedStyle(this.animateDiv).transitionDuration);
            if (duration) {
                //slightly longer that the CSS time so we don't cut it off prematurely
                duration += 50;

                //stop capturing
                this.scrollDurationTimer = setTimeout(() => this.clearScrollTimers(), duration);
            } else {
                this.clearScrollTimers();
            }
        }, 1);
    }

    render() {
        let style: React.CSSProperties;
        if (this.props.format.chatWidth != undefined) {
            const maxMessageContentWidth = this.props.format.chatWidth - this.props.format.carouselMargin;
            if (this.state.contentWidth > maxMessageContentWidth) {
                style = { width: maxMessageContentWidth }
            }
        }

        return (
            <div className="wc-carousel" ref={ div => this.root = div } style={ style }>
                <button disabled={ !this.state.previousButtonEnabled } className="scroll previous" ref={ button => this.previousButton = button}>
                    <svg>
                        <path d="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" />
                    </svg>
                </button>
                <div className="wc-carousel-scroll-outer">
                    <div className="wc-carousel-scroll" ref={ div => this.scrollDiv = div }>
                        <CarouselAttachments { ... this.props }/>
                    </div>
                </div>
                <button disabled={ !this.state.nextButtonEnabled } className="scroll next" ref={ button => this.nextButton = button}>
                    <svg>
                        <path d="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z" />
                    </svg>
                </button>
            </div >
        )
    }
}

export interface CarouselAttachmentProps {
    format: FormatState
    attachments: Attachment[]
    onCardAction: (type: string, value: string) => void
    onImageLoad: () => void
}

class CarouselAttachments extends React.Component<CarouselAttachmentProps, {}> {

    shouldComponentUpdate(nextProps: CarouselAttachmentProps) {
        return this.props.attachments != this.props.attachments || this.props.format != nextProps.format;
    }

    render() {
        console.log("rendering carouselAttachment");
        const { attachments, ... props } = this.props;
        return (
            <ul>{ this.props.attachments.map((attachment, index) =>
                <li key={ index } className="wc-carousel-item">
                    <AttachmentView attachment={ attachment } { ... props }/>
                </li>
            ) }</ul>
        );
    }
}
