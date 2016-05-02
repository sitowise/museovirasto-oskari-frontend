/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor',

    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.nba.bundle.nba-registry-editor.RegistryEditorBundleInstance} instance
     * Reference to component that created this view
     * @param {Object} localization
     * Localization data in JSON format
     * @param {string} layerId
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
                'ancientMonument': jQuery('<div id="ancientMonument"><div id="main"><h4>' + me.loc.ancientMonument.main + '</h4></div><div id="sub"><h4>' + me.loc.ancientMonument.sub + '</h4></div><div id="area"><h4>' + me.loc.ancientMonument.area + '</h4></div></div>'),
                'ancientMonumentMainItem': jQuery('<div class="item ancientMonumentMainItem"><div class="name"/><div class="description"/><div class="id"/><div class="surveyingAccuracy"/><div class="surveyingType"/><div class="createDate"/><div class="modifyDate"/><div class="classification"/><div class="municipalityName"/><div class="url"/><div class="subType"/><div class="tools"/></div>'),
                'ancientMonumentSubItem': jQuery('<div class="item ancientMonumentSubItem"><div class="description"/><div class="id"/><div class="surveyingAccuracy"/><div class="surveyingType"/><div class="tools"/></div>'),
                'ancientMonumentAreaItem': jQuery('<div class="item ancientMonumentAreaItem"><div class="description"/><div class="surveyingAccuracy"/><div class="surveyingType"/><div class="modifyDate"/><div class="areaSelectionSource"/><div class="sourceDating"/><div class="digiMk"/><div class="areaSelectionType"/><div class="createDate"/><div class="tools"/></div>'),
                'ancientMonumentAreaItemAdd': jQuery('<div class="item newItem ancientMonumentAreaItem">' + me.loc.ancientMonument.addNew + '<div class="tools"/></div>'),
                'ancientMonumentSurveyingDetails': jQuery('<label>' + me.loc.ancientMonument.surveyingType + '<input type="number" id="surveyingType"></label></br><label>' + me.loc.ancientMonument.surveyingAccuracy + '<input type="number" id="surveyingAccuracy"></label>'),
                'ancientMonumentAreaSurveyingDetails': jQuery('<input type="text" id="name" placeholder="'+ me.loc.ancientMonument.name +'"></br>' + '<input type="text" id="municipalityName" placeholder="'+ me.loc.ancientMonument.municipalityName +'"></br>' + '<input type="text" id="description" placeholder="'+ me.loc.ancientMonument.description +'"></br>' + '<input type="number" id="classification" placeholder="'+ me.loc.ancientMonument.classification +'"></br>' + '<input type="text" id="copyright" placeholder="'+ me.loc.ancientMonument.copyright +'"></br>' + '<input type="text" id="digiMk" placeholder="'+ me.loc.ancientMonument.digiMk +'"></br>' + '<input type="text" id="digiMkYear" placeholder="'+ me.loc.ancientMonument.digiMkYear +'"></br>' + '<input type="text" id="digitizationAuthor" placeholder="'+ me.loc.ancientMonument.digitizationAuthor +'"></br>' + '<input type="date" id="digitizationDate" placeholder="'+ me.loc.ancientMonument.digitizationDate +'"></br>' + '<input type="number" id="areaSelectionType" placeholder="'+ me.loc.ancientMonument.areaSelectionType +'"></br>' + '<input type="number" id="areaSelectionSource" placeholder="'+ me.loc.ancientMonument.areaSelectionSource +'"></br>' + '<input type="number" id="surveyingAccuracy" placeholder="'+ me.loc.ancientMonument.surveyingAccuracy +'"></br>' + '<input type="number" id="surveyingType" placeholder="'+ me.loc.ancientMonument.surveyingType +'">'),
                'buttons': jQuery('<div class=buttons/>'),
                'coordinatePopupContent': jQuery('<div class="nba-registry-editor-coordinates-popup-content"><div class="description"></div>' +
                    '<div class="margintop"><div class="floatleft"><select class="srs-select"></select></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lon-input" placeholder="X"></input></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lat-input" placeholder="Y"></input></div><div class="clear"></div></div>' +
                    '</div>')
        };
        me.template = jQuery(
            '<div class="content-editor">' +
            '  <div class="header">' +
            '    <div class="icon-close">' +
            '    </div>' +
            '    <h3></h3>' +
            '  </div>' +
            '  <div class="content">' +
            '  </div>' +
            '</div>');
        me._dialog = null;
        me.editFeature = null; //current item in editing, can be main item, sub item or area item
        me.edited = false; //true if something has been edited
        me.progressSpinner = Oskari.clazz.create('Oskari.userinterface.component.ProgressSpinner');
        me._coordsConvertionEnabled = false;
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


            var startRequest = me.instance.sandbox.getRequestBuilder('DrawPlugin.StartDrawingRequest')(conf);
            me.instance.sandbox.request(me, startRequest);
            //Drawing needs to be stopped and restarted once to make editing geometry selectable
            me.sendStopDrawRequest(true);
            me.instance.sandbox.request(me, startRequest);
            me.instance.enableGfi(false);
            me._showDrawHelper(conf.drawMode, id, typeof conf.geometry !== 'undefined');
        },
        /**
         * @method sendStopDrawRequest
         * Sends a StopDrawingRequest.
         * Changes the panel controls to match the application state (new/edit) if propagateEvent != true
         * @param {Boolean} isCancel boolean param for StopDrawingRequest, true == canceled, false = finish drawing (dblclick)
         */
        sendStopDrawRequest: function (isCancel) {
            var me = this;
            var request = this.instance.sandbox.getRequestBuilder('DrawPlugin.StopDrawingRequest')(isCancel);
            this.instance.sandbox.request(this, request);
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
                postData = null;
            
            content.find(".content").empty();
            me.progressSpinner.insertTo(content.find(".content"));
            me.progressSpinner.start();
            
            if(me.data.itemtype === 'AncientMonument') {
                postData = {'action_route': 'GetRegistryItems', 'registerName': 'ancientMonument', 'id': me.data.id};
            }

            $.ajax({
                url: me.instance.sandbox.getAjaxUrl(),
                data: postData,
                type: 'GET',
                success: function(data, textStatus, jqXHR) {
                    me.progressSpinner.stop();
                    content.find(".content").empty();
                    me.itemData = data;
                    if(data.itemtype === 'AncientMonument') {
                        me._renderAncientMonument(data, content);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    me.showMessage(me.loc.error, me.loc.searchError);
                }
            });
        },
        
        _renderAncientMonument: function(data, content) {
            var me = this,
                itemDetails = me.templates.ancientMonument.clone(),
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub"),
                area = itemDetails.find('#area'),
                saveBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.SaveButton'),
                buttons = me.templates.buttons.clone(),
                postData = null;

            saveBtn.setHandler(function () {
                if(me.edited) {
                    if(me.data.itemtype === 'AncientMonument') {
                        var edited = {'id': me.itemData.id, 'edited': me.itemData._edited, 'subItems': [], 'areas': []};
                        $.each(me.itemData.subItems, function(index, item) {
                            if(item._edited) {
                                edited.subItems.push(item.id);
                            }
                        });
                        $.each(me.itemData.areas, function(index, item) {
                            if(item._edited) {
                                edited.areas.push(item.id);
                            }
                        });
                        postData = {'registerName': 'ancientMonument', 'item': JSON.stringify(me.itemData), 'edited': JSON.stringify(edited)};
                    }
                    $.ajax({
                        url: me.instance.sandbox.getAjaxUrl() + "action_route=UpdateRegistryItems",
                        data: postData,
                        type: 'POST',
                        success: function(data, textStatus, jqXHR) {
                            if(data.updated) {
                                me._refreshData(me.data.id);
                                me.showMessage(me.loc.success, me.loc.featureUpdated);
                            } else {
                                me.showMessage(me.loc.error, me.loc.updateError);
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            me.showMessage(me.loc.error, me.loc.updateError);
                        }
                    });
                } else {
                    me.showMessage(me.loc.error, me.loc.noEditsDone);
                }
            });

            buttons.append(saveBtn.getButton());

            var mainItemRow = me.templates.ancientMonumentMainItem.clone();

            mainItemRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.description));
            mainItemRow.find('.id').append(me._formatData(me.loc.ancientMonument.id, data.id));
            mainItemRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, data.surveyingAccuracy));
            mainItemRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, data.surveyingType));
            mainItemRow.find('.modifyDate').append(me._formatData(me.loc.ancientMonument.modifyDate, data.modifyDate));
            mainItemRow.find('.url').append(me._formatData(me.loc.ancientMonument.url, data.nbaUrl));
            mainItemRow.find('.classification').append(me._formatData(me.loc.ancientMonument.classification, data.classification));
            mainItemRow.find('.municipalityName').append(me._formatData(me.loc.ancientMonument.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me._formatData(me.loc.ancientMonument.objectName, data.objectName));
            mainItemRow.find('.subType').append(me._formatData(me.loc.ancientMonument.subType, data.subType.join(", ")));
            mainItemRow.find('.createDate').append(me._formatData(me.loc.ancientMonument.createDate, data.createDate));

            mainItemRow.find('.tools').append(me._getEditTools({'point': true, 'id': data.id, 'type': 'main', feature: data}));

            main.append(mainItemRow);

            for(var i = 0; i < data.subItems.length; ++i) {
                var subItemRow = me.templates.ancientMonumentSubItem.clone();

                subItemRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.subItems[i].description));
                subItemRow.find('.id').append(me._formatData(me.loc.ancientMonument.id, data.subItems[i].objectId));
                subItemRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, data.subItems[i].surveyingAccuracy));
                subItemRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, data.subItems[i].surveyingType));

                subItemRow.find('.tools').append(me._getEditTools({'point': true, 'id': data.subItems[i].objectId, 'type': 'sub', feature: data.subItems[i]}));

                sub.append(subItemRow);
            }

            for(var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.ancientMonumentAreaItem.clone();

                areaRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, data.areas[i].surveyingAccuracy));
                areaRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, data.areas[i].surveyingType));
                areaRow.find('.modifyDate').append(me._formatData(me.loc.ancientMonument.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.areaSelectionSource').append(me._formatData(me.loc.ancientMonument.areaSelectionSource, data.areas[i].areaSelectionSource));
                areaRow.find('.sourceDating').append(me._formatData(me.loc.ancientMonument.sourceDating, data.areas[i].sourceDating));
                areaRow.find('.digiMk').append(me._formatData(me.loc.ancientMonument.digiMk, data.areas[i].digiMk));
                areaRow.find('.areaSelectionType').append(me._formatData(me.loc.ancientMonument.areaSelectionType, data.areas[i].areaSelectionType));
                areaRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.areas[i].description));
                areaRow.find('.createDate').append(me._formatData(me.loc.ancientMonument.createDate, data.areas[i].createDate));
                areaRow.find('.tools').append(me._getEditTools({'area': true, 'id': data.areas[i].id, 'type': 'area', feature: data.areas[i]}));

                area.append(areaRow);
            }
            
            var newAreaRow = me.templates.ancientMonumentAreaItemAdd.clone();
            newAreaRow.find('.tools').append(me._getEditTools({'area': true, 'id': -1, 'type': 'area', feature: {}}));
            area.append(newAreaRow)
            
            content.find(".content").append(itemDetails);
            content.find(".content").append(buttons);
        },

        _formatData: function(label, data) {
            var ret = label + ": ";
            if(typeof data !== 'undefined' && data !== null) {
                if(data.startsWith && data.startsWith("http")) {
                    ret += '<a href="' + data + '">' + this.loc.link + '</a>';
                } else {
                    ret += data;
                }
            }
            return ret;
        },

        _getEditTools: function(conf) {
            var me = this,
                container = jQuery('<div class=toolrow></div>'),
                pointButton = $("<div />").addClass('add-point tool'),
                pointXYButton = $("<div />").addClass('add-point-xy tool'),
                lineButton = $("<div />").addClass('add-line tool'),
                areaButton = $("<div />").addClass('add-area tool'),
                selectButton = $("<div />").addClass('tool-feature-selection tool');

            if(typeof conf.point !== 'undefined' && conf.point) {
                pointButton.on('click', function() {
                    var geometry = undefined;
                    if(typeof conf.feature.geometry !== 'undefined') {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    }
                    me.sendDrawRequest({
                        drawMode: 'point',
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                });
                pointButton.attr('id', 'point-' + conf.type + "-" + conf.id);
                container.append(pointButton);

                pointXYButton.on('click', function () {
                    me.editFeature = conf.feature;
                    me._showCoordinatesPopUp();
                    me._dialog.moveTo('div#' + this.id, 'top');
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                });
                pointXYButton.attr('id', 'pointxy-' + conf.type + "-" + conf.id);
                container.append(pointXYButton);
            }

            if(typeof conf.line !== 'undefined' && conf.line) {
                lineButton.on('click', function() {
                    var geometry = undefined;
                    if(typeof conf.feature.geometry !== 'undefined') {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    }
                    me.sendDrawRequest({
                        drawMode: 'line',
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                });
                lineButton.attr('id', 'line-' + conf.type + "-" + conf.id);
                container.append(lineButton);
            }

            if(typeof conf.area !== 'undefined' && conf.area) {
                areaButton.on('click', function() {
                    var geometry = undefined;
                    if(typeof conf.feature.geometry !== 'undefined') {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    }
                    me.sendDrawRequest({
                        drawMode: 'area',
                        geometry: geometry
                    }, this.id);
                    me.editFeature = conf.feature;
                    if(typeof me.editFeature._type === 'undefined') {
                        me.editFeature._type = conf.type;
                    }
                });
                areaButton.attr('id', 'area-' + conf.type + "-" + conf.id);
                container.append(areaButton);
            }

            selectButton.on('click', function () {
                var currentSelectButton = this;

                var onFinishSelectionCallback = function () {
                    var selectedLayers = me.sandbox.findAllSelectedMapLayers(),
                            geometryFilters = [];
                    //debugger;
                    for (var i = 0; i < selectedLayers.length; i++) {
                        var layer = selectedLayers[i];

                        if (layer.getClickedGeometries !== null && layer.getClickedGeometries !== undefined && layer.getClickedGeometries().length > 0) {

                            if (layer.getClickedGeometries().length > 1) {
                                me.showMessage(me.loc.error, me.loc.selectError);
                            } else {
                                var geometry = layer.getClickedGeometries()[0][1];
                                //check if geometry suits to proper type
                                var wktFormat = new OpenLayers.Format.WKT({});
                                var geojsonFormat = new OpenLayers.Format.GeoJSON({});
                                var feature = wktFormat.read(geometry);
                                var geod = JSON.parse(geojsonFormat.write(feature)).geometry;
                                var isPoint = geojsonFormat.isValidType(geod, 'Point');

                                if ((!me.editFeature._type == 'area' && isPoint) || (me.editFeature._type == 'area' && !isPoint)) {
                                    me._showParameterUpdateDialog(currentSelectButton.id, geod);
                                } else {
                                    //me.showMessage(me.loc.error, 'You selected wrong type of geometry');
                                    me.showMessage(me.loc.error, 'Valittu kohde on väärän tyyppinen');
                                }
                            }
                        }

                    }

                    //FIXME Following is for testing:
                    //debugger;
                    /*var geometry = "MULTIPOLYGON (((397995.2485 6692773.3084, 404040.8453 6693140.8219, 403912.2156 6689281.9302, 407330.0911 6684008.1117, 410564.2098 6674765.1474, 401431.4996 6675022.4069, 403452.8238 6683328.2117, 403599.8292 6685514.917, 403526.3265 6685753.8007, 402240.0293 6685790.5521, 400163.578 6685220.9062, 398895.6565 6687407.6114, 396966.2107 6688510.1519, 395334.031 6690193.8206, 397499.1053 6690182.3383, 398050.3755 6690751.9842, 398087.1268 6691266.5031, 397094.8404 6691597.2652, 397995.2485 6692773.3084)))";
                    var wktFormat = new OpenLayers.Format.WKT({});
                    var geojsonFormat = new OpenLayers.Format.GeoJSON({});
                    var feature = wktFormat.read(geometry);
                    var geod = JSON.parse(geojsonFormat.write(feature)).geometry;
                    var isPoint = geojsonFormat.isValidType(geod, 'Point');

                    if ((!me.editFeature._type == 'area' && isPoint) || (me.editFeature._type == 'area' && !isPoint)) {
                        me._showParameterUpdateDialog(currentSelectButton.id, geod);
                    } else {
                        me.showMessage(me.loc.error, 'You selected wrong type of geometry');
                    }*/
                    
                };
                var popupHandler = Oskari.clazz.create('Oskari.mapframework.bundle.featuredata2.PopupHandler', me);
                popupHandler.showSelectionTools(onFinishSelectionCallback);

                me.editFeature = conf.feature;
                if (typeof me.editFeature._type === 'undefined') {
                    me.editFeature._type = conf.type;
                }
            });
            selectButton.attr('id', 'select-' + conf.type + "-" + conf.id);
            container.append(selectButton);

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

                me._dialog.close(true);
                me._dialog = null;

                me._showParameterUpdateDialog(id, geometry);
            });
            buttons.push(finishBtn);

            var content = me.templates.drawHelper.clone();
            content.find('div.infoText').html(message);

            dialog.show(title, content, buttons);
            dialog.moveTo('div#' + id, 'top');
        },
        
        /**
         * @method _showParameterUpdateDialog
         * Show a dialog to fill proper attributes of the feature
         * @param id DOM element id of the tool button
         * @param geometry new geometry in GeoJson format
         */
        _showParameterUpdateDialog: function(id, geometry) {
            var me = this;

            var locBtns = me.instance.getLocalization('buttons'),
                dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            this._dialog = dialog;

            var buttons = [],
                title = me.loc,
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
                me.edited = true;
                me.editFeature.geometry = JSON.parse(geometry);
                
                if(me.editFeature._type === 'area') {
                    if(typeof me.editFeature.id === 'undefined') {
                        me.itemData.areas.push(me.editFeature)
                    }
                    me.editFeature.name = content.find("#name").val();
                    me.editFeature.municipalityName = content.find("#municipalityName").val();
                    me.editFeature.description = content.find("#description").val();
                    me.editFeature.classification = content.find("#classification").val();
                    me.editFeature.copyright = content.find("#copyright").val();
                    me.editFeature.digiMk = content.find("#digiMk").val();
                    me.editFeature.digiMkYear = content.find("#digiMkYear").val();
                    me.editFeature.digitizationAuthor = content.find("#digitizationAuthor").val();
                    me.editFeature.digitizationDate = content.find("#digitizationDate").val();
                    me.editFeature.areaSelectionType = content.find("#areaSelectionType").val();
                    me.editFeature.areaSelectionSource = content.find("#areaSelectionSource").val();
                    me.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editFeature.surveyingType = content.find("#surveyingType").val();
                } else {
                    me.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editFeature.surveyingType = content.find("#surveyingType").val();
                }
                
                me.editFeature._edited = true;

                me.sendStopDrawRequest(true);
                me._dialog.close(true);
                me._dialog = null;
            });
            buttons.push(finishBtn);

            var content = me.templates.drawHelper.clone();
            content.find('div.infoText').html(me.loc.geometryDetailsInfo);

            if(me.itemData.itemtype === 'AncientMonument') {
                if(me.editFeature._type === 'area') {
                    me._renderAncientMonumentAreaDetails(content);
                } else {
                    me._renderAncientMonumentDetails(content);
                }
            }

            dialog.show(title, content, buttons);
            dialog.moveTo('div#' + id, 'top');
        },
        
        _renderAncientMonumentDetails: function(content) {
            var me = this,
                template = me.templates.ancientMonumentSurveyingDetails.clone();
            template.find("#surveyingAccuracy").val(me.editFeature.surveyingAccuracy);
            template.find("#surveyingType").val(me.editFeature.surveyingType);
            content.append(template);
        },
        
        _renderAncientMonumentAreaDetails: function(content) {
            var me = this,
                template = me.templates.ancientMonumentAreaSurveyingDetails.clone();
            template.find("#name").val(me.editFeature.name);
            template.find("#municipalityName").val(me.editFeature.municipalityName);
            template.find("#description").val(me.editFeature.description);
            template.find("#classification").val(me.editFeature.classification);
            template.find("#copyright").val(me.editFeature.copyright);
            template.find("#digiMk").val(me.editFeature.digiMk);
            template.find("#digiMkYear").val(me.editFeature.digiMkYear);
            template.find("#digitizationAuthor").val(me.editFeature.digitizationAuthor);
            template.find("#digitizationDate").val(me.editFeature.digitizationDate);
            template.find("#areaSelectionType").val(me.editFeature.areaSelectionType);
            template.find("#areaSelectionSource").val(me.editFeature.areaSelectionSource);
            template.find("#surveyingAccuracy").val(me.editFeature.surveyingAccuracy);
            template.find("#surveyingType").val(me.editFeature.surveyingType);
            content.append(template);
        },

        _showCoordinatesPopUp: function () {
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
                        "default": false
                    },
                    {
                        "name": "EPSG:4326",
                        "text": "WGS84 (EPSG:4326)",
                        "definition": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
                        "default": true
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
                    me._addPointFromCoordinates(lon, lat, selectedProjection);
                    me._dialog.close(true);
                    me._dialog = null;
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

        _addPointFromCoordinates: function (lon, lat, crs) {
            var me = this,
                coordinates,
                convertedCoordinates,
                mapModule = me.sandbox.findRegisteredModuleInstance('MainMapModule'),
                currentProjection = mapModule.getProjection(),
                wktFormat = new OpenLayers.Format.WKT({}),
                geojsonFormat = new OpenLayers.Format.GeoJSON({});
                feature = null,


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
            geometry = JSON.parse(geojsonFormat.write(feature)).geometry;
            me.editFeature.geometry = geometry;
            me.editFeature._edited = true;
            me.edited = true;
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
