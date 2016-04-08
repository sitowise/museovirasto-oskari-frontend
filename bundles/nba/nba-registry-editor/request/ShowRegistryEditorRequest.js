/**
 * @class Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequest
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.request.ShowRegistryEditorRequest',
    /**
     * @method create called automatically on construction
     * @static
     *
     * @param {Object} feature
     */
    function (feature) {
        this._feature = feature;
    }, {
        /** @static @property __name request name */
        __name: 'RegistryEditor.ShowRegistryEditorRequest',
        /**
         * @method getName
         * @return {String} request name
         */
        getName: function () {
            return this.__name;
        },
        /**
         * @method getFeature
         */
        getFeature: function () {
            return this.feature;
        }
    }, {
        /**
         * @property {String[]} protocol array of superclasses as {String}
         * @static
         */
        'protocol': ['Oskari.mapframework.request.Request']
    });