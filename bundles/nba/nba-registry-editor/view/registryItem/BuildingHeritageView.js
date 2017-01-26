/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.BuildingHeritageView
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.BuildingHeritageView',
    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.nba.bundle.nba-registry-editor.view.SideRegistryEditor} editor
     * Reference to component that created this view
     * @param {Object} loc
     * Localization data in JSON format
     */
    function (editor, loc) {
        var me = this;
        me.editor = editor;
        me.loc = loc;
        me.templates = {
            'buildingHeritage': jQuery('<div id="buildingHeritage"><div id="main"><h3>' + me.loc.main + '</h4></div><div id="sub"><h4>' + me.loc.buildings + '</h4></div><div id="area"><h4>' + me.loc.area + '</h4></div></div>'),
            'buildingHeritageMainItem': jQuery('<div class="item buildingHeritageMainItem"><div class="id"/><div class="name"/><div class="municipalityName"/></div>'),
            'buildingHeritagePoint': jQuery('<div class="item buildingHeritagePoint"><div class="id"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'buildingHeritageArea': jQuery('<div class="item buildingHeritageAreaItem"><div class="id"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'buildingHeritageAreaAdd': jQuery('<div class="item newItem buildingHeritageAreaItem"><h4>' + me.loc.addNew + '</h4><div class="registryItemTools"/></div>'),
            'buildingHeritageSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"/></div>'
                + '<div><label>' + me.loc.conservationId + '</label><input type="text" id="conservationId"/></div>'
                + '<div><label>' + me.loc.surveyingType + '</label><select id="surveyingType"/></div>'
                + '<div><label>' + me.loc.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>')
        };
    }, {
        
        getRegisterName: function () {
            return "buildingHeritage";
        },

        render: function (data) {
            var me = this,
                itemDetails = me.templates.buildingHeritage.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub"),
                area = itemDetails.find('#area');

            var mainItemRow = me.templates.buildingHeritageMainItem.clone();

            mainItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.id));
            mainItemRow.find('.municipalityName').append(me.editor.formatData(me.loc.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me.editor.formatData(me.loc.objectName, data.objectName));

            main.append(mainItemRow);

            for (var i = 0; i < data.points.length; ++i) {
                var subItemRow = me.templates.buildingHeritagePoint.clone();

                subItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.points[i].objectId));
                subItemRow.find('.description').append(me.editor.formatData(me.loc.description, data.points[i].description));
                subItemRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.points[i].surveyingAccuracy]));
                subItemRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.points[i].surveyingType]));
                subItemRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.points[i].modifyDate));
                subItemRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.points[i].createDate));
                subItemRow.find('.author').append(me.editor.formatData(me.loc.author, data.points[i].author));

                subItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i], 'deleteOption': true }));

                //sub.append(subItemRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.close();

                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.points.length == 0) {
                sub.append(me.editor.templates.noItemsFound.clone());
            }

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.buildingHeritageArea.clone();

                areaRow.find('.id').append(me.editor.formatData(me.loc.id, data.areas[i].objectId));
                areaRow.find('.description').append(me.editor.formatData(me.loc.description, data.areas[i].description));
                areaRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValuesArea[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValuesArea[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.areas[i].createDate));
                areaRow.find('.author').append(me.editor.formatData(me.loc.author, data.areas[i].author));

                areaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'sub', feature: data.areas[i], 'deleteOption': true }));

                //area.append(areaRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.areas[i].id);
                panel.setContent(areaRow);
                panel.setVisible(true);
                panel.close();

                areaAccordion.addPanel(panel);
            }

            areaAccordion.insertTo(area);

            if (data.areas.length == 0) {
                area.append(me.editor.templates.noItemsFound.clone());
            }

            var newAreaRow = me.templates.buildingHeritageAreaAdd.clone();
            newAreaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': -1, 'type': 'sub', feature: {} }));
            area.append(newAreaRow)

            return itemDetails;
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields, defaults) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                return me._renderBuildingHeritageAreaDetails(attributes, selectedFeature, fields, defaults);
            } else {
                return me._renderBuildingHeritageDetails(attributes, selectedFeature, fields, defaults);
            }
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.areas.push(me.editor.editFeature);
                }
                me.editor.editFeature.conservationId = content.find("#conservationId").val();
            }

            me.editor.editFeature.geometry = JSON.parse(geometry);
            me.editor.editFeature.description = content.find("#description").val();
            me.editor.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
            me.editor.editFeature.surveyingType = content.find("#surveyingType").val();
        },

        preparePostData: function () {
            var me = this,
                edited = { 'id': me.editor.itemData.id, 'edited': me.editor.itemData._edited, 'points': [], 'areas': [] },
                deleted = { 'id': me.editor.itemData.id, 'points': [], 'areas': [] };
                
            $.each(me.editor.itemData.points, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.points.push(item.id);
                }
                if (item._deleted && item.id != null) {
                    deleted.points.push(item.id);
                }
            });
            $.each(me.editor.itemData.areas, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.areas.push(item.id);
                }
                if (item._deleted && item.id != null) {
                    deleted.areas.push(item.id);
                }
            });
            return { 'registerName': 'buildingHeritage', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited), 'deleted': JSON.stringify(deleted) };
        },

        _renderBuildingHeritageDetails: function (attributes, selectedFeature, fields, defaults) {
            var me = this,
                template = me.templates.buildingHeritageSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            template.find("#conservationId").parent().remove();

            $.each(me.loc.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (defaults != null && defaults.surveyingAccuracy != null && value === defaults.surveyingAccuracy) {
                    option.prop('selected', true);
                } else if (value === me.editor.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (defaults != null && defaults.surveyingType != null && value === defaults.surveyingType) {
                    option.prop('selected', true);
                } else if (value === me.editor.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });
            if (defaults == null) {
                template.find("#description").val(me.editor.editFeature.description);
                accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
                typeSelect.val(me.editor.editFeature.surveyingType);
            }

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            return template;
        },

        _renderBuildingHeritageAreaDetails: function (attributes, selectedFeature, fields, defaults) {
            var me = this,
                template = me.templates.buildingHeritageSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType"),
                conservationIdInput = template.find("#conservationId");

            $.each(me.loc.surveyingAccuracyValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (defaults != null && defaults.surveyingAccuracy != null && value === defaults.surveyingAccuracy) {
                    option.prop('selected', true);
                } else if (value === me.editor.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });
            
            $.each(me.loc.surveyingTypeValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (defaults != null && defaults.surveyingType != null && value === defaults.surveyingType) {
                    option.prop('selected', true);
                } else if (value === me.editor.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });
            if (defaults == null) {
                template.find("#description").val(me.editor.editFeature.description);
                accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
                typeSelect.val(me.editor.editFeature.surveyingType);
                conservationIdInput.val(me.editor.editFeature.conservationId);
            }

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            return template;
        }
    },
    {
        // a list of protocols this class implements
        "protocol": ['Oskari.nba.bundle.nba-registry-editor.view.RegistryItemViewProtocol']
    }
);