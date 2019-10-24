/**
* @class Oskari.mapframework.bundle.downloadBasket.BundleInstance
*
* Oskari.mapframework.bundle.downloadBasket.
*/
Oskari.clazz.define("Oskari.mapframework.bundle.downloadBasket.BundleInstance",

    /**
     * @method create called automatically on construction
     * @static
     */
    function () {
        this.sandbox = null;
        this.started = false;
        this.plugins = {};
        this._localization = null;
        this.cropping = null;
        this.basket = null;
        this.mapModule = null;
        this.startedTabs = false;
    }, {
        /**
         * @static
         * @property __name
         */
        __name: 'download-basket',
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName: function () {
            return this.__name;
        },
        /**
         * @method setSandbox
         * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
         * Sets the sandbox reference to this component
         */
        setSandbox: function (sandbox) {
            this.sandbox = sandbox;
        },
        /**
         * @method getSandbox
         * @return {Oskari.mapframework.sandbox.Sandbox}
         */
        getSandbox: function () {
            return this.sandbox;
        },
        /**
         * @method getLocalization
         * Returns JSON presentation of bundles localization data for current language.
         * If key-parameter is not given, returns the whole localization data.
         *
         * @param {String} key (optional) if given, returns the value for key
         * @return {String/Object} returns single localization string or
         *      JSON object for complete data depending on localization
         *      structure and if parameter key is given
         */
        getLocalization: function (key) {
            if (!this._localization) {
                this._localization = Oskari.getLocalization(this.getName());
            }
            if (key) {
                return this._localization[key];
            }
            return this._localization;
        },
        /**
         * @method start
         * implements BundleInstance protocol start methdod
         */
        start: function () {
            if (this.started) {
                return;
            }

            var me = this,
                conf = me.conf,
                sandboxName = conf ? conf.sandbox : 'sandbox',
                sandbox = Oskari.getSandbox(sandboxName),
                p;

            me.started = true;
            me.sandbox = sandbox;

            this._localization = Oskari.getLocalization(this.getName());

            sandbox.register(me);
            for (p in me.eventHandlers) {
                if (me.eventHandlers.hasOwnProperty(p)) {
                    sandbox.registerForEventByName(me, p);
                }
            }

            // create and register request handlers
            var reqHandler = Oskari.clazz.create('Oskari.mapframework.bundle.downloadBasket.request.AddToBasketRequestHandler', sandbox, this);
            sandbox.addRequestHandler('DownloadBasket.AddToBasketRequest', reqHandler);

            me.cropping = Oskari.clazz.create('Oskari.mapframework.bundle.downloadBasket.Cropping',
                this._localization.flyout['download-basket-cropping-tab'], me);
            me.cropping.setId('download-basket-cropping-tab');
            me.basket = Oskari.clazz.create('Oskari.mapframework.bundle.downloadBasket.Basket',
                this._localization.flyout['download-basket-tab'], me);
            me.basket.setId('download-basket-tab');

            me.cropping.setBasket(me.basket);

            var request = sandbox.getRequestBuilder('userinterface.AddExtensionRequest')(me);
                sandbox.request(me, request);

            this.mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');

        },
        /**
         * @method init
         * implements Module protocol init method - does nothing atm
         */
        init: function () {
            return null;
        },
        /**
         * @method update
         * implements BundleInstance protocol update method - does nothing atm
         */
        update: function () {

        },
        /**
         * @method onEvent
         * @param {Oskari.mapframework.event.Event} event a Oskari event object
         * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
         */
        onEvent: function (event) {
            this.plugins['Oskari.userinterface.Flyout'].onEvent(event);

            var handler = this.eventHandlers[event.getName()];
            if (!handler) {
                return;
            }

            handler.apply(this, [event]);

        },
        /**
         * @property {Object} eventHandlers
         * @static
         */
        eventHandlers: {
            /**
             * @method userinterface.ExtensionUpdatedEvent
             * Fetch channel when flyout is opened
             */
            'userinterface.ExtensionUpdatedEvent': function (event) {
                var me = this,
                    doOpen = event.getViewState() !== 'close',
                    p;
                if (event.getExtension().getName() !== me.getName()) {
                    // not me -> do nothing
                    return;
                }
                if (doOpen) {
                    this.plugins['Oskari.userinterface.Flyout'].createUI();
                    if(!me.startedTabs){
                        me.cropping.startCropping();
                        me.basket.startBasket();
                        me.startedTabs = true;
                    }
                    // flyouts eventHandlers are registered
                    for (p in this.plugins['Oskari.userinterface.Flyout'].getEventHandlers()) {
                        if (!this.eventHandlers[p]) {
                            this.sandbox.registerForEventByName(this, p);
                        }
                    }
                    me.basket.showWarningIfNeeded();
                }
            },
            'MapClickedEvent' : function(evt) {
                var me = this,
                lonlat = evt.getLonLat(),
                x = lonlat.lon,
                y = lonlat.lat;
                if(me.cropping.isCroppingToolActive()){
                    me.cropping.croppingLayersHighlight(x, y);
                }
            },
            'AfterMapLayerAddEvent' : function(event) {
                var me = this;
                var map = me.mapModule.getMap();

                if(me.cropping.croppingVectorLayer != null){
                    map.setLayerIndex(me.cropping.croppingVectorLayer, 1000000);
                }
            }
        },

        /**
         * @method stop
         * implements BundleInstance protocol stop method
         */
        stop: function () {
            var sandbox = this.sandbox,
                p,
                request;
            for (p in this.eventHandlers) {
                if (this.eventHandlers.hasOwnProperty(p)) {
                    sandbox.unregisterFromEventByName(this, p);
                }
            }

            request = sandbox.getRequestBuilder('userinterface.RemoveExtensionRequest')(this);
            sandbox.request(this, request);


            this.sandbox.unregister(this);
            this.started = false;
        },
        /**
         * @method startExtension
         * implements Oskari.userinterface.Extension protocol startExtension method
         * Creates a flyout and a tile:
         * Oskari.mapframework.bundle.layerselection2.Flyout
         * Oskari.mapframework.bundle.layerselection2.Tile
         */
        startExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] = Oskari.clazz.create('Oskari.mapframework.bundle.downloadBasket.Flyout', this);
            this.plugins['Oskari.userinterface.Tile'] = Oskari.clazz.create('Oskari.mapframework.bundle.downloadBasket.Tile', this);
        },
        /**
         * @method stopExtension
         * implements Oskari.userinterface.Extension protocol stopExtension method
         * Clears references to flyout and tile
         */
        stopExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] = null;
            this.plugins['Oskari.userinterface.Tile'] = null;
        },
        /**
         * @method getPlugins
         * implements Oskari.userinterface.Extension protocol getPlugins method
         * @return {Object} references to flyout and tile
         */
        getPlugins: function () {
            return this.plugins;
        },
        /**
         * @method getTitle
         * @return {String} localized text for the title of the component
         */
        getTitle: function () {
            return this.getLocalization('title');
        },
        /**
         * @method getDescription
         * @return {String} localized text for the description of the component
         */
        getDescription: function () {
            return this.getLocalization('desc');
        },
        addBasketNotify:function(){
            this.plugins['Oskari.userinterface.Tile'].refresh();
        }

    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: ['Oskari.bundle.BundleInstance', 'Oskari.mapframework.module.Module', 'Oskari.userinterface.Extension']
    });
