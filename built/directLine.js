"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var ConsoleProvider_1 = require('./ConsoleProvider');
var intervalRefreshToken = 28 * 60 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain, devConsole) {
        var _this = this;
        if (domain === void 0) { domain = "https://directline.botframework.com"; }
        if (devConsole === void 0) { devConsole = new ConsoleProvider_1.NullConsoleProvider(); }
        this.domain = domain;
        this.devConsole = devConsole;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.statusToSeverity = function (status, defaultSev) {
            var statusCode = "" + status;
            if (statusCode.match(/^2\d\d$/))
                return defaultSev;
            return ConsoleProvider_1.Severity.error;
        };
        this.logResponse = function (defaultSev, text, response) {
            _this.devConsole.add(_this.statusToSeverity(response.status, defaultSev), text, response.status, response.responseText);
        };
        this.logError = function (text, response) {
            var severity = _this.statusToSeverity(response.status, ConsoleProvider_1.Severity.info);
            if (severity == ConsoleProvider_1.Severity.error)
                _this.devConsole.error(text, response.status, response.responseText);
        };
        this.postMessage = function (text, from, channelData) {
            _this.devConsole.log('Post message', text, from, channelData);
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/messages",
                body: {
                    text: text,
                    from: from.id,
                    conversationId: _this.conversationId,
                    channelData: channelData
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .do(function (response) { return _this.logResponse(ConsoleProvider_1.Severity.info, 'Response', response); })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .mapTo(true);
        };
        this.postFile = function (file) {
            var formData = new FormData();
            formData.append('file', file);
            _this.devConsole.log('Post file', file.name);
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/upload",
                body: formData,
                headers: {
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .do(function (response) { return _this.logResponse(ConsoleProvider_1.Severity.info, 'Response', response); })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .mapTo(true);
        };
        this.getActivities = function () {
            return new rxjs_1.Observable(function (subscriber) {
                return _this.activitiesGenerator(subscriber);
            })
                .concatAll()
                .do(function (dlm) { return console.log("DL Message", dlm); })
                .map(function (dlm) {
                if (dlm.channelData) {
                    var channelData = dlm.channelData;
                    switch (channelData.type) {
                        case "message":
                            return Object.assign({}, channelData, {
                                id: dlm.id,
                                conversation: { id: dlm.conversationId },
                                timestamp: dlm.created,
                                from: { id: dlm.from },
                                channelData: null,
                            });
                        default:
                            return channelData;
                    }
                }
                else {
                    return {
                        type: "message",
                        id: dlm.id,
                        conversation: { id: dlm.conversationId },
                        timestamp: dlm.created,
                        from: { id: dlm.from },
                        text: dlm.text,
                        textFormat: "markdown",
                        eTag: dlm.eTag,
                        attachments: dlm.images && dlm.images.map(function (path) { return {
                            contentType: "image/png",
                            contentUrl: _this.domain + path,
                            name: '2009-09-21'
                        }; })
                    };
                }
            });
        };
        this.activitiesGenerator = function (subscriber, watermark) {
            _this.getActivityGroup(watermark).subscribe(function (messageGroup) {
                var someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
                if (someMessages) {
                    _this.devConsole.log("Received " + messageGroup.messages.length + " messages");
                    subscriber.next(rxjs_1.Observable.from(messageGroup.messages));
                }
                setTimeout(function () { return _this.activitiesGenerator(subscriber, messageGroup && messageGroup.watermark); }, someMessages && messageGroup.watermark ? 0 : 3000);
            }, function (error) { return subscriber.error(error); });
        };
        this.getActivityGroup = function (watermark) {
            if (watermark === void 0) { watermark = ""; }
            return rxjs_1.Observable.ajax({
                method: "GET",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/messages?watermark=" + watermark,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .do(function (response) { return _this.logError('Get messages', response); })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .map(function (ajaxResponse) { return ajaxResponse.response; });
        };
        this.devConsole.log('Start new conversation');
        this.token = secretOrToken.secret || secretOrToken.token;
        rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/api/conversations",
            headers: {
                "Accept": "application/json",
                "Authorization": "BotConnector " + this.token
            }
        })
            .do(function (response) { return _this.logError("Start Conversation", response); })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .subscribe(function (conversation) {
            _this.conversationId = conversation.conversationId;
            _this.connected$.next(true);
            if (!secretOrToken.secret) {
                rxjs_1.Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(function (_) {
                    return rxjs_1.Observable.ajax({
                        method: "GET",
                        url: _this.domain + "/api/tokens/" + _this.conversationId + "/renew",
                        headers: {
                            "Authorization": "BotConnector " + _this.token
                        }
                    })
                        .do(function (response) { return _this.logError('Token renew', response); })
                        .retryWhen(function (error$) { return error$.delay(1000); })
                        .map(function (ajaxResponse) { return ajaxResponse.response; });
                }).subscribe(function (token) {
                    _this.devConsole.log("Refreshing token", token, "at", new Date());
                    _this.token = token;
                });
            }
        });
        this.activities$ = this.connected$
            .filter(function (connected) { return connected === true; })
            .flatMap(function (_) { return _this.getActivities(); });
    }
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map