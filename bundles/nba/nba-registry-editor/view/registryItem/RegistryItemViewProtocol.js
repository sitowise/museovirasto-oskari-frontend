/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.RegistryItemViewProtocol
 *
 * A protocol class for registry item views. You need to implement a class with this protocol
 * for every registry item type to make it usable in SideRegistryEditor class.
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.RegistryItemViewProtocol',
    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor} editor
     * Reference to component that created this view
     * @param {Object} loc
     * Localization data in JSON format
     */
    function (editor, loc) {}, {

        getRegisterName: function () {
            throw "Not implemented function!";
        },

        render: function (data) {
            throw "Not implemented function!";
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields, defaults) {
            throw "Not implemented function!";
        },

        collectDataForUpdate: function (content, geometry) {
            throw "Not implemented function!";
        },

        preparePostData: function () {
            throw "Not implemented function!";
        }

    }
);