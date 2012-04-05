/**
 * # Example
 *
 *     @example
 *     Ext.define('myapp.Application', {
 *         extend: 'Ext.app.Application',
 *         name: 'myapp',
 *
 *         requires: [
 *             'extjsclasses.utils.Router'
 *         ],
 *     
 *         launch: function() {
 *             this.route = Ext.create('extjsclasses.Router', this);
 *             this.route.add("", 'dashboard');
 *             this.route.add("/pages/", 'showAllPages');
 *             this.route.add("/pages/:id/", 'showPage');
 *             this.route.start();
 *         },
 *
 *         dashboard: function(routeInfo) {
 *              ...
 *         },
 *         showAllPages: function(routeInfo) {
 *              ...
 *         },
 *         showPage: function(routeInfo, id) {
 *              ...
 *         },
 *         routeNotFound: function(routeInfo) {
 *              ...
 *         },
 *    
 *    }); 
 */
Ext.define('extjsclasses.utils.Router', {
    extend: 'Ext.util.Observable',
    requires: [
        'Ext.util.History'
    ],

    namedParam: /:\w+/g,
    splatParam: /\*\w+/g,
    escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,

    constructor: function(handler) {
        this.handler = handler;
        this.routes = [];
        this.started = false;
        this.callParent();
    },

    add: function(pattern, action) {
        var regex;
        if(Ext.typeOf(pattern) == 'regexp') {
            regex = pattern;
        } else if(Ext.typeOf(pattern) == 'string') {
            regex = this._patternToRegExp(pattern);
        } else {
            throw 'pattern must be regex.';
        }
        this.routes.push({
            regex: regex,
            action: action
        });
    },

    start: function() {
        if(this.started) {
            throw "Can only start() once!";
        }
        this.started = true;
        this._initHistory();
    },

    _trigger: function(token) {
        if(token == null) {
            token = '';
        }
        var routeInfo = {
            token: token,
            url: '#' + token
        };
        for(var index in this.routes) {
            var route = this.routes[index];
            var match = token.match(route.regex);
            if(match) {
                var args = match.slice(1);
                Ext.bind(this.handler[route.action], this.handler, args, true)(Ext.apply(routeInfo, {
                    action: route.action
                }));
                return;
            }
        }
        Ext.bind(this.handler['routeNotFound'], this.handler)(Ext.apply(routeInfo, {
            action: 'routeNotFound',
        }));
    },

    _initHistory: function() {
        Ext.getBody().createChild({
            tag: 'form',
            id: 'history-form' ,
            cls: Ext.baseCSSPrefix + 'hide-display',
            html: [
                '<input type="hidden" id="', Ext.util.History.fieldId, '" />',
                '<iframe id="', Ext.util.History.iframeId, '"></iframe>'
            ].join('')
		});
		Ext.util.History.init(this._onHistoryReady, this);
    },

    _onHistoryReady: function(history) {
        this.mon(Ext.util.History, 'change', this._onHistoryChange, this);
        var token = history.getToken();
        if(token == null) {
            token = '';
        }
        this._trigger(token);
    },

    _onHistoryChange: function(token) {
        this._trigger(token);
    },

    /**
     * @private
     * Convert a route string into a regular expression, suitable for matching
     * against the current location hash.
     */
    _patternToRegExp: function(pattern) {
        var regex = pattern.replace(this.escapeRegExp, '\\$&');
        regex = regex.replace(this.namedParam, '([^\/]*)');
        regex = regex.replace(this.splatParam, '(.*?)');
        return new RegExp('^' + regex + '$');
    },


    navigate: function(token) {
        Ext.util.History.add(token);
    }
});
