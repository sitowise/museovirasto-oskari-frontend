/**
 * @class Oskari.nba.bundle.nba-link.NbaLinkBundleInstance
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-link.NbaLinkBundleInstance',
/**
 * @method create called automatically on construction
 * @static
 */
function () {
    // Best practice is to initialize instance variables here.
    //this.myVar = undefined;
}, {
    /**
     * @static
     * @property __name
     */
    __name: 'nba-link',
    /**
     * Module protocol method
     *
     * @method getName
     */
    getName: function () {
        return this.__name;
    },
    eventHandlers: {
    },
    /**
     * DefaultExtension method for doing stuff after the bundle has started.
     * 
     * @method afterStart
     */
    afterStart: function (sandbox) {
        //var conf = this.conf;
        //TODO create request and request handler for other bundles to getting external service url and make link to external service configurable
        var me = this,
            registerService = Oskari.clazz.create('Oskari.nba.bundle.nba-link.service.RegisterService', this), //Create the register search service
            action = me._getParameterValueFromUrl("action"),
            registryName = null,
            registryItemId = null;

        if (action == "showRegistryItem") {
            var params = {
                'registryItemId': me._getParameterValueFromUrl("id"),
                'registerName': me._getParameterValueFromUrl("registry")
            };

            if (params.registryItemId != null && params.registerName != null) {
                registerService.getRegistryItem(params,
                    function (result) {
                        me._showRegistryItemOnMap(result);
                    },
                    function (error) {
                        //TODO handle error
                    });
            } else {
                //TODO show error message
            }
        }
    },

    _getParameterValueFromUrl: function (paramName) {
        var regexS,
            regex,
            results;

        paramName = paramName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        regexS = "[\\?&]" + paramName + "=([^&#]*)";
        regex = new RegExp(regexS);
        results = regex.exec(window.location.href);

        if (results != null) {
            return results[1];
        }

        return null;
    },

    _showRegistryItemOnMap: function (data) {
        //TODO probably need to be converted to current coordinate system
        var me = this,
            //zoomLevel = 7,
            //extent = new OpenLayers.Bounds(data.bounds),
            //center = extent.getCenterLonLat(),
            //x = center.lon,
            //y = center.lat,
            layers = [],
            features = [],
            extent,
            center,
            registerSearchLayer = new OpenLayers.Layer.Vector('registerSearchLayer'),
            format = new OpenLayers.Format.WKT({}),
            feature,
            featureJson;

        if (!$.isArray(data)) {
            data = [data];
        }

        for (var x = 0; x < data.length; x++) {

            for (var j = 0; j < data[x].mapLayers.length; j++) {
                var mapLayerId = data[x].mapLayers[j].mapLayerID;
                if (layers.indexOf(mapLayerId) == -1) {
                    layers.push(mapLayerId);
                }

                if (data[x].mapLayers[j].toHighlight) {
                    featureJson = {
                        attribute: data[x].mapLayers[j].attribute,
                        itemId: data[x].id,
                        layerId: mapLayerId,
                        bounds: data[x].bounds
                    };

                    features.push(featureJson);
                }
            }

            if (data[x].bounds != null) {
                var bounds = new OpenLayers.Bounds(data[x].bounds);
                var geometry = bounds.toGeometry();
                var wktFormat = new OpenLayers.Format.WKT({});
                var wkt = wktFormat.extractGeometry(geometry);

                //Create feature and add to fake layer
                //feature = format.read('POINT (' + data.x + ' ' + data.y + ')');
                feature = format.read(wkt);
                registerSearchLayer.addFeatures([feature]);
            }
        }

        //calculate bounding box from fake layer
        extent = registerSearchLayer.getDataExtent();
        center = extent.getCenterLonLat();
        
        //zoom map to the extent
        me.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, extent, false]);

        //showing layer for the register
        for (var i = 0; i < layers.length; i++) {
            var layer = me.sandbox.findMapLayerFromAllAvailable(layers[i]);
            if (layer != null) {
                me.sandbox.postRequestByName('AddMapLayerRequest', [layers[i], true]);
            } else {
                //TODO show error
            }
        }

        //remove all markers
        var removeMarkersReqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.RemoveMarkersRequest');
        if (removeMarkersReqBuilder) {
            me.sandbox.request('MainMapModule', removeMarkersReqBuilder());
        }

        //find features in the layers by the identyfying attribute and highlight it
        for (var i = 0; i < features.length; i++) {
            var filters = {
                filters: [{
                    attribute: features[i].attribute,
                    //attribute: 'OBJECTID',
                    caseSensitive: false,
                    operator: "=",
                    value: features[i].itemId
                }]
            };

            var evt = me.sandbox.getEventBuilder('WFSSetPropertyFilter')(filters, features[i].layerId);
            me.sandbox.notifyAll(evt);

            //show marker
            var bounds = new OpenLayers.Bounds(features[i].bounds);
            var boundsCenter = bounds.getCenterLonLat();

            var reqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
            if (reqBuilder) {
                var marker = {
                    x: boundsCenter.lon,
                    y: boundsCenter.lat,
                    color: "000000",
                    msg: '',
                    shape: 4,
                    size: 5
                };
                var request = reqBuilder(marker, 'registry-search-result-' + i);
                me.sandbox.request('MainMapModule', request);
            }
        }

        /*
        //create infobox
        //TODO probably need to be converted to current coordinate system
        var lonlat = new OpenLayers.LonLat(x, y),
        //var lonlat = new OpenLayers.LonLat(24.6603626, 60.2241869),
            infoBoxContent = {
                html: me._getInfoBoxHtml(data),
                actions: {}
            },
            popupId = "nba-register-search-result";

        //TODO make localization 'Kohdetiedot'
        me.getSandbox().postRequestByName('InfoBox.ShowInfoBoxRequest', [popupId, "Rekisterikohde", [infoBoxContent], lonlat, true]);
        */
    },

    _getInfoBoxHtml: function (result) {
        //TODO make localization
        //TODO fix styling and layout
        var template = '<h3>Tunnus: ' + result.id + '</h3>' +
                        //'<h3>Shape: ' + result.id + '</h3>' +
                        '<h3>Kohdetunnus: ' + result.id + '</h3>' +
                        '<h3>Kohdenimi: ' + result.desc + '</h3>' +
                        '<h3>Rekisteritiedot: <a href="' + result.nbaUrl + '" target="_blank">Linkki rekisteritietoihin</a></h3>';
        return template;
    },

}, {
    "extend": ["Oskari.userinterface.extension.DefaultExtension"]
});
