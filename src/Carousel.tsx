import * as React from 'react';
import { Attachment } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { FormatState } from './Store';
import { HScroll } from './HScroll';
import { konsole } from './Chat';

export interface CarouselProps {
    format: FormatState,
    attachments: Attachment[],
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}

export interface CarouselState {
    rootStyle: React.CSSProperties;
}

export class Carousel extends React.Component<CarouselProps, CarouselState> {
    private root: HTMLDivElement;
    private hscroll: HScroll;

    constructor(props: CarouselProps) {
        super(props);

        this.state = { rootStyle: undefined };
    }

    private trySetContentWidth() {
        //after the attachments have been rendered, we can now measure their actual width
        if (!this.state.rootStyle) {
            const width = this.props.format.chatWidth - this.props.format.carouselMargin;
            if (this.root.offsetWidth > width) {
                // the content width is bigger than the space allotted, so we'll clip it to force scrolling
                this.setState({ rootStyle: { width } });
            }
        }
    }

    componentDidMount() {
        this.trySetContentWidth();
    }

    componentDidUpdate() {
        this.trySetContentWidth();
    }

    componentWillReceiveProps(nextProps: CarouselProps) {
        konsole.log('carousel componentWillReceiveProps');

        if (this.props.format.chatWidth != nextProps.format.chatWidth) {
            //this will invalidate the saved measurement, in componentDidUpdate a new measurement will be triggered
            this.setState({ rootStyle: undefined });
        }
    }

    render() {
        return (
            <div className="wc-carousel" ref={ div => this.root = div } style={ this.state.rootStyle }>
                <HScroll ref={ hscroll => this.hscroll = hscroll }
                    prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                    nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                    scrollUnit="item"
                >
                    <CarouselAttachments { ... this.props }/>
                </HScroll>
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
        return this.props.attachments !== nextProps.attachments || this.props.format !== nextProps.format;
    }

    render() {
        console.log("render CarouselAttachments");
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
