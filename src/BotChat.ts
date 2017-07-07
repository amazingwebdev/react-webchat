export { App, AppProps } from './App';
export { Chat, ChatProps, FormatOptions } from './Chat';
export * from 'botframework-directlinejs';
export { queryParams } from './Attachment';
export { SpeechOptions } from './SpeechOptions'
export { Speech } from './SpeechModule'
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.find-index';
