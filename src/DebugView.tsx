import * as React from 'react';
import { Reducer } from 'redux';
import { Activity } from './directLineTypes';
import { getStore, getState } from './Store';
import { HistoryAction } from './History';


export interface DebugState {
    selectedActivity: Activity
}

export type DebugAction = {
    type: 'placeholder'
} | HistoryAction;

export const debugReducer: Reducer<DebugState> = (
    state: DebugState = {
        selectedActivity: null
    },
    action: DebugAction
) => {
    switch (action.type) {
        case 'Select_Activity':
            return { selectedActivity: action.selectedActivity };
        default:
            return state;
    }
}

export interface DebugViewProps {
    // TODO
}

export class DebugView extends React.Component<DebugViewProps, {}> {
    storeUnsubscribe:any;

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    render() {
        const state = getState();
        return (
            <div className="wc-chatview-panel">
                <div className="wc-header">
                    <span>JSON</span>
                </div>
                <div className="wc-debugview">
                    <div className="wc-debugview-json">
                        { formatJSON(state.debug.selectedActivity || {}) }
                    </div>
                </div>
            </div>
        );
    }
}

const formatJSON = (obj: any) => {
    let json = JSON.stringify(obj, null, 2);
    // Hide ampersands we don't want replaced
    json = json.replace(/&(amp|apos|copy|gt|lt|nbsp|quot|#x?\d+|[\w\d]+);/g, '\x01');
    // Escape remaining ampersands and other HTML special characters
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Restore hidden ampersands
    json = json.replace(/\x01/g, '&');
    // Match all the JSON parts and add theming markup
    json = json.replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        (match) => {
            // Default to "number"
            let cls = 'number';
            // Detect the type of the JSON part
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            if (cls === 'key') {
                // Color string content, not the quotes or colon delimiter
                let exec = /"(.*)":\s*/.exec(match);
                return `"<span class="json-${cls}">${exec[1]}</span>": `;
            } else if (cls === 'string') {
                // Color string content, not the quotes
                let exec = /"(.*)"/.exec(match);
                return `"<span class="json-${cls}">${exec[1]}</span>"`;
            } else {
                return `<span class="json-${cls}">${match}</span>`;
            }
        })
    return <span dangerouslySetInnerHTML={ { __html: json } }/>;
}
