import * as React from 'react';

import { Attachment, CardAction } from 'botframework-directlinejs';
import { renderIfNonempty, konsole } from './Chat';
import { FormatState } from './Store';

const regExpCard = /\^application\/vnd\.microsoft\.card\./i;

const YOUTUBE_DOMAIN = "youtube.com";
const YOUTUBE_WWW_DOMAIN = "www.youtube.com";
const YOUTUBE_SHORT_DOMAIN = "youtu.be";
const YOUTUBE_WWW_SHORT_DOMAIN = "www.youtu.be";
const VIMEO_DOMAIN = "vimeo.com";
const VIMEO_WWW_DOMAIN = "www.vimeo.com";

export interface QueryParams {
    [propName: string]: string;
}

export const queryParams = (src: string) =>
    src
    .substr(1)
    .split('&')
    .reduce((previous, current) => {
        const keyValue = current.split('=');
        previous[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
        return previous;
    }, {} as QueryParams);

const queryString = (query: QueryParams) =>
    Object.keys(query)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(query[key].toString()))
    .join('&');

const Youtube = (props: {
    embedId: string,
    autoPlay?: boolean,
    loop?: boolean
}) =>
    <iframe
        type="text/html"
        src={ `https://${YOUTUBE_DOMAIN}/embed/${props.embedId}?${queryString({
            modestbranding: '1',
            loop: props.loop ? '1' : '0',
            autoplay: props.autoPlay ? '1' : '0'
        })}` }
    />;

const Vimeo = (props: {
    embedId: string,
    autoPlay?: boolean,
    loop?: boolean
}) =>
    <iframe
        type="text/html"
        src={ `https://player.${VIMEO_DOMAIN}/video/${props.embedId}?${queryString({
            title: '0',
            byline: '0',
            portrait: '0',
            badge: '0',
            autoplay: props.autoPlay ? '1' : '0',
            loop: props.loop ? '1' : '0'
        })}` }
    />;

const Video = (props: {
    src: string,
    poster?: string,
    autoPlay?:boolean,
    loop?: boolean,
    onLoad?: () => void,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => {
    const url = document.createElement('a');
    url.href = props.src;

    const urlQueryParams = queryParams(url.search);
    const pathSegments = url.pathname.substr(1).split('/');

    switch (url.hostname) {
        case YOUTUBE_DOMAIN:
        case YOUTUBE_SHORT_DOMAIN:
        case YOUTUBE_WWW_DOMAIN:
        case YOUTUBE_WWW_SHORT_DOMAIN:
            return <Youtube
                embedId={ url.hostname === YOUTUBE_DOMAIN || url.hostname === YOUTUBE_WWW_DOMAIN ? urlQueryParams['v'] : pathSegments[pathSegments.length-1] }
                { ... props }
            />;

        case VIMEO_WWW_DOMAIN:
        case VIMEO_DOMAIN:
            return <Vimeo embedId={ pathSegments[pathSegments.length-1] } { ... props } />

        default:
            return <video controls { ... props } />
    }
}

const Media = (props: {
    src: string,
    type?: 'image' | 'video' | 'audio',   // defaults to 'image'
    poster?: string,
    autoPlay?:boolean,
    loop?: boolean,
    onLoad?: () => void,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => {
    switch (props.type) {
        case 'video':
            return <Video { ... props } />
        case 'audio':
            return <audio controls { ... props } />;
        default:
            return <img { ... props } />;
    }
}

const Unknown = (props: {
    format: FormatState,
    contentType: string,
    contentUrl: string,
    name: string
}) => {
    if (regExpCard.test(props.contentType)) {
        return <span>{ props.format.strings.unknownCard.replace('%1', props.contentType) }</span>;
    } else if (props.contentUrl) {
        return <span><a href={ props.contentUrl } title={ props.contentUrl } target='_blank'>{ props.name || props.format.strings.unknownFile.replace('%1', props.contentType) }</a></span>;
    } else {
        return <span>{ props.format.strings.unknownFile.replace('%1', props.contentType) }</span>;
    }
}

const mediaType = (url: string) =>
    url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif' ? 'image' : 'video';

const title = (title: string) => renderIfNonempty(title, title => <h1>{ title }</h1>);
const subtitle = (subtitle: string) => renderIfNonempty(subtitle, subtitle => <h2>{ subtitle }</h2>);
const text = (text: string) => renderIfNonempty(text, text => <p>{ text }</p>);

export const AttachmentView = (props: {
    format: FormatState;
    attachment: Attachment,
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    if (!props.attachment) return;

    const attachment = props.attachment;

    const onCardAction = (cardAction: CardAction) => cardAction &&
        ((e: React.MouseEvent<HTMLElement>) => {
            props.onCardAction(cardAction.type, cardAction.value);
            e.stopPropagation();
        });

    const buttons = (buttons: CardAction[]) => buttons &&
        <ul className="wc-card-buttons">
            { buttons.map((button, index) => <li key={ index }><button onClick={ onCardAction(button) }>{ button.title }</button></li>) }
        </ul>;

    const attachedImage = (
        images: {
            url: string,
            tap?: CardAction // deprecated field for Skype channels. For testing legacy bots in Emulator only.
        }[]
    ) => images && images.length > 0 &&
        <Media src={ images[0].url } onLoad={ props.onImageLoad } onClick={ onCardAction(images[0].tap) } />;

    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card hero' onClick={ onCardAction(attachment.content.tap) }>
                    { attachedImage(attachment.content.images) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card thumbnail' onClick={ onCardAction(attachment.content.tap) }>
                    { title(attachment.content.title) }
                    { attachedImage(attachment.content.images) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card video'>
                    <Media
                        type='video'
                        src={ attachment.content.media[0].url }
                        onLoad={ props.onImageLoad }
                        poster={ attachment.content.image && attachment.content.image.url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );


        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card animation'>
                    <Media
                        type={ mediaType(attachment.content.media[0].url) }
                        src={ attachment.content.media[0].url }
                        onLoad={ props.onImageLoad }
                        poster={ attachment.content.image && attachment.content.image.url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card audio'>
                    <Media
                        type='audio'
                        src={ attachment.content.media[0].url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card signin'>
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card receipt' onClick={ onCardAction(attachment.content.tap) }>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={ 2 }>{ attachment.content.title }</th>
                            </tr>
                            { attachment.content.facts && attachment.content.facts.map((fact, i) => <tr key={'fact' + i}><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ attachment.content.items && attachment.content.items.map((item, i) =>
                            <tr key={'item' + i} onClick={ onCardAction(item.tap) }>
                                <td>
                                    { item.image && <Media src={ item.image.url } onLoad={ props.onImageLoad } /> }
                                    { renderIfNonempty(
                                        item.title,
                                        title => <div className="title">
                                            { item.title }
                                        </div>)
                                    }
                                    { renderIfNonempty(
                                        item.subtitle,
                                        subtitle => <div className="subtitle">
                                            { item.subtitle }
                                        </div>)
                                    }
                                </td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            { renderIfNonempty(
                                attachment.content.tax,
                                tax => <tr>
                                    <td>{ props.format.strings.receiptTax }</td>
                                    <td>{ attachment.content.tax }</td>
                                </tr>)
                            }
                            { renderIfNonempty(
                                attachment.content.total,
                                total => <tr className="total">
                                    <td>{ props.format.strings.receiptTotal }</td>
                                    <td>{ attachment.content.total }</td>
                                </tr>)
                            }
                        </tfoot>
                    </table>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        // Deprecated format for Skype channels. For testing legacy bots in Emulator only.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card flex'>
                    { attachedImage(attachment.content.images) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return <Media src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        case "audio/mpeg":
        case "audio/mp4":
            return <Media type='audio' src={ attachment.contentUrl } />;

        case "video/mp4":
            return <Media type='video' src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        default:
            return <Unknown format={ props.format } contentType={ (attachment as any).contentType } contentUrl={ (attachment as any).contentUrl } name={ (attachment as any).name } />;
    }
}