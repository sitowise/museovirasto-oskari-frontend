/**
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
        this._getRegisters();
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

            //add search input
            searchInput.setIds(null, "nba-registers-search-input");
            searchInput.setPlaceholder(searchPlaceholder);
            searchInput.addClearButton();

            //add search button
            searchButton.setHandler(function () {
                var selectElement = me.getContent().find('div.registerSelect select'),
                    checkboxElement =  tabContent.find('#limitResultsToAreaCheckbox');

                //clear data in grid
                //var dataModel = me.resultsGrid.getDataModel().setData([]);
                if (me.resultsContainer != null) {
                    me.resultsContainer.empty();
                }

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
                        //FIXME it's for local testing
                        //params.geometry = "MULTIPOLYGON (((380192 7549184, 507168 7356672, 572704 7487744, 535840 7610624, 380192 7549184)))|MULTIPOLYGON (((513312 7137536, 599328 7278848, 415008 7291136, 513312 7137536)))|MULTIPOLYGON (((374048 7121152, 355616 7057664, 511264 7037184, 476448 7133440, 460064 7139584, 374048 7121152)))";
                    }

                    me._getRegistryItems(params);
                }
            });

            tabContent.find('div.nba-searchInput').append(searchInput.getField());
            tabContent.find('div.nba-searchButton').append(searchButton.getElement());

            
            showAllResultsLink.bind('click', function () {
                me._showAllResultsOnMap();
                return false;
            });
            tabContent.find('div.showAllResultsLink').append(showAllResultsLink);

            this.progressSpinner.insertTo(tabContent.find('div.nba-progressSpinner'));

            return tabContent;
        },

        _renderResultGrid: function (results) {
            var me = this,
                resultGrid = this.templates.resultsGrid.clone(),
                gridTexts = this.loc['grid'],
                gridModel = Oskari.clazz.create('Oskari.userinterface.component.GridModel'),
                grid = Oskari.clazz.create('Oskari.userinterface.component.Grid'),
                searchInput = jQuery(me.tabContent.find('#nba-registers-search-input'));

            //set the title and number of given results
            //TODO make localization "Hakutulokset: XX hakutulosta hakusanalla XX"
            //resultGrid.find('div.resultsTitle').append("Search results: " + results.length + " search results for the search " + searchInput.val());
            resultGrid.find('div.resultsTitle').append("Hakutulokset: " + results.length + " hakutulosta haulle " + searchInput.val());

            gridModel.setIdField('id');

            _.each(results, function (result) {
                gridModel.addData({
                    'id': result.id,
                    'desc': result.desc.trim(),
                    //'x': result.coordinateX,
                    //'y': result.coordinateY,
                    'nbaUrl': result.nbaUrl,
                    'mapLayers': result.mapLayers,
                    'bounds': result.bounds,
                    'itemtype': result.itemtype
                });
            });

            grid.setDataModel(gridModel);
            grid.setVisibleFields(['id', 'desc', 'actions']);

            grid.setColumnValueRenderer('id', function (name, data) {
                var idLink = jQuery('<a>' + name + '</a>');
                idLink.bind('click', function () {
                    //showing layer for the register
                    for (var i = 0; i < data.mapLayers.length; i++) {
                        var mapLayerId = data.mapLayers[i].mapLayerID,
                            layer = me.sandbox.findMapLayerFromAllAvailable();
                        if (layer != null) {
                            me.sandbox.postRequestByName('AddMapLayerRequest', [mapLayerId, true]);
                        } else {
                            //TODO show error
                        }
                    }

                    //TODO probably need to be converted to current coordinate system
                    //var x = data.x,
                        //y = data.y,
                        //zoomLevel = 7;
                    var extent = new OpenLayers.Bounds(data.bounds),
                        center = extent.getCenterLonLat(),
                        x = center.lon,
                        y = center.lat;
                    
                    //me.sandbox.postRequestByName('MapMoveRequest', [x, y, zoomLevel]);
                    me.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, extent, false]);

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
                    me.sandbox.postRequestByName('InfoBox.ShowInfoBoxRequest', [popupId, "Register item details", [infoBoxContent], lonlat, true]);
                    return false;
                });
                return idLink;
            });
            
            grid.setColumnValueRenderer('actions', function (name, data) {
                //FIXME: needs to check if user has specific role
                if (me.sandbox.getUser().isLoggedIn()) {
                    var idLink = jQuery('<a>' + me.loc.grid.editItems + '</a>');
                    idLink.bind('click', function () {
                        me.sandbox.postRequestByName('RegistryEditor.ShowRegistryEditorRequest', [data]);
                        return false;
                    });
                    return idLink;
                }
            });

            grid.setColumnUIName('id', gridTexts.id);
            grid.setColumnUIName('desc', gridTexts.desc);
            grid.setColumnUIName('actions', gridTexts.actions);
            grid.renderTo(resultGrid.find('div.grid'));

            this.tabContent.append(resultGrid);

            this.resultsGrid = grid;

            return resultGrid;
        },

        _getInfoBoxHtml: function (result) {
            //TODO make localization
            //TODO fix styling and layout
            var template = '<h3>fid: ' + result.id + '</h3>' +
                            //'<h3>Shape: ' + result.id + '</h3>' +
                            '<h3>Mjtunnus: ' + result.id + '</h3>' +
                            '<h3>Kohdenimi: ' + result.desc + '</h3>' +
                            '<h3>Rekisteritiedot: <a href="' + result.nbaUrl + '" target="_blank">Linkki rekisteritietoihin</a></h3>';
            return template;
        },

        _getRegisters: function () {
            var me = this;
            this.instance.getSearchService().getRegisters(
                function (results) {
                    me._handleRegistersResults(results);
                },
                function () {
                    //TODO handle error
                });
        },

        _handleRegistersResults: function (results) {
            if (jQuery.isEmptyObject(results)) {
                return;
            }

            var selectElement = this.getContent().find('div.registerSelect select');

            $.each(results, function (i, item) {
                selectElement.append($('<option>', {
                    value: item.id,
                    text: item.name
                }));
            });
        },

        _getRegistryItems: function (params) {
            var me = this;
            this.progressSpinner.start();
            this.instance.getSearchService().getRegistryItems(
                params,
                function (results) {
                    me._handleRegistryItemsResults(results);
                },
                function () {
                    this.progressSpinner.stop();
                    //TODO handle error
                });
        },

        _handleRegistryItemsResults: function (results) {
            this.progressSpinner.stop();
            if (jQuery.isEmptyObject(results)) {
                return;
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
                                layerId: mapLayerId
                            };

                            features.push(featureJson);
                        }
                    }

                    //3. Create feature and add to fake layer
                    feature = format.read('POINT (' + data.x + ' ' + data.y + ')');
                    registerSearchLayer.addFeatures([feature]);
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
                }
            }
        }
    });