"use strict";
/*
 * Activity for Animation
 *
 */
var ani_media = {
    url: "http://i.imgur.com/wJTZIPB.gif",
    profile: "animation"
};
var ani_content1 = {
    title: "title",
    subtitle: "animation",
    text: "No buttons, No Image, Autoloop, Autostart, Sharable",
    media: [ani_media],
    shareable: true,
    autoloop: true,
    autostart: true
};
var ani_attach1 = {
    contentType: "application/vnd.microsoft.card.animation",
    content: ani_content1
};
exports.ani_card = {
    type: "message",
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [ani_attach1]
};
/*
 * Activity for Carousel
 *
 */
var car_content1 = {
    title: "Details about image 1",
    text: "Price: $XXX.XX USD",
    images: [
        {
            url: "https://compass-ssl.surface.com/assets/b7/3c/b73ccd0e-0e08-42b5-9f8d-9143223eafd0.jpg?n=Hero-panel-image-gallery_03.jpg"
        }
    ],
    buttons: [
        {
            type: "imBack",
            value: "Place to buy",
            title: "Places To Buy"
        },
        {
            type: "imBack",
            value: "Related Products",
            title: "Related Products"
        }
    ]
};
var car_attach1 = {
    contentType: "application/vnd.microsoft.card.hero",
    content: car_content1
};
var car_content2 = {
    title: "Details about image 2",
    text: "Price: $XXX.XX USD",
    images: [
        {
            "url": "https://compass-ssl.surface.com/assets/b5/82/b582f7f9-93ee-4ce8-971f-aacf5426decb.jpg?n=Hero-panel-image-gallery_02.jpg"
        }
    ],
    buttons: [
        {
            "type": "imBack",
            "value": "Place to buy",
            "title": "Places To Buy"
        },
        {
            "type": "imBack",
            "value": "Related Products",
            "title": "Related Products"
        }
    ]
};
var car_attach2 = {
    contentType: "application/vnd.microsoft.card.hero",
    content: car_content2
};
var car_content3 = {
    title: "Details about image 3",
    text: "Price: $XXX.XX USD",
    images: [
        {
            "url": "https://compass-ssl.surface.com/assets/9d/8f/9d8fcc7b-0b81-487a-9e2f-97d83a49666a.jpg?n=Hero-panel-image-gallery_06.jpg"
        }
    ],
    buttons: [
        {
            "type": "imBack",
            "value": "Place to buy",
            "title": "Places To Buy"
        },
        {
            "type": "imBack",
            "value": "Related Products",
            "title": "Related Products"
        }
    ]
};
var car_attach3 = {
    contentType: "application/vnd.microsoft.card.hero",
    content: car_content3
};
var car_content4 = {
    title: "Details about image 4",
    text: "Price: $XXX.XX USD",
    images: [
        {
            "url": "https://compass-ssl.surface.com/assets/d6/b1/d6b1b79f-db1d-44f1-98ba-b822b7744940.jpg?n=Hero-panel-image-gallery_01.jpg"
        }
    ],
    buttons: [
        {
            "type": "imBack",
            "value": "Place to buy",
            "title": "Places To Buy"
        },
        {
            "type": "imBack",
            "value": "Related Products",
            "title": "Related Products"
        }
    ]
};
var car_attach4 = {
    contentType: "application/vnd.microsoft.card.hero",
    content: car_content4
};
exports.car_card = {
    type: "message",
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [car_attach1, car_attach2, car_attach3, car_attach4]
};
/*
 * Activity for Markdown
 *
 */
exports.mar_card = {
    type: "message",
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "## Basic formatting\r\n\r\nParagraphs can be written like so. A paragraph is the \r\nbasic block of Markdown. \r\nA paragraph is what text will turn \r\ninto when there is no reason it should become anything else.\r\n\r\nParagraphs must be separated by a blank line. Basic formatting of *italics* and **bold** is supported. This *can be **nested** like* so.\r\n\r\n#### Lists\r\n\r\n### Ordered list\r\n\r\n1. one\r\n2. two\r\n3. three\r\n4. four\r\n\r\n### Unordered list\r\n\r\n* An item\r\n* Another item\r\n* Yet another item\r\n* And there's more...\r\n\r\n## Paragraph modifiers\r\n\r\n### Code block\r\n\r\n```Code blocks are very useful for developers and other \r\npeople who look at code or other things that are written \r\nin plain text. As you can see, it uses a fixed-width font.```\r\n\r\nYou can also make `inline code` to add code into other things.\r\n\r\n### Quote\r\n\r\n> Here is a quote. What this is should be self explanatory. \r\n> Quotes are automatically indented when they are used.\r\n\r\n# h1\r\n## h2\r\n### h3\r\n#### h4\r\n\r\n### Headings *can* also contain **formatting**\r\n\r\n## URLs\r\n\r\nURLs can be made in a handful of ways:\r\n\r\n* A named link to [MarkItDown][3]. The easiest way to do these is to select what you want to make a link and hit `Ctrl+L`.\r\n* Another named link to [MarkItDown](http://www.markitdown.net/)\r\n* Sometimes you just want a URL like <http://www.markitdown.net/>.\r\n\r\n## Images\r\nThis is an image\r\n\r\n![Image of Surface](https://compass-ssl.surface.com/assets/b7/3c/b73ccd0e-0e08-42b5-9f8d-9143223eafd0.jpg?n=Hero-panel-image-gallery_03.jpg)\r\n\r\n\r\n## Horizontal rule\r\n\r\nA horizontal rule is a line that goes across the middle of the page.\r\n\r\n---\r\n\r\nIt's sometimes handy for breaking things up.\r\n\r\n\r\n## Table\r\n|header1|header 2|\r\n|----|----|\r\n| cell 1 | cell 2|\r\n| cell three | cell four|\r\n\r\n"
};
/*
 * Activity for SignIn
 *
 */
var si_content1 = {
    text: "Login to signin sample",
    buttons: [
        {
            type: "signin",
            title: "Signin",
            value: "https://login.live.com/"
        }
    ]
};
var si_attach1 = {
    contentType: "application/vnd.microsoft.card.signin",
    content: si_content1
};
exports.si_card = {
    type: "message",
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    attachments: [si_attach1]
};
