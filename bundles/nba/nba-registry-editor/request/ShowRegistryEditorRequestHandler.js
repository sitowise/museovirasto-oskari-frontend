/**
 * @class Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequestHandler
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequestHandler',
    /**
     * @method create called automatically on construction
     * @static
     * @param {Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance} instance
     *          reference to instance
     */
    function (instance) {
        this.instance = instance;
    }, {
        /**
         * @method handleRequest
         * Shows/hides the maplayer specified in the request in OpenLayers implementation.
         * @param {Oskari.mapframework.core.Core} core
         *      reference to the application core (reference sandbox core.getSandbox())
         *      request to handle
         * @param {Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequest} request
         *      request to handle
         */
        handleRequest: function (core, request) {
        	this.instance.showRegistryEditor(request._feature);
        }
    }, {
        /**
         * @property {String[]} protocol array of superclasses as {String}
         * @static
         */
        protocol: ['Oskari.mapframework.core.RequestHandler']
    });