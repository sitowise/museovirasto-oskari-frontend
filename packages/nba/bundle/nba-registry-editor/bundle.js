/**
 *
 * @class Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundle
 */
Oskari.clazz.define("Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundle",

/**
 * Called automatically on construction. At this stage bundle sources have been
 * loaded, if bundle is loaded dynamically.
 *
 * @contructor
 * @static
 */
function () {

}, {
    /*
     * called when a bundle instance will be created
     *
     * @method create
     */
    "create": function () {
        return Oskari.clazz.create("Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance");
    },
    /**
     * Called by Bundle Manager to provide state information to
     *
     * @method update
     * bundle
     */
    "update": function (manager, bundle, bi, info) {
    }
},

/**
 * metadata
 */
{
    "protocol": ["Oskari.bundle.Bundle"],
    "source": {
        "scripts": [{
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/instance.js"
        }, {
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/view/SideRegistryEditor.js"
        }, {
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/request/ShowRegistryEditorRequest.js"
        }, {
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/request/ShowRegistryEditorRequestHandler.js"
        }, {
            "type": "text/css",
            "src": "../../../../bundles/nba/nba-registry-editor/resources/css/style.css"
        }],
        "locales": [{
            "lang": "fi",
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/resources/locale/fi.js"
        }, {
            "lang": "en",
            "type": "text/javascript",
            "src": "../../../../bundles/nba/nba-registry-editor/resources/locale/en.js"
        }]
    },
    "bundle": {
        "manifest": {
            "Bundle-Identifier": "nba-registry-editor",
            "Bundle-Name": "nba-registry-editor",
            "Bundle-Author": [{
                "Name": "sito.fi",
                "Organisation": "sito.fi",
                "Temporal": {
                    "Start": "2016",
                    "End": "2016"
                },
                "Copyleft": {
                    "License": {
                        "License-Name": "EUPL",
                        "License-Online-Resource": "http://www.paikkatietoikkuna.fi/license"
                    }
                }
            }],
            "Bundle-Name-Locale": {
                "fi": {
                    "Name": "nba-registry-editor",
                    "Title": "nba-registry-editor"
                },
                "en": {}
            },
            "Bundle-Version": "1.0.0",
            "Import-Namespace": ["Oskari"],
            "Import-Bundle": {}
        }
    },

    /**
     * @static
     * @property dependencies
     */
    "dependencies": []
});

// Install this bundle by instantating the Bundle Class
Oskari.bundle_manager.installBundleClass("nba-registry-editor", "Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundle");