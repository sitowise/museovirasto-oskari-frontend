﻿/**
 *
 *
 * @class Oskari.nba.bundle.nba-registers.view.RegisterSearchTab
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registers.view.RegistersSearchTab',
    /**
     *
     *
     */
    function (instance) {
        this.instance = instance;
        this.sandbox = instance.getSandbox();
        this.loc = instance.getLocalization('tab');
        this.resultsGrid = null;
        this.resultsContainer = null;
        this.templates = {};
        for (var t in this._templates) {
            if (this._templates.hasOwnProperty(t)) {
                this.templates[t] = jQuery(this._templates[t]);
            }
        }
        this.progressSpinner = Oskari.clazz.create('Oskari.userinterface.component.ProgressSpinner');
        this.tabContent = this._initContent();
        //this.resultsContainer = this._initResultGrid();
        this._getRegisters(),
        this._dialog = null;
    }, {
        _templates: {
            tabContent: '<div class="nba-searchContainer">'
                + '<div class="nbaRegisterHeader"></div>'
                + '<div class="registerSelect"><select></select></div>'
                + '<div class="limitResultsToArea"><input id="limitResultsToAreaCheckbox" type="checkbox"></input></div>'
                + '<div class="searchDescription"></div>'                
                + '<div class="nba-searchInput"></div>'
                + '<div class="nba-searchButton"></div>'
                + '<div class="showAllResultsLink"></div>'
                + '<div class="nba-progressSpinner"></div>'
                + '</div>',
            resultsGrid: '<div class="resultsContainer">'
                + '<div class="resultsTitle"></div>'
                + '<div class="grid"></div>'
                + '<div>'
        },

        getTitle: function () {
            return this.loc.title;
        },

        getContent: function () {
            return this.tabContent;
        },

        requestToAddTab: function () {
            var requestBuilder = this.sandbox.getRequestBuilder('Search.AddTabRequest'),
                request;

            if (requestBuilder) {
                request = requestBuilder(this.getTitle(), this.getContent());
                this.sandbox.request(this.instance, request);
            }
        },

        _showMessage: function(title, content, buttons, isModal) {
            var me = this;
            this.closeDialog();
            this._dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            if(typeof buttons === 'undefined') {
                var okBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.OkButton');

                okBtn.setHandler(function () {
                    me._dialog.close(true);
                    me._dialog = null;
                });

                buttons = [okBtn];
            }
            this._dialog.show(title, content, buttons);
            if (isModal) {
                this._dialog.makeModal();
            }
        },

        closeDialog : function() {
            if(this._dialog) {
                this._dialog.close(true);
                this._dialog = null;
            }
        },

        _initContent: function () {
            var me = this,
                tabContent = this.templates.tabContent.clone(),
                headerLabel = this.loc['header'],
                selectLabel = this.loc['selectRegister'],
                checkboxLabel = this.loc['limitToArea'],
                searchDesc = this.loc['searchDesc'],
                searchPlaceholder = this.loc['searchPlaceholder'],
                searchInput = Oskari.clazz.create('Oskari.userinterface.component.FormInput', 'nba-registers-search-input'),
                searchButton = Oskari.clazz.create('Oskari.userinterface.component.buttons.SearchButton'),
                showAllResultsLink = jQuery('<a href="#">' + this.loc['showAllResultsOnMap'] + '</a>');
            
            tabContent.find('div.nbaRegisterHeader').append(headerLabel);
            tabContent.find('div.registerSelect').prepend(selectLabel);
            tabContent.find('div.limitResultsToArea').append(checkboxLabel);
            //tabContent.find('div.searchDescription').append(searchDesc);

            var doSearch = function () {
                var selectElement = me.getContent().find('div.registerSelect select'),
                    checkboxElement =  tabContent.find('#limitResultsToAreaCheckbox');

                //clear data in grid
                //var dataModel = me.resultsGrid.getDataModel().setData([]);
                if (me.resultsContainer != null) {
                    me.resultsContainer.empty();
                }
                tabContent.find('div.showAllResultsLink').hide();

                //If user has selected a filter with geometry the name/ID should not be mandatory parameter in the search
                if (checkboxElement.prop('checked')) {
                    searchInput.setRequired(false);
                } else {
                    searchInput.setRequired(true, "You should fill this input"); //TODO make localization
                }

                searchInput.clearErrors();
                var errors = searchInput.validate();
                if (errors != null && errors.length > 0) {
                    searchInput.showErrors(errors);
                } else {

                    var params = {
                        keyword: searchInput.getValue(),
                        registries: selectElement.val(),
                        geometry: ""
                    };

                    if (checkboxElement.prop('checked')) {
                        //determine selected geometries on the map
                        var selectedLayers = me.sandbox.findAllSelectedMapLayers(),
                            geometryFilters = [];

                        for (var i = 0; i < selectedLayers.length; i++) {
                            var layer = selectedLayers[i];

                            //if (layer.getClickedFeatureIds !== null && layer.getClickedFeatureIds !== undefined && layer.getClickedFeatureIds().length > 0
                              //  && layer.getClickedGeometries !== null && layer.getClickedGeometries !== undefined && layer.getClickedGeometries().length > 0) {

                            if (layer.getClickedGeometries !== null && layer.getClickedGeometries !== undefined && layer.getClickedGeometries().length > 0) {

                                for (var j = 0; j < layer.getClickedGeometries().length; j++) {
                                    geometryFilters.push(layer.getClickedGeometries()[j][1]);
                                }
                            }
                        }
                        //add geometry filter
                        params.geometry = geometryFilters.join('|');
                        
                        //check amount of selected geometries and show warning if needed
                        if (geometryFilters.length > 10) {
                            var continueButton = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                                cancelButton = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton'),
                                buttons = [cancelButton, continueButton];

                            cancelButton.setHandler(function() {
                                me._dialog.close(true);
                                me._dialog = null;
                            });

                            continueButton.setTitle(me.loc.continue);
                            continueButton.addClass('primary');
                            continueButton.setHandler(function() {
                                me._dialog.close(true);
                                me._dialog = null;
                                me._getRegistryItems(params);
                            });

                            me._showMessage(me.loc.warningTitle, me.loc.warningTooManyAreas, buttons);
                        } else {
                            me._getRegistryItems(params);
                        }
                    } else {
                        me._getRegistryItems(params);
                    }
                }
            }
            
            //add search input
            searchInput.setIds(null, "nba-registers-search-input");
            searchInput.setPlaceholder(searchPlaceholder);
            searchInput.addClearButton();
            searchInput.bindEnterKey(doSearch);

            //add search button
            searchButton.setHandler(doSearch);

            tabContent.find('div.nba-searchInput').append(searchInput.getField());
            tabContent.find('div.nba-searchButton').append(searchButton.getElement());

            
            showAllResultsLink.bind('click', function () {
                me._showAllResultsOnMap();
                return false;
            });
            tabContent.find('div.showAllResultsLink').append(showAllResultsLink);
            tabContent.find('div.showAllResultsLink').hide();
            this.progressSpinner.insertTo(tabContent.find('div.nba-progressSpinner'));

            return tabContent;
        },

        _renderResultGrid: function (results) {
            var me = this,
                resultGrid = this.templates.resultsGrid.clone(),
                gridTexts = this.loc['grid'],
                gridModel = Oskari.clazz.create('Oskari.userinterface.component.GridModel'),
                grid = Oskari.clazz.create('Oskari.userinterface.component.Grid'),
                searchInput = jQuery(me.tabContent.find('#nba-registers-search-input')),
                editorRoles = me.instance.conf.editorRoles,
                dataSourceName,
                registriesConf = me.instance.conf != null ? me.instance.conf.registries : {},
                lang = Oskari.getLang(),
                currentLocale;

            //set the title and number of given results
            resultGrid.find('div.resultsTitle').append(me.loc.searchResults + ": " + results.length + " " + me.loc.forSearch + " '" + searchInput.val() + "'");

            gridModel.setIdField('id');

            _.each(results, function (result) {
                if (registriesConf[result.registryIdentifier] != null && registriesConf[result.registryIdentifier][lang] != null) {
                    //Try set item class name as data source. If translation is not available then get general name of registry.
                    currentLocale = registriesConf[result.registryIdentifier][lang];
                    dataSourceName = currentLocale[result.itemClassName]
                    
                    if (dataSourceName == null || dataSourceName == '') {
                        dataSourceName = currentLocale.name;
                    }
                } else {
                    dataSourceName = result.registryIdentifier;
                }

                gridModel.addData({
                    'id': result.id,
                    'desc': result.desc != null ? result.desc.trim() : '',
                    'nbaUrl': result.nbaUrl,
                    'mapLayers': result.mapLayers,
                    'bounds': result.bounds,
                    'itemClassName': result.itemClassName,
                    'registryIdentifier': result.registryIdentifier,
                    'registry': dataSourceName,
                    'municipality': result.municipality,
                    'editable': result.editable,
                    'markersCoordinates': result.markersCoordinates
                });
            });

            grid.setDataModel(gridModel);
            grid.setVisibleFields(['id', 'desc', 'registry', 'municipality']);

            grid.setColumnValueRenderer('id', function (name, data) {
                if(typeof data === 'undefined') {
                    return name;
                }

                var idColumnDiv = jQuery('<div></div>'),
                    registryEditRoles = editorRoles[data.registryIdentifier] != null ? editorRoles[data.registryIdentifier] : editorRoles['general'];
                    
                if (me._hasUserPermissions(registryEditRoles) && data.editable === true) {
                    var editLink = jQuery('<a href="#" class="nba-edit-link" />');
                    editLink.bind('click', function () {

                        //zoom to object
                        me._zoomToObject(data, false);

                        //open registry editor
                        me.sandbox.postRequestByName('RegistryEditor.ShowRegistryEditorRequest', [data]);
                        //close Search bundle after moving to registry editor
                        me.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [undefined, 'close', 'Search']);

                        return false;
                    });
                    //return editLink;
                    idColumnDiv.append(editLink);
                }

                var idLink = jQuery('<a href="#">' + name + '</a>');
                idLink.bind('click', function () {

                    //zoom to object and show GFI popup
                    me._zoomToObject(data, true);

                    return false;
                });

                idColumnDiv.append(idLink);

                return idColumnDiv;
            });

            grid.setColumnUIName('id', gridTexts.id);
            grid.setColumnUIName('desc', gridTexts.desc);
            grid.setColumnUIName('registry', gridTexts.registry);
            grid.setColumnUIName('municipality', gridTexts.municipality);
            grid.renderTo(resultGrid.find('div.grid'));

            this.tabContent.append(resultGrid);

            this.resultsGrid = grid;

            return resultGrid;
        },

        _zoomToObject: function (data, showGfi) {
            var me = this

            //remove all markers
            var removeMarkersReqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.RemoveMarkersRequest');
            if (removeMarkersReqBuilder) {
                me.sandbox.request(me.instance, removeMarkersReqBuilder());
            }

            //showing all layers for the register
            if (data != null && data.mapLayers != null) {
                for (var i = 0; i < data.mapLayers.length; i++) {
                    var mapLayerId = data.mapLayers[i].mapLayerID,
                        layer = me.sandbox.findMapLayerFromAllAvailable(mapLayerId);
                    if (layer != null) {
                        me.sandbox.postRequestByName('AddMapLayerRequest', [mapLayerId, true]);
                    }
                }
            }

            if (data != null && data.bounds != null) {
                var extent = new OpenLayers.Bounds(data.bounds),
                    center = extent.getCenterLonLat(),
                    x = center.lon,
                    y = center.lat,
                    lonlat = new OpenLayers.LonLat(x, y);

                //move and zoom the map
                me.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, extent, false]);

                //show new marker(s)
                if (data.markersCoordinates) {
                    for (var j = 0; j < data.markersCoordinates.length; j++) {
                        var reqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
                        if (reqBuilder) {
                            var marker = {
                                x: data.markersCoordinates[j].coordinateX,
                                y: data.markersCoordinates[j].coordinateY,
                                color: "000000",
                                msg: '',
                                shape: 4,
                                size: 5
                            };
                            var request = reqBuilder(marker, 'registry-search-result-' + j);
                            me.sandbox.request(me.instance, request);
                        }
                    }
                } else {
                    var reqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
                    if (reqBuilder) {
                        var marker = {
                            x: center.lon,
                            y: center.lat,
                            color: "000000",
                            msg: '',
                            shape: 4,
                            size: 5
                        };
                        var request = reqBuilder(marker, 'registry-search-result');
                        me.sandbox.request(me.instance, request);
                    }
                }

                //show GFI popup
                if (showGfi) {

                    var popupData = me._getGfiPopupData(data);

                    var registryData = {
                        "via": "registry",
                        "features": [popupData],
                        "lonlat": lonlat
                    };
                    var infoEvent = me.sandbox.getEventBuilder('GetInfoResultEvent')(registryData);

                    me.sandbox.notifyAll(infoEvent);
                }
            } else {
                me._showMessage(me.loc.noticeTitle, me.loc.searchResultNoGeometry);

                if (data != null && showGfi) {

                    var popupData = me._getGfiPopupData(data);

                    var registryData = {
                        "via": "registry",
                        "features": [popupData],
                        "lonlat": Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule').getMapCenter()
                    };
                    var infoEvent = me.sandbox.getEventBuilder('GetInfoResultEvent')(registryData);

                    me.sandbox.notifyAll(infoEvent);
                }
            }
        },

        /**
         * @method _hasUserPermissions
         * Checks if any of the user's roles is contained in allowedRoles array
         *
         * @param {Array} allowedRoles array of role names
         *            
         */
        _hasUserPermissions: function (allowedRoles) {
            var me = this,
                userRoles = me.sandbox.getUser().getRoles(),
                hasPermissions = false;

            if (me.sandbox.getUser().isLoggedIn()) {
                for (var i = 0; i < userRoles.length; i++) {
                    if ($.inArray(userRoles[i].name, allowedRoles) > -1) {
                        hasPermissions = true;
                        break;
                    }
                }
            }

            return hasPermissions;
        },

        /**
         * @method _getRegisters
         * Get register names from config of the bundle
         */
        _getRegisters: function () {
            var me = this,
                conf = me.instance.conf,
                registries = [],
                lang = Oskari.getLang(),
                selectElement = this.getContent().find('div.registerSelect select'),
                registryName,
                i;

            if (conf != null) {
                registries = conf.registries;

                //add 'all' element
                selectElement.append($('<option>', {
                    value: "",
                    text: me.loc.all
                }));
                
                for (i in registries) {
                    if (registries[i][lang] != null) {
                        registryName = registries[i][lang].name;
                    } else {
                        registryName = i;
                    }

                    selectElement.append($('<option>', {
                        value: i,
                        text: registryName
                    }));
                } 
            }
        },

        _getRegistryItems: function (params) {
            var me = this;
            this.progressSpinner.start();
            this.instance.getSearchService().getRegistryItems(
                params,
                function (results) {
                    me._handleRegistryItemsResults(results);
                },
                function (jqXHR, textStatus, errorThrown) {
                    me.progressSpinner.stop();
                    
                    if (textStatus == 'Gateway Time-out') {
                        me._showMessage(me.loc.errorTitle, me.loc.searchErrorTimeout);
                    } else {
                        me._showMessage(me.loc.errorTitle, me.loc.searchErrorGeneral);
                    }
                });
        },

        _handleRegistryItemsResults: function (results) {
            this.progressSpinner.stop();
            if (jQuery.isEmptyObject(results)) {
                this.tabContent.find('div.showAllResultsLink').hide();
            } else {
                this.tabContent.find('div.showAllResultsLink').show();
            }

            this.resultsContainer = this._renderResultGrid(results);
        },

        _showAllResultsOnMap: function () {
            var me = this,
                mapModule = me.sandbox.findRegisteredModuleInstance('MainMapModule'),
                registerSearchLayer = new OpenLayers.Layer.Vector('registerSearchLayer'),
                format = new OpenLayers.Format.WKT({}),
                feature,
                featureJson,
                extent,
                center,
                features = [],
                layers = [];

            //1. get result items
            if (me.resultsGrid != null) {
                var items = me.resultsGrid.getDataModel().getData();

                for (var i = 0; i < items.length; i++) {
                    var data = items[i];

                    //2. get layerIds of the items for turning on them later
                    for (var j = 0; j < data.mapLayers.length; j++) {

                        var mapLayerId = data.mapLayers[j].mapLayerID;

                        if (layers.indexOf(mapLayerId) == -1) layers.push(mapLayerId);

                        if (data.mapLayers[j].toHighlight) {
                            featureJson = {
                                attribute: data.mapLayers[j].attribute,
                                itemId: data.id,
                                layerId: mapLayerId,
                                bounds: data.bounds,
                                markersCoordinates: data.markersCoordinates
                            };

                            features.push(featureJson);
                        }
                    }

                    if (data.bounds != null) {
                        var bounds = new OpenLayers.Bounds(data.bounds);
                        var geometry = bounds.toGeometry();
                        var wktFormat = new OpenLayers.Format.WKT({});
                        var wkt = wktFormat.extractGeometry(geometry);

                        //3. Create feature and add to fake layer
                        //feature = format.read('POINT (' + data.x + ' ' + data.y + ')');
                        feature = format.read(wkt);
                        registerSearchLayer.addFeatures([feature]);
                    }
                }

                //4. calculate bounding box from fake layer
                extent = registerSearchLayer.getDataExtent();
                center = extent.getCenterLonLat();

                //5. TODO extend the extent with 35%

                //6. zoom map to the extent
                me.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, extent, false]);

                //7. Add map layers to map
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
                    me.sandbox.request(me.instance, removeMarkersReqBuilder());
                }

                //8. find features in the layers by the identyfying attribute and highlight it
                for (var i = 0; i < features.length; i++) {
                    var filters = {
                        filters: [{
                            attribute: features[i].attribute,
                            caseSensitive: false,
                            operator: "=",
                            value: features[i].itemId
                        }]
                    };

                    var evt = me.sandbox.getEventBuilder('WFSSetPropertyFilter')(filters, features[i].layerId);
                    me.sandbox.notifyAll(evt);

                    //show new marker(s)
                    if (features[i].markersCoordinates) {
                        for (var j = 0; j < features[i].markersCoordinates.length; j++) {
                            var reqBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
                            if (reqBuilder) {
                                var marker = {
                                    x: features[i].markersCoordinates[j].coordinateX,
                                    y: features[i].markersCoordinates[j].coordinateY,
                                    color: "000000",
                                    msg: '',
                                    shape: 4,
                                    size: 5
                                };
                                var request = reqBuilder(marker, 'registry-search-result-' + i + '-' + j);
                                me.sandbox.request(me.instance, request);
                            }
                        }
                    } else {
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
                            var request = reqBuilder(marker, 'registry-search-result' + i);
                            me.sandbox.request(me.instance, request);
                        }
                    }
                }
            }
        },

        /**
         * @method _getGfiPopupData
         * Filters grid model data passed to the popup
         *
         * @param {Object} data grid model data
         *            
         */
        _getGfiPopupData: function (data) {
            return {
                'id': data.id,
                'desc': data.desc,
                'nbaUrl': data.nbaUrl,
                'mapLayers': data.mapLayers,
                'bounds': data.bounds,
                'itemClassName': data.itemClassName,
                'registryIdentifier': data.registryIdentifier,
                'registry': data.registry,
                'municipality': data.municipality,
                'editable': data.editable
            }
        }
    });
