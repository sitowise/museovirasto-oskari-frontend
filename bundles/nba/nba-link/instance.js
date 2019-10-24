﻿/**
 * @class Oskari.nba.bundle.nba-link.NbaLinkBundleInstance
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-link.NbaLinkBundleInstance',
/**
 * @method create called automatically on construction
 * @static
 */
function () {
    this.registryItemData = null;
    this.linkSucceeded = false;
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
    /**
    * @method onEvent
    * @param {Oskari.mapframework.event.Event} event a Oskari event object
    * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
    */
    onEvent: function (event) {
        //"use strict";
        var handler = this.eventHandlers[event.getName()];
        if (!handler) {
            return;
        }

        return handler.apply(this, [event]);

    },
    /**
     * @property {Object} eventHandlers
     * @static
     */
    eventHandlers: {
        /**
         * @method MapLayerEvent
         * @param {Oskari.mapframework.event.common.MapLayerEvent} event
         */
        MapLayerEvent: function (event) {
            if (!this.linkSucceeded && this.registryItemData != null && event.getOperation() == 'add') {
                this._showRegistryItemOnMap();
            }
        }
    },

    /**
     * @method stop
     * implements BundleInstance protocol stop method
     */
    stop: function () {
        //"use strict";
        var me = this,
            sandbox = me.sandbox(),
            p;

        for (p in me.eventHandlers) {
            if (me.eventHandlers.hasOwnProperty(p)) {
                sandbox.unregisterFromEventByName(me, p);
            }
        }
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
                        me.registryItemData = result;
                        //first attempt to show registry item on map (if proper layers are not available yet, then the attempt will be repeated)
                        me._showRegistryItemOnMap();
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

    _showRegistryItemOnMap: function () {
        var me = this,
            layers = [],
            features = [],
            extent,
            center,
            registerSearchLayer = new OpenLayers.Layer.Vector('registerSearchLayer'),
            feature,
            bounds,
            geometry,
            itemType,
            data = me.registryItemData,
            allLayersLoaded = true;

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

                    itemType = data[x].mapLayers[j].itemType;
                    if (itemType == 'main' || itemType == null) {
                        if (data[x].geometry != null) {
                            var centroid = me._getCentroidFromGeoJson(data[x].geometry);
                            features.push(centroid);
                        } else {
                            if (data[x].pointGeometry != null) {
                                var centroid = me._getCentroidFromGeoJson(data[x].pointGeometry);
                                features.push(centroid);
                            }
                            if (data[x].areaGeometry != null) {
                                var centroid = me._getCentroidFromGeoJson(data[x].areaGeometry);
                                features.push(centroid);
                            }
                        }
                    } else {
                        $.each(data[x][itemType], function(index, value) {
                            if (value.geometry != null) {
                                var centroid = me._getCentroidFromGeoJson(value.geometry);
                                features.push(centroid);
                            }
                        });
                    }
                }
            }

            if (data[x].bounds != null) {
                //Create feature and add to fake layer
                bounds = new OpenLayers.Bounds(data[x].bounds);
                geometry = bounds.toGeometry();
                feature = new OpenLayers.Feature.Vector(geometry);
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
                allLayersLoaded = false;
            }
        }
        
        //remove all markers
        var removeMarkersReqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.RemoveMarkersRequest');
        if (removeMarkersReqBuilder) {
            me.sandbox.request(me, removeMarkersReqBuilder());
        }

        //find features in the layers by the identyfying attribute and highlight it
        for (var i = 0; i < features.length; i++) {
            //show marker
            var reqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
            if (reqBuilder) {
                var marker = {
                    x: features[i].x,
                    y: features[i].y,
                    color: "000000",
                    msg: '',
                    shape: 4,
                    size: 3
                };
                var request = reqBuilder(marker, 'registry-search-result-' + i);
                me.sandbox.request(me, request);
            }
        }

        me.linkSucceeded = allLayersLoaded;
    },

    _getCentroidFromGeoJson: function(geoJson) {
        var geoJsonFormat = new OpenLayers.Format.GeoJSON(),
            geometry = geoJsonFormat.parseGeometry(geoJson);
        
        return geometry.getCentroid();
    }

}, {
    "extend": ["Oskari.userinterface.extension.DefaultExtension"]
});
