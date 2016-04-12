/**
 * @class Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance
 *
 * See Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundle for bundle definition.
 *
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance',

    /**
     * @method create called automatically on construction
     * @static
     */
    function () {
        this.sandbox = null;
        this.started = false;
        this.plugins = {};
        this.drawPluginId = 'RegistryEditorDrawPlugin';
        this.localization = null;
        this.sideRegistryEditor = null;
        this.disabledLayers = null;
    }, {
        /**
         * @static
         * @property __name
         */
        __name: 'RegistryEditor',
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName: function () {
            return this.__name;
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
         * Implements BundleInstance protocol start method
         */
        start: function () {            
            var me = this,
                conf = me.conf,
                sandboxName = (conf ? conf.sandbox : null) || 'sandbox',
                sandbox = Oskari.getSandbox(sandboxName),
                request,
                p,
                loc = this.getLocalization();

            if (me.started) {
                return;
            }

            me.started = true;

            me.sandbox = sandbox;

            this.localization = Oskari.getLocalization(this.getName());
            sandbox.register(me);
            for (p in me.eventHandlers) {
                if (me.eventHandlers.hasOwnProperty(p)) {
                    sandbox.registerForEventByName(me, p);
                }
            }

            //Let's extend UI
            request = sandbox.getRequestBuilder('userinterface.AddExtensionRequest')(this);
            sandbox.request(this, request);

            //sandbox.registerAsStateful(this.mediator.bundleId, this);
            // draw ui
            me._createUi();


            // create request handlers
            me.showRegistryEditorRequestHandler = Oskari.clazz.create(
                'Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequestHandler',
                me
            );

            // register request handlers
            sandbox.addRequestHandler(
                'RegistryEditor.ShowRegistryEditorRequest',
                me.showRegistryEditorRequestHandler
            );
            
            var drawPlugin = Oskari.clazz.create('Oskari.mapframework.ui.module.common.mapmodule.DrawPlugin', {id: me.drawPluginId}),
                mapModule = me.sandbox.findRegisteredModuleInstance('MainMapModule');
            this.plugins.drawPlugin = drawPlugin;
            mapModule.registerPlugin(drawPlugin);
            mapModule.startPlugin(drawPlugin);
            
        },

        /**
         * @method init
         * Implements Module protocol init method - does nothing atm
         */
        init: function () {
            return null;
        },

        /**
         * @method update
         * Implements BundleInstance protocol update method - does nothing atm
         */
        update: function () {

        },

        /**
         * @method onEvent
         * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
         * @param {Oskari.mapframework.event.Event} event a Oskari event object
         */
        onEvent: function (event) {
            var handler = this.eventHandlers[event.getName()];
            if (!handler) {
                return;
            }
            return handler.apply(this, [event]);
        },
        
        /**
         * Fetches reference to the map layer service
         * @return {Oskari.mapframework.service.MapLayerService}
         */
        getLayerService : function() {
            return this.sandbox.getService('Oskari.mapframework.service.MapLayerService');
        },

        /**
         * @property {Object} eventHandlers
         * @static
         */
        eventHandlers: {
            
        },
        enableGfi: function (blnEnable) {
            var gfiReqBuilder = this.sandbox.getRequestBuilder(
                'MapModulePlugin.GetFeatureInfoActivationRequest'
            );
            if (gfiReqBuilder) {
                this.sandbox.request(this, gfiReqBuilder(blnEnable));
            }
        },
        /**
         * @method stop
         * Implements BundleInstance protocol stop method
         */
        stop: function () {
            var sandbox = this.sandbox(),
                request,
                p;
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
         */
        startExtension: function () {
        },
        /**
         * @method stopExtension
         * implements Oskari.userinterface.Extension protocol stopExtension method
         * Clears references to flyout
         */
        stopExtension: function () {
        },
        /**
         * @method getPlugins
         * implements Oskari.userinterface.Extension protocol getPlugins method
         * @return {Object} references to flyout
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
        /**
         * @method _createUi
         * @private
         * (re)creates the UI
         */
        _createUi: function () {
            var me = this;
        },

        /**
         * @method setEditorMode
         *
         * @param {Boolean} blnEnabled true to enable, false to disable/return to normal mode
         * @param {string} layerId
         */
        setEditorMode: function (blnEnabled, data) {
            var me = this,
                map = jQuery('#contentMap'),
                request,
                requestBuilder;

            if (blnEnabled) {
                //remove old editor first
                if (me.sideRegistryEditor && me.sandbox._mapMode === 'mapRegistryEditorMode') {
                    me.sideRegistryEditor.destroy();
                }
                
                map.addClass('mapRegistryEditorMode');
                me.sandbox._mapMode = 'mapRegistryEditorMode';

                me.sideRegistryEditor = Oskari.clazz.create(
                    'Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor',
                    me,
                    me.getLocalization('RegistryEditorView'),
                    data
                );
                me.sideRegistryEditor.render(map);
            } else {
                jQuery('#contentMap').width('');
                jQuery('.oskariui-left')
                    .css({
                        'width': '',
                        'height': '',
                        'float': ''
                    })
                    .empty();
                jQuery('.oskariui-center').css({
                    'width': '100%',
                    'float': ''
                });

                if (me.sideRegistryEditor) {
                    me.sideRegistryEditor.destroy();
                }
                // first return all needed plugins before adding the layers back
                map.removeClass('mapRegistryEditorMode');
                if (me.sandbox._mapMode === 'mapRegistryEditorMode') {
                    delete me.sandbox._mapMode;
                }
                //postRequestByName brakes mode change functionality! me.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [undefined, 'close']);
                request = me.sandbox.getRequestBuilder('userinterface.UpdateExtensionRequest')(me, 'close', me.getName());
                me.sandbox.request(me.getName(), request);
                
            }
            
            me.sandbox.postRequestByName('MapFull.MapSizeUpdateRequest', []);
        },

        showRegistryEditor: function (data) {
            this.setEditorMode(true, data);
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: [
            'Oskari.bundle.BundleInstance',
            'Oskari.userinterface.Extension'
        ]
    }
);
