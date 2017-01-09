/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor',

    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance} instance
     * Reference to component that created this view
     * @param {Object} loc
     * Localization data in JSON format
     * @param {Object} data
     * Item data from search ui
     */
    function (instance, localization, data) {
        var me = this;
        me.sandbox = instance.sandbox;
        me.instance = instance;
        me.loc = localization;
        me.data = data; //item data from search ui
        me.itemData = null;  //full item data from registry
        me.templates = {
                'drawHelper': jQuery('<div class="drawHelper"><div class="infoText"></div></div>'),
                //common templates
                'coordinatePopupContent': jQuery('<div class="nba-registry-editor-coordinates-popup-content"><div class="description"></div>' +
                    '<div class="margintop"><div class="floatleft"><select class="srs-select"></select></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lat-input" placeholder="' + me.loc.coordinateLat + '"></input></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lon-input" placeholder="' + me.loc.coordinateLon + '"></input></div><div class="clear"></div></div>' +
                    '</div>'),
                'noItemsFound': jQuery('<div class="noItemsFound">' + me.loc.noItemsFound + '</div>')
        };
        me.template = jQuery(
            '<div class="content-editor">' +
            '  <div class="header">' +
            '    <div class="icon-close">' +
            '    </div>' +
            '    <h3></h3>' +
            '  </div>' +
            '  <div class="content-registry-item">' +
            '  </div>' +
            '</div>');
        me._dialog = null;
        me.editFeature = null; //current item in editing, can be main item, sub item or area item
        me.progressSpinner = Oskari.clazz.create('Oskari.userinterface.component.ProgressSpinner');
        me._coordsConvertionEnabled = false;
        me.registerView = null; //current register view class
    }, {
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

        showMessage: function(title, content, buttons, isModal) {
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
        /**
         * Closes the message dialog if one is open
         */
        closeDialog : function() {
            if(this._dialog) {
                this._dialog.close(true);
                this._dialog = null;
            }
        },
        /**
         * @method startNewDrawing
         * Sends a StartDrawRequest with given params. Changes the panel controls to match the application state (new/edit)
         * @param config params for StartDrawRequest
         */
        sendDrawRequest: function (config, id) {
            var me = this,
                conf = jQuery.extend(true, {}, config);

            me.instance.plugins.drawPlugin.startDrawing(config);
            //Drawing needs to be stopped and restarted once to make editing geometry selectable
            me.sendStopDrawRequest(true);
            me.instance.plugins.drawPlugin.startDrawing(config);
            me.instance.enableGfi(false);
            me._showDrawHelper(conf.drawMode, id, typeof conf.geometry !== 'undefined');

            //zoom to geometry which is being edited
            if (conf.geometry != null && conf.geometry.bounds) {
                var center = conf.geometry.bounds.getCenterLonLat();
                me.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, conf.geometry.bounds, false]);
            }
        },
        /**
         * @method sendStopDrawRequest
         * Sends a StopDrawingRequest.
         * Changes the panel controls to match the application state (new/edit) if propagateEvent != true
         * @param {Boolean} isCancel boolean param for StopDrawingRequest, true == canceled, false = finish drawing (dblclick)
         */
        sendStopDrawRequest: function (isCancel) {
            var me = this;
            if (isCancel) {
                // we wish to clear the drawing without sending further events
                me.instance.plugins.drawPlugin.stopDrawing();
            } else {
                // pressed finished drawing, act like dblclick
                me.instance.plugins.drawPlugin.forceFinishDraw();
            }
        },

        /**
         * @method render
         * Renders view to given DOM element
         * @param {jQuery} container reference to DOM element this component will be
         * rendered to
         */
        render: function (container) {
            var me = this,
                content = me.template.clone(),
                itemDetails;

            me.mainPanel = content;

            container.append(content);

            content.find('div.header h3').append(me.loc.title);
            
            me._refreshData(me.data.id);

            content.find(".icon-close").on('click', function(){
                me.instance.setEditorMode(false);
            });
        },
        
        _refreshData: function(id) {
            var me = this,
                content = me.mainPanel,
                postData = null,
                itemDetails;
            
            content.find(".content-registry-item").empty();
            me.progressSpinner.insertTo(content.find(".content-registry-item"));
            me.progressSpinner.start();

            me._setRegisterView();

            if (me.registerView != null) {
                $.ajax({
                    url: me.instance.sandbox.getAjaxUrl(),
                    data: { 'action_route': 'GetRegistryItems', 'registerName': me.registerView.getRegisterName(), 'id': me.data.id },
                    type: 'GET',
                    success: function (data, textStatus, jqXHR) {
                        me.progressSpinner.stop();
                        content.find(".content-registry-item").empty();
                        me.itemData = data;
                        itemDetails = me.registerView.render(data);
                        content.find(".content-registry-item").append(itemDetails);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        me.showMessage(me.loc.error, me.loc.searchError);
                    }
                });
            }
        },

        _setRegisterView: function () {
            var me = this;
            me.registerView = null;
            if (me.data.registryIdentifier === 'ancientMonument') {
                me.registerView = Oskari.clazz.create('Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentView', me, me.loc);
            } else if (me.data.registryIdentifier === 'ancientMaintenance') {
                me.registerView = Oskari.clazz.create('Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentMaintenanceView', me, me.loc);
            } else if (me.data.registryIdentifier === 'buildingHeritage') {
                me.registerView = Oskari.clazz.create('Oskari.nba.bundle.nba-registry-editor.view.BuildingHeritageView', me, me.loc);
            } else if (me.data.registryIdentifier === 'rky2000') {
                me.registerView = Oskari.clazz.create('Oskari.nba.bundle.nba-registry-editor.view.RKY2000View', me, me.loc);
            } else if (me.data.registryIdentifier === 'project') {
                me.registerView = Oskari.clazz.create('Oskari.nba.bundle.nba-registry-editor.view.ProjectView', me, me.loc);
            }//TODO missing WorldHeritage, Resource
        },

        formatData: function(label, data) {
            var ret = '<div class="registryItemAttrLabel">' + label + "</div>";
            if(typeof data !== 'undefined' && data !== null) {
                if(data.startsWith && data.startsWith("http")) {
                    ret += '<a href="' + data + '">' + this.loc.link + '</a>';
                } else {
                    ret += data;
                }
            }
            return ret;
        },

        /**
         * @method getEditTools
         * Add buttons for editing registry item or subitem.
         *
         * @param {Object} conf - configuration object for tools. Available properties:
         *      - point (true/false)
         *      - area (true/false)
         *      - line (true/false)
         *      - feature (Object)
         *      - type ('main'/'sub')
         *      - id
         */
        getEditTools: function(conf) {
            var me = this,
                geometryType,
                container = jQuery('<div class=toolrow></div>'),
                locBtns = me.instance.getLocalization('buttons'),
                /*pointButton = $("<div />").addClass('add-point tool'),
                pointXYButton = $("<div />").addClass('add-point-xy tool'),
                lineButton = $("<div />").addClass('add-line tool'),
                areaButton = $("<div />").addClass('add-area tool'),
                copyButton = $("<div />").addClass('tool-feature-selection tool');*/
                pointButton = $('<button type="button">' + locBtns.addNewPoint + '</button>').addClass('registryItemActionButton'),
                pointXYButton = $('<button type="button">' + locBtns.createWithXY + '</button>').addClass('registryItemActionButton'),
                lineButton = $('<button type="button">' + locBtns.addNewLine + '</button>').addClass('registryItemActionButton'),
                areaButton = $('<button type="button">' + locBtns.addNewArea + '</button>').addClass('registryItemActionButton'),
                copyButton = $('<button type="button">' + locBtns.copyGeometry + '</button>').addClass('registryItemActionButton');

                

            if (typeof conf.point !== 'undefined' && conf.point) {
                pointButton.on('click', function() {
                    var geometry = undefined;
                    geometryType = 'point';
                    if(conf.feature.geometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    } else if (conf.feature.pointGeometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.pointGeometry).clone();
                    }
                    
                    me.sendDrawRequest({
                        drawMode: geometryType,
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                    me.editFeature._geometryType = geometryType;
                });
                pointButton.attr('id', 'point-' + conf.type + "-" + conf.id);
                if (conf.feature.geometry != null || conf.feature.pointGeometry != null) {
                    pointButton.html(locBtns.editPoint);
                }
                container.append(pointButton);

                pointXYButton.on('click', function () {
                    geometryType = 'point';

                    var pointxyButtonId = this.id,
                        cont = function() {
                            me.editFeature = conf.feature;
                            me._showCoordinatesPopUp(pointxyButtonId);
                            me._dialog.moveTo('div#' + this.id, 'top');
                            if(typeof me.editFeature._type === 'undefined') {
                                me.editFeature._type = conf.type;
                            }
                            me.editFeature._geometryType = geometryType;
                        };

                    if ((typeof conf.feature.geometry === 'undefined' || conf.feature.geometry === null) && (typeof conf.feature.pointGeometry === 'undefined' || conf.feature.pointGeometry === null)) {
                        cont();
                    } else {
                        var title = me.loc.warning,
                            content = me.loc.featureHasGeometry,
                            continueButton = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                            cancelButton = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton'),
                            buttons = [cancelButton, continueButton];

                        cancelButton.setHandler(function() {
                            me._dialog.close(true);
                            me._dialog = null;
                        });

                        continueButton.setTitle(me.instance.getLocalization('buttons')["continue"]);
                        continueButton.addClass('primary');
                        continueButton.setHandler(function() {
                            me._dialog.close(true);
                            me._dialog = null;
                            cont();
                        });

                        me.showMessage(title, content, buttons);
                    }
                });
                pointXYButton.attr('id', 'pointxy-' + conf.type + "-" + conf.id);
                container.append(pointXYButton);
            }

            if (typeof conf.line !== 'undefined' && conf.line) {
                lineButton.on('click', function() {
                    geometryType = 'line';
                    var geometry = undefined;
                    if(typeof conf.feature.geometry !== 'undefined') {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    }
                    me.sendDrawRequest({
                        drawMode: geometryType,
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                    me.editFeature._geometryType = geometryType;
                });
                lineButton.attr('id', 'line-' + conf.type + "-" + conf.id);
                if (conf.feature.geometry != null) {
                    lineButton.html(locBtns.editLine);
                }
                container.append(lineButton);
            }

            if (typeof conf.area !== 'undefined' && conf.area) {
                areaButton.on('click', function() {
                    geometryType = 'area';
                    var geometry = undefined;
                    if(conf.feature.geometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    } else if (conf.feature.areaGeometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.areaGeometry).clone();
                    }
                    
                    me.sendDrawRequest({
                        drawMode: geometryType,
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                    me.editFeature._geometryType = geometryType;
                });
                areaButton.attr('id', 'area-' + conf.type + "-" + conf.id);
                if (conf.feature.geometry != null || conf.feature.areaGeometry != null) {
                    areaButton.html(locBtns.editArea);
                }
                container.append(areaButton);
            }

            copyButton.on('click', function () {
                var currentCopyButton = this;

                var onFinishSelectionCallback = function () {
                    var selectedLayers = me.sandbox.findAllSelectedMapLayers(),
                            geometryFilters = [];
                    
                    for (var i = 0; i < selectedLayers.length; i++) {
                        var layer = selectedLayers[i];

                        if (layer.getClickedGeometries !== null && layer.getClickedGeometries !== undefined && layer.getClickedGeometries().length > 0) {

                            if (layer.getClickedGeometries().length > 1) {
                                me.showMessage(me.loc.error, me.loc.selectError);
                            } else {
                                //check if geometry suits to proper type
                                var geometry = layer.getClickedGeometries()[0][1],//WKT string
                                    wktFormat = new OpenLayers.Format.WKT({}),
                                    feature = wktFormat.read(geometry),//vector feature
                                    geojsonFormat = new OpenLayers.Format.GeoJSON({}),
                                    geoJsonFeature = geojsonFormat.write(feature.geometry);//GeoJSON string

                                me.editFeature._geometryType = me._getGeometryTypeForCopy(conf, geoJsonFeature);

                                if (me.editFeature._geometryType != null) {

                                    var attributes = me._getLayerAttributes(layer);
                                    var selectedFeature = null;
                                    var fields = layer.getFields();
                                    var activeFeatures = layer.getActiveFeatures();

                                    //maybe here is better way to get selected feature
                                    for (var k = 0; k < activeFeatures.length; k++) {
                                        if (activeFeatures[k][0] == layer.getClickedGeometries()[0][0]) {
                                            selectedFeature = activeFeatures[k];
                                        }
                                    }

                                    me._showParameterUpdateDialog(currentCopyButton.id, geoJsonFeature, attributes, selectedFeature, fields);
                                } else {
                                    me.showMessage(me.loc.error, me.loc.wrongGeometryError);
                                }
                            }
                        }

                    }
                };

                var cont = function() {
                    var popupHandler = Oskari.clazz.create('Oskari.mapframework.bundle.featuredata2.PopupHandler', me);
                    popupHandler.showSelectionTools(onFinishSelectionCallback);

                    me.editFeature = conf.feature;
                    if (typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                };
                
                if ((typeof conf.feature.geometry === 'undefined' || conf.feature.geometry === null)
                    && (typeof conf.feature.pointGeometry === 'undefined' || conf.feature.pointGeometry === null)
                    && (typeof conf.feature.areaGeometry === 'undefined' || conf.feature.areaGeometry === null)) {
                    cont();
                } else {
                    var title = me.loc.warning,
                        content = me.loc.featureHasGeometry,
                        continueButton = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                        cancelButton = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton'),
                        buttons = [cancelButton, continueButton];

                    cancelButton.setHandler(function() {
                        me._dialog.close(true);
                        me._dialog = null;
                    });

                    continueButton.setTitle(me.instance.getLocalization('buttons')["continue"]);
                    continueButton.addClass('primary');
                    continueButton.setHandler(function() {
                        me._dialog.close(true);
                        me._dialog = null;
                        cont();
                    });

                    me.showMessage(title, content, buttons);
                }
            });
            copyButton.attr('id', 'copy-' + conf.type + "-" + conf.id);
            container.append(copyButton);

            /*if (!this.selectionPlugin) {
                var config = {
                    id: "FeatureData"
                };
                this.selectionPlugin = Oskari.clazz.create('Oskari.mapframework.bundle.featuredata2.plugin.MapSelectionPlugin', config, this.sandbox);
                mapModule.registerPlugin(this.selectionPlugin);
                mapModule.startPlugin(this.selectionPlugin);
            }*/

            return container;
        },

        _getGeometryTypeForCopy: function (conf, geoJsonFeature) {
            var geojsonFormat = new OpenLayers.Format.GeoJSON({}),
                geod = JSON.parse(geoJsonFeature);
            
            if (typeof conf.area !== 'undefined' && conf.area && (geojsonFormat.isValidType(geod, 'Polygon') || geojsonFormat.isValidType(geod, 'MultiPolygon'))) {
                return 'area';

            } else if (typeof conf.point !== 'undefined' && conf.point && (geojsonFormat.isValidType(geod, 'Point') || geojsonFormat.isValidType(geod, 'MultiPoint'))) {
                return 'point';

            } else if (typeof conf.line !== 'undefined' && conf.line && (geojsonFormat.isValidType(geod, 'LineString') || geojsonFormat.isValidType(geod, 'MultiLineString'))) {
                return 'line';

            } else {
                return null;
            }
        },

        _getLayerAttributes: function (layer) {
            // Make copies of fields and locales
            var fields = (layer.getFields && layer.getFields()) ? layer.getFields().slice(0) : [],
                locales = (layer.getLocales && layer.getLocales()) ? layer.getLocales().slice(0) : [],
                attributes = [],
                i;

            for (i = 0; i < fields.length; i += 1) {
                // Get only the fields which originate from the service,
                // that is, exclude those which are added by Oskari (starts with '__').
                if (!fields[i].match(/^__/)) {
                    attributes.push({
                        id: fields[i],
                        name: (locales[i] || fields[i])
                    });
                }
            }

            return attributes;
        },

        _showDrawHelper: function (drawMode, id, isEdit) {
            if (this._dialog) {
                this._dialog.close(true);
                this._dialog = null;
            }
            var me = this,
                locTool = this.instance.getLocalization('tools')[drawMode];

            var locBtns = this.instance.getLocalization('buttons'),
                title = locTool.title,
                message = locTool.add,
                dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            this._dialog = dialog;
            if(isEdit) {
                message = locTool.edit;
            }
            var buttons = [],
                cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton');
            //cancelBtn.setTitle(locBtns.cancel);
            cancelBtn.setHandler(function () {
                // ask toolbar to select default tool
                var toolbarRequest = me.instance.sandbox.getRequestBuilder('Toolbar.SelectToolButtonRequest')();
                me.instance.sandbox.request(me, toolbarRequest);
                me.sendStopDrawRequest(true);
                dialog.close(true);
                me._dialog = null;
            });
            buttons.push(cancelBtn);

            var finishBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');

            finishBtn.setTitle(locBtns.finish);
            finishBtn.addClass('primary');
            finishBtn.setHandler(function () {
                var drawing = me.instance.plugins.drawPlugin.getDrawing(),
                    format = new OpenLayers.Format.GeoJSON(),
                    geometry = format.write(drawing);

                //in case of MultiPoint geometry get only first Point
                if (JSON.parse(geometry).type === "MultiPoint") {
                    geometry = format.write(drawing.components[0]);
                }

                //in case of MultiLineString geometry get only first LineString
                if (JSON.parse(geometry).type === "MultiLineString") {
                    geometry = format.write(drawing.components[0]);
                }

                me._dialog.close(true);
                me._dialog = null;

                me._showParameterUpdateDialog(id, geometry);
            });
            buttons.push(finishBtn);

            var content = me.templates.drawHelper.clone();
            content.find('div.infoText').html(message);

            dialog.show(title, content, buttons);
            dialog.moveTo('button#' + id, 'top');
        },
        
        /**
         * @method _showParameterUpdateDialog
         * Show a dialog to fill proper attributes of the feature
         * @param id DOM element id of the tool button
         * @param geometry new geometry in GeoJson format
         */
        _showParameterUpdateDialog: function (id, geometry, attributes, selectedFeature, fields) {
            var me = this,
                locBtns = me.instance.getLocalization('buttons'),
                dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                buttons = [],
                title = me.loc.geometryDetailsInfoTitle,
                cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton'),
                finishBtn = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                editForm = me.registerView.renderUpdateDialogContent(attributes, selectedFeature, fields);
                
            //If edit form provided then show it and collect data for update. Otherwise save only geometry.
            if (editForm != null) {

                me._dialog = dialog,

                cancelBtn.setHandler(function () {
                    // ask toolbar to select default tool
                    var toolbarRequest = me.instance.sandbox.getRequestBuilder('Toolbar.SelectToolButtonRequest')();
                    me.instance.sandbox.request(me, toolbarRequest);
                    me.sendStopDrawRequest(true);
                    dialog.close(true);
                    me._dialog = null;
                });
                buttons.push(cancelBtn);

                finishBtn.setTitle(locBtns.finish);
                finishBtn.addClass('primary');
                finishBtn.setHandler(function () {

                    me.editFeature._edited = true;
                    
                    me.registerView.collectDataForUpdate(content, geometry);

                    me.sendStopDrawRequest(true);
                    me._dialog.close(true);
                    me._dialog = null;

                    me._saveRegistryItem();
                });
                buttons.push(finishBtn);

                var content = me.templates.drawHelper.clone();
                content.find('div.infoText').html(me.loc.geometryDetailsInfo);
                content.append(editForm);

                dialog.show(title, content, buttons);
                dialog.moveTo('div#' + id, 'top');

            } else {
                me.sendStopDrawRequest(true);
                me.editFeature._edited = true;
                me.registerView.collectDataForUpdate(null, geometry);
                me._saveRegistryItem();
            }
        },

        _saveRegistryItem: function () {
            var me = this,
                postData = me.registerView.preparePostData();
                
            if (postData != null) {
                $.ajax({
                    url: me.instance.sandbox.getAjaxUrl() + "action_route=UpdateRegistryItems",
                    data: postData,
                    type: 'POST',
                    success: function (data, textStatus, jqXHR) {
                        if (data.updated) {
                            me._refreshData(me.data.id);
                            var message = me.loc.featureUpdated;
                            if(data.areaIntersects) {
                                message = message + '<br/>' + me.loc.areaIntersects;
                            }
                            me.showMessage(me.loc.success, message);
                            
                            me._clearTiles();
                        } else {
                            var errorMessage = me.loc.updateError;
                            if(typeof data.error !== 'undefined' && typeof me.loc[data.error] !== 'undefined') {
                                errorMessage = me.loc[data.error];
                            }
                            me.showMessage(me.loc.error, errorMessage);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        me.showMessage(me.loc.error, me.loc.updateError);
                    }
                });
            } else {
                me.showMessage(me.loc.error, me.loc.updateError);
            }
        },
        
        _clearTiles: function() {
            var me = this,
                wfsLayerPlugin = me.sandbox.findRegisteredModuleInstance('MainMapModuleWfsLayerPlugin'),
                layerService = me.sandbox.getService('Oskari.mapframework.service.MapLayerService'),
                mapModule = this.sandbox.findRegisteredModuleInstance('MainMapModule');
            
            $.each(me.itemData.mapLayers, function(i, obj) {
                var layer = layerService.findMapLayer(obj.mapLayerID);
                wfsLayerPlugin.deleteTileCache(obj.mapLayerID, layer.getCurrentStyle().getName());
            });
            
            //force refresh of layers
            mapModule.adjustZoomLevel(0);
        },

        addDropdownsToTemplate: function (template, attributes, selectedFeature, fields) {
            var me = this;
            //template.find("input[type=text]").each(function () {
            template.find("input").each(function () {

                var input = $(this);
                var attrSelect = jQuery('<select></select>');
                me._appendOptionValues(attrSelect, 'Select attribute value', attributes);
                attrSelect.on('change', function () {

                    var attrIndex = fields.indexOf($(this).val());

                    var attrValue = selectedFeature[attrIndex];

                    input.val(attrValue);
                });

                input.before(attrSelect);

            });
        },

        _appendOptionValues: function (select, placeHolder, values) {
            var option = jQuery("<option></option>"),
                i;
            // Append the first, empty value to work as a placeholder
            if (placeHolder) {
                option.attr('value', '');
                option.attr('disabled', 'disabled');
                option.attr('selected', 'selected');
                option.html(placeHolder);
                select.append(option);
            }

            // Iterate the list of given values
            for (i = 0; values && i < values.length; ++i) {
                option = jQuery("<option></option>");
                // Array of strings.
                if (typeof values[i] === 'string') {
                    option.attr('value', values[i]);
                    option.html(values[i]);
                } else {
                    // Otherwise we're assuming an array of objects.
                    option.attr('value', values[i].id);
                    option.html(values[i].name);
                }
                select.append(option);
            }
        },

        _showCoordinatesPopUp: function (elementId) {
            var me = this,
                popupContent = me.templates.coordinatePopupContent.clone(),
                title = me.loc.coordinatePopup.title,
                saveBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.SubmitButton'),
                cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.CancelButton'),
                buttons = null,
                lon = null,
                lat = null,
                selectedProjection = null;

            me.closeDialog();
            me._dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');

            popupContent.find('.description').html(me.loc.coordinatePopup.description);
            
            //TODO: Add projections array to app config. Example:
            var conf = {
                projections : [
                    {
                        "name": "EPSG:3067",
                        "text": "ETRS89-TM35FIN (EPSG:3067)",
                        "definition": "+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs",
                        "default": true
                    },
                    {
                        "name": "EPSG:4326",
                        "text": "WGS84 (EPSG:4326)",
                        "definition": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
                        "default": false
                    },
                    {
                        "name": "EPSG:2393",
                        "text": "YKJ (EPSG:2393)",
                        "definition": "+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=3500000 +y_0=0 +ellps=intl +units=m +no_defs",
                        "default": false
                    }
                ]
            };

            // Set the dropdown with supported projections
            if (conf && conf.projections && conf.projections.length > 0) {
                me._coordsConvertionEnabled = true;

                $.each(conf.projections, function (i, item) {

                    popupContent.find('.srs-select').append($('<option>', {
                        value: item.name,
                        text: item.text
                    }));

                    if (item.default) {
                        popupContent.find('.srs-select option[value="' + item.name + '"]').prop("selected", "selected");
                    }

                    Proj4js.defs[item.name] = item.definition;
                });

            } else {
                me._coordsConvertionEnabled = false;

                popupContent.find('.srs-select').append($('<option>', {
                    value: crs,
                    text: crsText,
                    selected: "selected"
                }));
            }

            //buttons
            saveBtn.setTitle(me.loc.coordinatePopup.saveObject)
            saveBtn.setHandler(function () {

                lon = parseFloat(popupContent.find('.lon-input').val());
                lat = parseFloat(popupContent.find('.lat-input').val());
                selectedProjection = popupContent.find('.srs-select').val();
                
                if (lon != null && !isNaN(lon) && lat != null && !isNaN(lat)) {
                    me._dialog.close(true);
                    me._dialog = null;
                    me._addPointFromCoordinates(lon, lat, selectedProjection, elementId);
                } else {
                    me.showMessage(me.loc.error, me.loc.coordinatePopup.missingCoordsError);
                }

            });

            cancelBtn.setHandler(function () {
                me._dialog.close(true);
                me._dialog = null;
            });

            buttons = [cancelBtn, saveBtn];
            
            me._dialog.show(title, popupContent, buttons);
        },

        _addPointFromCoordinates: function (lon, lat, crs, elementId) {
            var me = this,
                convertedCoordinates,
                mapModule = me.sandbox.findRegisteredModuleInstance('MainMapModule'),
                currentProjection = mapModule.getProjection(),
                wktFormat = new OpenLayers.Format.WKT({}),
                geojsonFormat = new OpenLayers.Format.GeoJSON({});
                feature = null,
                geometry = null,
                coordinates = {
                    'lonlat':
                        {
                            'lon': lon,
                            'lat': lat
                        }
                };

            if (me._coordsConvertionEnabled) {
                convertedCoordinates = me._convertCoordinates(crs, currentProjection, coordinates);
            } else {
                convertedCoordinates = coordinates;
            }

            //create point
            feature = wktFormat.read('POINT (' + convertedCoordinates.lonlat.lon + ' ' + convertedCoordinates.lonlat.lat + ')');
            geometry = geojsonFormat.write(feature.geometry);
            me._showParameterUpdateDialog(elementId, geometry);
        },

        /**
         * Converts coordinates from one projection to another
         * @method @private _convertCoordinates
         * @param {string} sourceSrs source projection
         * @param {string} destSrs destination projection
         * @param {Object} coordinates lon and lat object {lonlat: { lat: 0, lon: 0}}
         * @return {Object} converted coordinates lon and lat object {lonlat: { lat: 0, lon: 0}}
         */
        _convertCoordinates: function (sourceSrsName, destSrsName, coordinates) {
            var me = this,
                source,
                dest,
                point,
                convertedCoords;

            if (me._coordsConvertionEnabled) {
                source = new Proj4js.Proj(sourceSrsName),
                dest = new Proj4js.Proj(destSrsName),
                point = new Proj4js.Point(coordinates.lonlat.lon, coordinates.lonlat.lat),
                convertedCoords = Proj4js.transform(source, dest, point);

                return {
                    'lonlat': {
                        'lon': convertedCoords.x,
                        'lat': convertedCoords.y
                    }
                };
            } else {
                return coordinates;
            }
        },

        /**
         * @method destroy
         * Destroys/removes this view from the screen.
         *
         *
         */
        destroy: function () {
            this.mainPanel.remove();
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: ['Oskari.mapframework.module.Module']
    });
