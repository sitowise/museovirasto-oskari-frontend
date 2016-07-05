/**
 * @class Oskari.nba.bundle.admin-registers.AdminRegisterRightsBundle
 *
 * Definition for bundle. See source for details.
 */
Oskari.clazz.define("Oskari.nba.bundle.admin-registers.AdminRegisterRightsBundle",
/**
 * @method create called automatically on construction
 * @static
 */ 
function() {

}, {
    "create" : function() {
        var me = this;
        var inst = Oskari.clazz.create("Oskari.nba.bundle.admin-registers.AdminRegisterRightsBundleInstance",
            'admin-registers',
            "Oskari.nba.bundle.admin-registers.AdminLayerRightsFlyout"
            );

        return inst;

    },
    "update" : function(manager, bundle, bi, info) {

    }
}, {

    "protocol" : ["Oskari.bundle.Bundle", "Oskari.mapframework.bundle.extension.ExtensionBundle"],
    "source" : {

        "scripts" : [{
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/instance.js"
        },{
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/Flyout.js"
        },{
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/Tile.js"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/nba/admin-registers/resources/css/style.css"
        }, {
            "src" : "../../../../libraries/chosen/chosen.jquery.js",
            "type" : "text/javascript"
        }, {
            "src" : "../../../../libraries/chosen/chosen.css",
            "type" : "text/css"
        }],

        "locales" : [{
            "lang" : "fi",
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/resources/locale/fi.js"
        }, {
            "lang" : "sv",
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/resources/locale/sv.js"
        }, {
            "lang" : "en",
            "type" : "text/javascript",
            "src" : "../../../../bundles/nba/admin-registers/resources/locale/en.js"
        }]
    },
    "bundle" : {
        "manifest" : {
            "Bundle-Identifier" : "admin-registers",
            "Bundle-Name" : "admin-registers",
            "Bundle-Author" : [{
                "Name" : "ev",
                "Organisation" : "nls.fi",
                "Temporal" : {
                    "Start" : "2013",
                    "End" : "2013"
                },
                "Copyleft" : {
                    "License" : {
                        "License-Name" : "EUPL",
                        "License-Online-Resource" : "http://www.paikkatietoikkuna.fi/license"
                    }
                }
            }],        
            "Bundle-Version" : "1.0.0",
            "Import-Namespace" : ["Oskari"],
            "Import-Bundle" : {}

        }
    },

    /**
     * @static
     * @property dependencies
     */
    "dependencies" : ["jquery"]

});

Oskari.bundle_manager.installBundleClass("admin-registers", "Oskari.nba.bundle.admin-registers.AdminRegisterRightsBundle");
