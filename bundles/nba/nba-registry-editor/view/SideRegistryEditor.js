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
                //Ancient Monument templates
                'ancientMonument': jQuery('<div id="ancientMonument"><div id="main"><h3>' + me.loc.ancientMonument.main + '</h3></div><div id="sub"><h3>' + me.loc.ancientMonument.sub + '</h3></div><div id="area"><h3>' + me.loc.ancientMonument.area + '</h3></div></div>'),
                'ancientMonumentMainItem': jQuery('<div class="item ancientMonumentMainItem"><div class="id"/><div class="name"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="classification"/><div class="municipalityName"/><div class="url"/><div class="subType"/><div class="createDate"/><div class="modifyDate"/><div class="registryItemTools"/></div>'),
                'ancientMonumentSubItem': jQuery('<div class="item ancientMonumentSubItem"><div class="id"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="registryItemTools"/></div>'),
                'ancientMonumentAreaItem': jQuery('<div class="item ancientMonumentAreaItem"><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="areaSelectionType"/><div class="areaSelectionSource"/><div class="sourceDating"/><div class="digiMk"/><div class="areaChangeReason"/><div class="createDate"/><div class="modifyDate"/><div class="registryItemTools"/></div>'),
                'ancientMonumentAreaItemAdd': jQuery('<div class="item newItem ancientMonumentAreaItem"><h4>' + me.loc.ancientMonument.addNew + '</h4><div class="registryItemTools"/></div>'),
                'ancientMonumentSurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.ancientMonument.description + '</label><input type="text" id="description"></div>'
                    + '<div><label>' + me.loc.ancientMonument.surveyingType + '</label><select id="surveyingType"/></div>'
                    + '<div><label>' + me.loc.ancientMonument.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>'),
                'ancientMonumentAreaSurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.ancientMonument.description + '</label><input type="text" id="description"></div>'
                    + '<div><label>' + me.loc.ancientMonument.surveyingTypeArea + '</label><select id="surveyingType"/></label></div>'
                    + '<div><label>' + me.loc.ancientMonument.surveyingAccuracyArea + '</label><select id="surveyingAccuracy"/></div>'
                    + '<div><label>' + me.loc.ancientMonument.areaChangeReason + '</label><input type="text" id="areaChangeReason"></div>'),
                //Ancient Monument Maintenance templates
                'maintenance': jQuery('<div id="maintenance"><div id="main"><h3>' + me.loc.maintenance.main + '</h3></div><div id="sub"><h3>' + me.loc.maintenance.sub + '</h3></div>'),
                'maintenanceMainItem': jQuery('<div class="item maintenanceMainItem">'
                    + '<div class="id"/>'
                    + '<div class="name"/>'
                    + '<div class="municipalityName"/>'
                    + '<div class="subType"/>'
                    + '<div class="maintainingEntity"/>'
                    + '<div class="pointDescription"/>'
                    + '<div class="pointAuthor"/>'
                    + '<div class="pointSurveyingType"/>'
                    + '<div class="pointSurveyingAccuracy"/>'
                    + '<div class="pointCreateDate"/>'
                    + '<div class="areaModifyDate"/>'
                    + '<div class="areaCreateDate"/>'
                    + '<div class="pointModifyDate"/>'
                    + '<div class="registryItemTools"/></div>'),
                'maintenanceSubItem': jQuery('<div class="item maintenanceSubItem"><div class="id"/><div class="createDate"/><div class="modifyDate"/><div class="registryItemTools"/></div>'),
                'maintenanceSurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.maintenance.description + '</label><input type="text" id="description">'
                    + '<div><label>' + me.loc.maintenance.surveyingType + '</label><select id="surveyingType"/></div>'
                    + '<div><label>' + me.loc.maintenance.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>'),
                //Building heritage
                'buildingHeritage': jQuery('<div id="buildingHeritage"><div id="main"><h3>' + me.loc.buildingHeritage.main + '</h4></div><div id="sub"><h4>' + me.loc.buildingHeritage.sub + '</h4></div><div id="area"><h4>' + me.loc.buildingHeritage.area + '</h4></div></div>'),
                'buildingHeritageMainItem': jQuery('<div class="item buildingHeritageMainItem"><div class="id"/><div class="name"/><div class="municipalityName"/></div>'),
                'buildingHeritagePoint': jQuery('<div class="item buildingHeritagePoint"><div class="id"/><div class="name"/><div class="description"/><div class="conservationGroup"/><div class="conservationStatus"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
                'buildingHeritageArea': jQuery('<div class="item buildingHeritageAreaItem"><div class="id"/><div class="name"/><div class="description"/><div class="conservationGroup"/><div class="conservationStatus"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
                'buildingHeritageAreaAdd': jQuery('<div class="item newItem buildingHeritageAreaItem"><h4>' + me.loc.buildingHeritage.addNew + '</h4><div class="registryItemTools"/></div>'),
                'buildingHeritagePointSurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.buildingHeritage.name + '</label><input type="text" id="name"></div>'
                    + '<div><label>' + me.loc.buildingHeritage.description + '</label><input type="text" id="description"></div>'
                    + '<div><label>' + me.loc.buildingHeritage.surveyingType + '</label><select id="surveyingType"/></div>'
                    + '<div><label>' + me.loc.buildingHeritage.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div>'
                    + '<div><label>' + me.loc.buildingHeritage.conservationGroup + '</label><input type="text" id="conservationGroup"></div>'
                    + '<div><label>' + me.loc.buildingHeritage.conservationStatus + '</label><input type="text" id="conservationStatus"></div></div>'),
                'buildingHeritageAreaSurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.buildingHeritage.name + '</label><input type="text" id="name"></div>'
                    + '<div><label>' + me.loc.buildingHeritage.description + '</label><input type="text" id="description"></label></div>'
                    + '<div><label>' + me.loc.buildingHeritage.surveyingType + '</label><select id="surveyingType"/></label></div>'
                    + '<div><label>' + me.loc.buildingHeritage.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></label></div>'
                    + '<div><label>' + me.loc.buildingHeritage.conservationGroup + '</label><input type="text" id="conservationGroup"></label></div>'
                    + '<div><label>' + me.loc.buildingHeritage.conservationStatus + '</label><input type="text" id="conservationStatus"></label></div></div>'),
                //RKY 2000
                'rky2000': jQuery('<div id="rky2000"><div id="main"><h4>' + me.loc.rky2000.main + '</h4></div><div id="point"><h4>' + me.loc.rky2000.point + '</h4></div><div id="area"><h4>' + me.loc.rky2000.area + '</h4></div><div id="line"><h4>' + me.loc.rky2000.line + '</h4></div></div>'),
                'rky2000MainItem': jQuery('<div class="item rky2000MainItem"><div class="id"/></div>'),
                'rky2000Geometry': jQuery('<div class="item rky2000Geometry"><div class="id"/><div class="name"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
                'rky2000GeometryAdd': jQuery('<div class="item newItem rky2000GeometryItem"><h4>' + me.loc.rky2000.addNew + '</h4><div class="registryItemTools"/></div>'),
                'rky2000SurveyingDetails': jQuery('<div class="itemDetails">'
                    + '<div><label>' + me.loc.rky2000.name + '</label><input type="text" id="name"></div>'
                    + '<div><label>' + me.loc.rky2000.description + '</label><input type="text" id="description"></div>'
                    + '<div><label>' + me.loc.rky2000.surveyingType + '</label><select id="surveyingType"/></div>'
                    + '<div><label>' + me.loc.rky2000.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>'),
                //common templates
                'coordinatePopupContent': jQuery('<div class="nba-registry-editor-coordinates-popup-content"><div class="description"></div>' +
                    '<div class="margintop"><div class="floatleft"><select class="srs-select"></select></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lon-input" placeholder="X"></input></div><div class="clear"></div></div>' +
                    '<div class="margintop"><div class="floatleft"><input type="text" class="lat-input" placeholder="Y"></input></div><div class="clear"></div></div>' +
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
                postData = null;
            
            content.find(".content-registry-item").empty();
            me.progressSpinner.insertTo(content.find(".content-registry-item"));
            me.progressSpinner.start();

            if(me.data.itemtype === 'AncientMonument') {
                postData = {'action_route': 'GetRegistryItems', 'registerName': 'ancientMonument', 'id': me.data.id};
            } else if (me.data.itemtype === 'AncientMonumentMaintenanceItem') {
                postData = { 'action_route': 'GetRegistryItems', 'registerName': 'ancientMaintenance', 'id': me.data.id };
            } else if (me.data.itemtype === 'BuildingHeritageItem') {
                postData = { 'action_route': 'GetRegistryItems', 'registerName': 'buildingHeritage', 'id': me.data.id };
            } else if (me.data.itemtype === 'RKY2000') {
                postData = { 'action_route': 'GetRegistryItems', 'registerName': 'rky2000', 'id': me.data.id };
            }

            $.ajax({
                url: me.instance.sandbox.getAjaxUrl(),
                data: postData,
                type: 'GET',
                success: function(data, textStatus, jqXHR) {
                    me.progressSpinner.stop();
                    content.find(".content-registry-item").empty();
                    me.itemData = data;

                    if(data.itemtype === 'AncientMonument') {
                        me._renderAncientMonument(data, content);
                    } else if (data.itemtype === 'AncientMonumentMaintenanceItem') {
                        me._renderMaintenance(data, content);
                    } else if (data.itemtype === 'BuildingHeritageItem') {
                        me._renderBuildingHeritage(data, content);
                    } else if (data.itemtype === 'RKY2000') {
                        me._renderRKY2000(data, content);
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
                noItemsFoundElem = me.templates.noItemsFound.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub"),
                area = itemDetails.find('#area');

            var mainItemRow = me.templates.ancientMonumentMainItem.clone();

            mainItemRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.description));
            mainItemRow.find('.id').append(me._formatData(me.loc.ancientMonument.id, data.id));
            mainItemRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, me.loc.ancientMonument.surveyingAccuracyValues[data.surveyingAccuracy]));
            mainItemRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, me.loc.ancientMonument.surveyingTypeValues[data.surveyingType]));
            mainItemRow.find('.modifyDate').append(me._formatData(me.loc.ancientMonument.modifyDate, data.modifyDate));
            mainItemRow.find('.url').append(me._formatData(me.loc.ancientMonument.url, data.nbaUrl));
            mainItemRow.find('.classification').append(me._formatData(me.loc.ancientMonument.classification, data.classification));
            mainItemRow.find('.municipalityName').append(me._formatData(me.loc.ancientMonument.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me._formatData(me.loc.ancientMonument.objectName, data.objectName));
            mainItemRow.find('.subType').append(me._formatData(me.loc.ancientMonument.subType, data.subType.join(", ")));
            mainItemRow.find('.createDate').append(me._formatData(me.loc.ancientMonument.createDate, data.createDate));

            mainItemRow.find('.registryItemTools').append(me._getEditTools({'point': true, 'id': data.id, 'type': 'main', feature: data}));

            main.append(mainItemRow);

            for(var i = 0; i < data.subItems.length; ++i) {
                var subItemRow = me.templates.ancientMonumentSubItem.clone();

                subItemRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.subItems[i].description));
                subItemRow.find('.id').append(me._formatData(me.loc.ancientMonument.id, data.subItems[i].objectId));
                subItemRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, me.loc.ancientMonument.surveyingAccuracyValues[data.subItems[i].surveyingAccuracy]));
                subItemRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, me.loc.ancientMonument.surveyingTypeValues[data.subItems[i].surveyingType]));

                subItemRow.find('.registryItemTools').append(me._getEditTools({ 'point': true, 'id': data.subItems[i].objectId, 'type': 'sub', feature: data.subItems[i] }));

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.subItems[i].id + ' / ' + data.subItems[i].name);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.open();

                //sub.append(subItemRow);
                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.subItems.length == 0) {
                sub.append(noItemsFoundElem);
            }

            for(var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.ancientMonumentAreaItem.clone();

                areaRow.find('.surveyingAccuracy').append(me._formatData(me.loc.ancientMonument.surveyingAccuracy, me.loc.ancientMonument.surveyingAccuracyValuesArea[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me._formatData(me.loc.ancientMonument.surveyingType, me.loc.ancientMonument.surveyingTypeValuesArea[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me._formatData(me.loc.ancientMonument.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.areaSelectionSource').append(me._formatData(me.loc.ancientMonument.areaSelectionSource, data.areas[i].areaSelectionSource));
                areaRow.find('.sourceDating').append(me._formatData(me.loc.ancientMonument.sourceDating, data.areas[i].sourceDating));
                areaRow.find('.digiMk').append(me._formatData(me.loc.ancientMonument.digiMk, data.areas[i].digiMk));
                areaRow.find('.areaSelectionType').append(me._formatData(me.loc.ancientMonument.areaSelectionType, data.areas[i].areaSelectionType));
                areaRow.find('.description').append(me._formatData(me.loc.ancientMonument.description, data.areas[i].description));
                areaRow.find('.areaChangeReason').append(me._formatData(me.loc.ancientMonument.areaChangeReason, data.areas[i].areaChangeReason));
                areaRow.find('.createDate').append(me._formatData(me.loc.ancientMonument.createDate, data.areas[i].createDate));
                areaRow.find('.registryItemTools').append(me._getEditTools({'area': true, 'id': data.areas[i].id, 'type': 'area', feature: data.areas[i]}));

                //area.append(areaRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.areas[i].id + ' / ' + data.areas[i].name);
                panel.setContent(areaRow);
                panel.setVisible(true);
                panel.close();

                areaAccordion.addPanel(panel);
            }

            areaAccordion.insertTo(area);

            if (data.areas.length == 0) {
                area.append(noItemsFoundElem);
            }
            
            var newAreaRow = me.templates.ancientMonumentAreaItemAdd.clone();
            newAreaRow.find('.registryItemTools').append(me._getEditTools({'area': true, 'id': -1, 'type': 'area', feature: {}}));
            area.append(newAreaRow)
            
            content.find(".content-registry-item").append(itemDetails);
        },

        _renderMaintenance: function (data, content) {
            var me = this,
                itemDetails = me.templates.maintenance.clone(),
                noItemsFoundElem = me.templates.noItemsFound.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub");

            var mainItemRow = me.templates.maintenanceMainItem.clone();

            mainItemRow.find('.id').append(me._formatData(me.loc.maintenance.id, data.id));
            mainItemRow.find('.name').append(me._formatData(me.loc.maintenance.objectName, data.objectName));
            mainItemRow.find('.municipalityName').append(me._formatData(me.loc.maintenance.municipalityName, data.municipalityName));
            mainItemRow.find('.subType').append(me._formatData(me.loc.maintenance.subType, data.subType));
            mainItemRow.find('.maintainingEntity').append(me._formatData(me.loc.maintenance.maintainingEntity, data.maintainingEntity));
            mainItemRow.find('.pointDescription').append(me._formatData(me.loc.maintenance.pointDescription, data.pointDescription));
            mainItemRow.find('.pointAuthor').append(me._formatData(me.loc.maintenance.pointAuthor, data.pointAuthor));
            mainItemRow.find('.pointCreateDate').append(me._formatData(me.loc.maintenance.pointCreateDate, data.pointCreateDate));
            mainItemRow.find('.pointModifyDate').append(me._formatData(me.loc.maintenance.pointModifyDate, data.pointModifyDate));
            mainItemRow.find('.pointSurveyingAccuracy').append(me._formatData(me.loc.maintenance.pointSurveyingAccuracy, data.pointSurveyingAccuracy));
            mainItemRow.find('.pointSurveyingType').append(me._formatData(me.loc.maintenance.pointSurveyingType, data.pointSurveyingType));
            mainItemRow.find('.areaCreateDate').append(me._formatData(me.loc.maintenance.areaCreateDate, data.areaCreateDate));
            mainItemRow.find('.areaModifyDate').append(me._formatData(me.loc.maintenance.areaModifyDate, data.areaModifyDate));

            mainItemRow.find('.registryItemTools').append(me._getEditTools({ 'point': true, 'area': true, 'id': data.id, 'type': 'main', feature: data }));

            main.append(mainItemRow);

            for (var i = 0; i < data.subAreas.length; ++i) {
                var subItemRow = me.templates.maintenanceSubItem.clone();

                subItemRow.find('.id').append(me._formatData(me.loc.maintenance.id, data.subAreas[i].objectId));
                subItemRow.find('.createDate').append(me._formatData(me.loc.maintenance.createDate, data.subAreas[i].createDate));
                subItemRow.find('.modifyDate').append(me._formatData(me.loc.maintenance.modifyDate, data.subAreas[i].modifyDate));

                subItemRow.find('.registryItemTools').append(me._getEditTools({ 'area': true, 'id': data.subAreas[i].objectId, 'type': 'sub', feature: data.subAreas[i] }));

                //sub.append(subItemRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.subAreas[i].id + ' / ' + data.subAreas[i].name);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.close();

                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.subAreas.length == 0) {
                sub.append(noItemsFoundElem);
            }

            content.find(".content-registry-item").append(itemDetails);
        },

        _renderBuildingHeritage: function (data, content) {
            var me = this,
                itemDetails = me.templates.buildingHeritage.clone(),
                noItemsFoundElem = me.templates.noItemsFound.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub"),
                area = itemDetails.find('#area');

            var mainItemRow = me.templates.buildingHeritageMainItem.clone();

            mainItemRow.find('.id').append(me._formatData(me.loc.buildingHeritage.id, data.id));
            mainItemRow.find('.municipalityName').append(me._formatData(me.loc.buildingHeritage.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me._formatData(me.loc.buildingHeritage.objectName, data.objectName));

            main.append(mainItemRow);

            for (var i = 0; i < data.points.length; ++i) {
                var subItemRow = me.templates.buildingHeritagePoint.clone();

                subItemRow.find('.id').append(me._formatData(me.loc.buildingHeritage.id, data.points[i].objectId));
                subItemRow.find('.name').append(me._formatData(me.loc.buildingHeritage.name, data.points[i].objectName));
                subItemRow.find('.description').append(me._formatData(me.loc.buildingHeritage.description, data.points[i].description));
                subItemRow.find('.conservationGroup').append(me._formatData(me.loc.buildingHeritage.conservationGroup, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].conservationGroup]));
                subItemRow.find('.conservationStatus').append(me._formatData(me.loc.buildingHeritage.conservationStatus, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].conservationStatus]));
                subItemRow.find('.surveyingAccuracy').append(me._formatData(me.loc.buildingHeritage.surveyingAccuracy, me.loc.buildingHeritage.surveyingAccuracyValues[data.points[i].surveyingAccuracy]));
                subItemRow.find('.surveyingType').append(me._formatData(me.loc.buildingHeritage.surveyingType, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].surveyingType]));
                subItemRow.find('.modifyDate').append(me._formatData(me.loc.buildingHeritage.modifyDate, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].modifyDate]));
                subItemRow.find('.createDate').append(me._formatData(me.loc.buildingHeritage.createDate, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].createDate]));
                subItemRow.find('.author').append(me._formatData(me.loc.buildingHeritage.author, me.loc.buildingHeritage.surveyingTypeValues[data.points[i].author]));

                subItemRow.find('.registryItemTools').append(me._getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i] }));

                //sub.append(subItemRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id + ' / ' + data.points[i].name);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.close();

                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.points.length == 0) {
                sub.append(noItemsFoundElem);
            }

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.buildingHeritageArea.clone();

                areaRow.find('.id').append(me._formatData(me.loc.buildingHeritage.id, data.areas[i].objectId));
                areaRow.find('.name').append(me._formatData(me.loc.buildingHeritage.name, data.areas[i].objectName));
                areaRow.find('.description').append(me._formatData(me.loc.buildingHeritage.description, data.areas[i].description));
                areaRow.find('.conservationGroup').append(me._formatData(me.loc.buildingHeritage.conservationGroup, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].conservationGroup]));
                areaRow.find('.conservationStatus').append(me._formatData(me.loc.buildingHeritage.conservationStatus, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].conservationStatus]));
                areaRow.find('.surveyingAccuracy').append(me._formatData(me.loc.buildingHeritage.surveyingAccuracy, me.loc.buildingHeritage.surveyingAccuracyValues[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me._formatData(me.loc.buildingHeritage.surveyingType, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me._formatData(me.loc.buildingHeritage.modifyDate, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].modifyDate]));
                areaRow.find('.createDate').append(me._formatData(me.loc.buildingHeritage.createDate, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].createDate]));
                areaRow.find('.author').append(me._formatData(me.loc.buildingHeritage.author, me.loc.buildingHeritage.surveyingTypeValues[data.areas[i].author]));

                areaRow.find('.registryItemTools').append(me._getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'area', feature: data.areas[i] }));

                //area.append(areaRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.areas[i].id + ' / ' + data.areas[i].name);
                panel.setContent(areaRow);
                panel.setVisible(true);
                panel.close();

                areaAccordion.addPanel(panel);
            }

            areaAccordion.insertTo(area);

            if (data.areas.length == 0) {
                area.append(noItemsFoundElem);
            }

            var newAreaRow = me.templates.buildingHeritageAreaAdd.clone();
            newAreaRow.find('.registryItemTools').append(me._getEditTools({ 'area': true, 'id': -1, 'type': 'area', feature: {} }));
            area.append(newAreaRow)

            content.find(".content-registry-item").append(itemDetails);
        },

        _renderRKY2000: function (data, content) {
            var me = this,
                itemDetails = me.templates.rky2000.clone(),
                noItemsFoundElem = me.templates.noItemsFound.clone(),
                pointAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                lineAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                point = itemDetails.find("#point"),
                area = itemDetails.find('#area'),
                line = itemDetails.find('#line');

            var mainItemRow = me.templates.rky2000MainItem.clone();

            mainItemRow.find('.id').append(me._formatData(me.loc.rky2000.id, data.id));

            main.append(mainItemRow);

            for (var i = 0; i < data.points.length; ++i) {
                var pointRow = me.templates.rky2000Geometry.clone();

                pointRow.find('.id').append(me._formatData(me.loc.rky2000.id, data.points[i].objectId));
                pointRow.find('.name').append(me._formatData(me.loc.rky2000.name, data.points[i].objectName));
                pointRow.find('.description').append(me._formatData(me.loc.rky2000.description, data.points[i].description));
                pointRow.find('.surveyingAccuracy').append(me._formatData(me.loc.rky2000.surveyingAccuracy, me.loc.rky2000.surveyingAccuracyValues[data.points[i].surveyingAccuracy]));
                pointRow.find('.surveyingType').append(me._formatData(me.loc.rky2000.surveyingType, me.loc.rky2000.surveyingTypeValues[data.points[i].surveyingType]));
                pointRow.find('.modifyDate').append(me._formatData(me.loc.rky2000.modifyDate, me.loc.rky2000.surveyingTypeValues[data.points[i].modifyDate]));
                pointRow.find('.createDate').append(me._formatData(me.loc.rky2000.createDate, me.loc.rky2000.surveyingTypeValues[data.points[i].createDate]));
                pointRow.find('.author').append(me._formatData(me.loc.rky2000.author, me.loc.rky2000.surveyingTypeValues[data.points[i].author]));

                pointRow.find('.registryItemTools').append(me._getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i] }));

                //point.append(pointRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id + ' / ' + data.points[i].name);
                panel.setContent(pointRow);
                panel.setVisible(true);
                panel.close();

                pointAccordion.addPanel(panel);
            }

            pointAccordion.insertTo(point);

            if (data.points.length == 0) {
                point.append(noItemsFoundElem);
            }

            var newPointRow = me.templates.rky2000GeometryAdd.clone();
            newPointRow.find('.registryItemTools').append(me._getEditTools({ 'point': true, 'id': -1, 'type': 'point', feature: {} }));
            point.append(newPointRow)

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.rky2000Geometry.clone();

                areaRow.find('.id').append(me._formatData(me.loc.rky2000.id, data.areas[i].objectId));
                areaRow.find('.name').append(me._formatData(me.loc.rky2000.name, data.areas[i].objectName));
                areaRow.find('.description').append(me._formatData(me.loc.rky2000.description, data.areas[i].description));
                areaRow.find('.surveyingAccuracy').append(me._formatData(me.loc.rky2000.surveyingAccuracy, me.loc.rky2000.surveyingAccuracyValues[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me._formatData(me.loc.rky2000.surveyingType, me.loc.rky2000.surveyingTypeValues[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me._formatData(me.loc.rky2000.modifyDate, me.loc.rky2000.surveyingTypeValues[data.areas[i].modifyDate]));
                areaRow.find('.createDate').append(me._formatData(me.loc.rky2000.createDate, me.loc.rky2000.surveyingTypeValues[data.areas[i].createDate]));
                areaRow.find('.author').append(me._formatData(me.loc.rky2000.author, me.loc.rky2000.surveyingTypeValues[data.areas[i].author]));

                areaRow.find('.registryItemTools').append(me._getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'area', feature: data.areas[i] }));

                //area.append(areaRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.areas[i].id + ' / ' + data.areas[i].name);
                panel.setContent(areaRow);
                panel.setVisible(true);
                panel.close();

                areaAccordion.addPanel(panel);
            }

            areaAccordion.insertTo(area);

            if (data.areas.length == 0) {
                area.append(noItemsFoundElem);
            }

            var newAreaRow = me.templates.rky2000GeometryAdd.clone();
            newAreaRow.find('.registryItemTools').append(me._getEditTools({ 'area': true, 'id': -1, 'type': 'area', feature: {} }));
            area.append(newAreaRow)

            for (var i = 0; i < data.lines.length; ++i) {
                var lineRow = me.templates.rky2000Geometry.clone();

                lineRow.find('.id').append(me._formatData(me.loc.rky2000.id, data.lines[i].objectId));
                lineRow.find('.name').append(me._formatData(me.loc.rky2000.name, data.lines[i].objectName));
                lineRow.find('.description').append(me._formatData(me.loc.rky2000.description, data.lines[i].description));
                lineRow.find('.surveyingAccuracy').append(me._formatData(me.loc.rky2000.surveyingAccuracy, me.loc.rky2000.surveyingAccuracyValues[data.lines[i].surveyingAccuracy]));
                lineRow.find('.surveyingType').append(me._formatData(me.loc.rky2000.surveyingType, me.loc.rky2000.surveyingTypeValues[data.lines[i].surveyingType]));
                lineRow.find('.modifyDate').append(me._formatData(me.loc.rky2000.modifyDate, me.loc.rky2000.surveyingTypeValues[data.lines[i].modifyDate]));
                lineRow.find('.createDate').append(me._formatData(me.loc.rky2000.createDate, me.loc.rky2000.surveyingTypeValues[data.lines[i].createDate]));
                lineRow.find('.author').append(me._formatData(me.loc.rky2000.author, me.loc.rky2000.surveyingTypeValues[data.lines[i].author]));

                lineRow.find('.registryItemTools').append(me._getEditTools({ 'line': true, 'id': data.lines[i].id, 'type': 'line', feature: data.lines[i] }));

                //line.append(lineRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.lines[i].id + ' / ' + data.lines[i].name);
                panel.setContent(lineRow);
                panel.setVisible(true);
                panel.close();

                lineAccordion.addPanel(panel);
            }

            lineAccordion.insertTo(line);

            if (data.lines.length == 0) {
                line.append(noItemsFoundElem);
            }

            var newLineRow = me.templates.rky2000GeometryAdd.clone();
            newLineRow.find('.registryItemTools').append(me._getEditTools({ 'line': true, 'id': -1, 'type': 'line', feature: {} }));
            line.append(newLineRow)

            content.find(".content-registry-item").append(itemDetails);
        },

        _formatData: function(label, data) {
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

        _getEditTools: function(conf) {
            var me = this,
                container = jQuery('<div class=toolrow></div>'),
                locBtns = me.instance.getLocalization('buttons'),
                /*pointButton = $("<div />").addClass('add-point tool'),
                pointXYButton = $("<div />").addClass('add-point-xy tool'),
                lineButton = $("<div />").addClass('add-line tool'),
                areaButton = $("<div />").addClass('add-area tool'),
                selectButton = $("<div />").addClass('tool-feature-selection tool');*/

                pointButton = $('<button type="button">' + locBtns.addNewPoint + '</button>').addClass('registryItemActionButton'),
                pointXYButton = $('<button type="button">' + locBtns.createWithXY + '</button>').addClass('registryItemActionButton'),
                lineButton = $('<button type="button">' + locBtns.addNewLine + '</button>').addClass('registryItemActionButton'),
                areaButton = $('<button type="button">' + locBtns.addNewArea + '</button>').addClass('registryItemActionButton'),
                selectButton = $('<button type="button">' + locBtns.copyGeometry + '</button>').addClass('registryItemActionButton');

                

            if(typeof conf.point !== 'undefined' && conf.point) {
                pointButton.on('click', function() {
                    var geometry = undefined;
                    if(conf.feature.geometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    } else if (conf.feature.pointGeometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.pointGeometry).clone();
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
                if (conf.feature.geometry != null) {
                    pointButton.html(locBtns.editGeometry);
                }
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
                if (conf.feature.geometry != null) {
                    lineButton.html(locBtns.editGeometry);
                }
                container.append(lineButton);
            }

            if(typeof conf.area !== 'undefined' && conf.area) {
                areaButton.on('click', function() {
                    var geometry = undefined;
                    if(conf.feature.geometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.geometry).clone();
                    } else if (conf.feature.areaGeometry != null) {
                        geometry = (new OpenLayers.Format.GeoJSON()).parseGeometry(conf.feature.areaGeometry).clone();
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
                if (conf.feature.geometry != null) {
                    areaButton.html(locBtns.editGeometry);
                }
                container.append(areaButton);
            }

            selectButton.on('click', function () {
                var currentSelectButton = this;

                var onFinishSelectionCallback = function () {
                    var selectedLayers = me.sandbox.findAllSelectedMapLayers(),
                            geometryFilters = [];
                    
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

                                if ((me.editFeature._type != 'area' && isPoint) || (me.editFeature._type == 'area' && !isPoint)) {

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

                                    me._showParameterUpdateDialog(currentSelectButton.id, JSON.stringify(geod), attributes, selectedFeature, fields);
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
                
                if (me.itemData.itemtype === 'AncientMonument') {
                    if (me.editFeature._type === 'area') {
                        if (typeof me.editFeature.id === 'undefined') {
                            me.itemData.areas.push(me.editFeature)
                        }

                        me.editFeature.areaChangeReason = content.find("#areaChangeReason").val();
                    }

                    me.editFeature.geometry = JSON.parse(geometry);
                    me.editFeature.description = content.find("#description").val();
                    me.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editFeature.surveyingType = content.find("#surveyingType").val();
                
                } else if (me.itemData.itemtype === 'AncientMonumentMaintenanceItem') {

                    if (geometry != null) {
                        if (JSON.parse(geometry).type == 'Point' || JSON.parse(geometry).type == 'MultiPoint') {
                            me.editFeature.pointGeometry = JSON.parse(geometry);
                            me.editFeature.pointDescription = content.find("#description").val();
                            me.editFeature.pointSurveyingAccuracy = content.find("#surveyingAccuracy").val();
                            me.editFeature.pointSurveyingType = content.find("#surveyingType").val();
                        } else {
                            me.editFeature.areaGeometry = JSON.parse(geometry);
                        }
                    }

                } else if (me.itemData.itemtype === 'BuildingHeritageItem') {
                    if (me.editFeature._type === 'area') {
                        if (typeof me.editFeature.id === 'undefined') {
                            me.itemData.areas.push(me.editFeature)
                        }
                    }

                    me.editFeature.geometry = JSON.parse(geometry);
                    me.editFeature.description = content.find("#description").val();
                    me.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editFeature.surveyingType = content.find("#surveyingType").val();
                    me.editFeature.conservationStatus = content.find("#conservationStatus").val();
                    me.editFeature.conservationGroup = content.find("#conservationGroup").val();
                    me.editFeature.objectName = content.find("#name").val();

                } else if (me.itemData.itemtype === 'RKY2000') {
                    if (me.editFeature._type === 'point') {
                        if (typeof me.editFeature.id === 'undefined') {
                            me.itemData.points.push(me.editFeature)
                        }
                    }
                    if (me.editFeature._type === 'area') {
                        if (typeof me.editFeature.id === 'undefined') {
                            me.itemData.areas.push(me.editFeature)
                        }
                    }
                    if (me.editFeature._type === 'line') {
                        if (typeof me.editFeature.id === 'undefined') {
                            me.itemData.lines.push(me.editFeature)
                        }
                    }

                    me.editFeature.geometry = JSON.parse(geometry);
                    me.editFeature.description = content.find("#description").val();
                    me.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editFeature.surveyingType = content.find("#surveyingType").val();
                    me.editFeature.objectName = content.find("#name").val();
                }

                me.editFeature._edited = true;

                me.sendStopDrawRequest(true);
                me._dialog.close(true);
                me._dialog = null;

                me._saveRegistryItem();
            });
            buttons.push(finishBtn);

            var content = me.templates.drawHelper.clone();
            content.find('div.infoText').html(me.loc.geometryDetailsInfo);

            if(me.itemData.itemtype === 'AncientMonument') {
                if(me.editFeature._type === 'area') {
                    me._renderAncientMonumentAreaDetails(content, attributes, selectedFeature, fields);
                } else {
                    me._renderAncientMonumentDetails(content, attributes, selectedFeature, fields);
                }
            } else if (me.itemData.itemtype === 'AncientMonumentMaintenanceItem') {
                if (me.editFeature._type === 'main') {
                    me._renderMaintenanceDetails(content, attributes, selectedFeature, fields);
                }
            } else if (me.itemData.itemtype === 'BuildingHeritageItem') {
                if (me.editFeature._type === 'area') {
                    me._renderBuildingHeritageAreaDetails(content, attributes, selectedFeature, fields);
                } else {
                    me._renderBuildingHeritageDetails(content, attributes, selectedFeature, fields);
                }
            } else if (me.itemData.itemtype === 'RKY2000') {
                me._renderRKY2000SurveyingDetails(content, attributes, selectedFeature, fields);
            }

            dialog.show(title, content, buttons);
            dialog.moveTo('div#' + id, 'top');
        },

        _saveRegistryItem: function () {
            var me = this;

            if (me.edited) {
                var postData = null;
                if (me.data.itemtype === 'AncientMonument') {
                    var edited = { 'id': me.itemData.id, 'edited': me.itemData._edited, 'subItems': [], 'areas': [] };
                    $.each(me.itemData.subItems, function (index, item) {
                        if (item._edited) {
                            edited.subItems.push(item.id);
                        }
                    });
                    $.each(me.itemData.areas, function (index, item) {
                        if (item._edited) {
                            edited.areas.push(item.id);
                        }
                    });
                    postData = { 'registerName': 'ancientMonument', 'item': JSON.stringify(me.itemData), 'edited': JSON.stringify(edited) };
                }
                $.ajax({
                    url: me.instance.sandbox.getAjaxUrl() + "action_route=UpdateRegistryItems",
                    data: postData,
                    type: 'POST',
                    success: function (data, textStatus, jqXHR) {
                        if (data.updated) {
                            me._refreshData(me.data.id);
                            me.showMessage(me.loc.success, me.loc.featureUpdated);
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
                me.showMessage(me.loc.error, me.loc.noEditsDone);
            }
        },
        
        _renderAncientMonumentDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.ancientMonumentSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");
            
            $.each(me.loc.ancientMonument.surveyingAccuracyValues, function(key, value) {
               var option = jQuery('<option/>');
               option.attr({ 'value': key }).text(value);
               if(value === me.editFeature.surveyingAccuracy) {
                   option.prop('selected', true);
               }
               accuracySelect.append(option);
            });
            
            $.each(me.loc.ancientMonument.surveyingTypeValues, function(key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if(value === me.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
             });

            template.find("#description").val(me.editFeature.description);
            accuracySelect.val(me.editFeature.surveyingAccuracy);
            typeSelect.val(me.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },
        
        _renderAncientMonumentAreaDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.ancientMonumentAreaSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");
            
            $.each(me.loc.ancientMonument.surveyingAccuracyValuesArea, function(key, value) {
               var option = jQuery('<option/>');
               option.attr({ 'value': key }).text(value);
               if(value === me.editFeature.surveyingAccuracy) {
                   option.prop('selected', true);
               }
               accuracySelect.append(option);
            });
            
            $.each(me.loc.ancientMonument.surveyingTypeValuesArea, function(key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if(value === me.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
             });

            template.find("#description").val(me.editFeature.description);
            accuracySelect.val(me.editFeature.surveyingAccuracy);
            typeSelect.val(me.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },

        _renderMaintenanceDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.maintenanceSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");
            
            $.each(me.loc.maintenance.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.pointSurveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });
            
            $.each(me.loc.maintenance.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.pointSurveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editFeature.pointDescription);
            accuracySelect.val(me.editFeature.pointSurveyingAccuracy);
            typeSelect.val(me.editFeature.pointSurveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },

        _renderBuildingHeritageDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.buildingHeritageSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.buildingHeritage.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.buildingHeritage.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editFeature.description);
            accuracySelect.val(me.editFeature.surveyingAccuracy);
            typeSelect.val(me.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },

        _renderBuildingHeritageAreaDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.buildingHeritageAreaSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.buildingHeritage.surveyingAccuracyValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.buildingHeritage.surveyingTypeValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editFeature.description);
            accuracySelect.val(me.editFeature.surveyingAccuracy);
            typeSelect.val(me.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },

        _renderRKY2000SurveyingDetails: function (content, attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.rky2000SurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.rky2000.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.rky2000.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editFeature.description);
            template.find("#name").val(me.editFeature.name);
            accuracySelect.val(me.editFeature.surveyingAccuracy);
            typeSelect.val(me.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me._addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            content.append(template);
        },

        _addDropdownsToTemplate: function (template, attributes, selectedFeature, fields) {
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
