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
            'buildingHeritage': jQuery('<div id="buildingHeritage"><div id="main"><h3>' + me.loc.main + '</h4></div><div id="sub"><h4>' + me.loc.sub + '</h4></div><div id="area"><h4>' + me.loc.area + '</h4></div></div>'),
            'buildingHeritageMainItem': jQuery('<div class="item buildingHeritageMainItem"><div class="id"/><div class="name"/><div class="municipalityName"/></div>'),
            'buildingHeritagePoint': jQuery('<div class="item buildingHeritagePoint"><div class="id"/><div class="name"/><div class="description"/><div class="conservationGroup"/><div class="conservationStatus"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'buildingHeritageArea': jQuery('<div class="item buildingHeritageAreaItem"><div class="id"/><div class="name"/><div class="description"/><div class="conservationGroup"/><div class="conservationStatus"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'buildingHeritageAreaAdd': jQuery('<div class="item newItem buildingHeritageAreaItem"><h4>' + me.loc.addNew + '</h4><div class="registryItemTools"/></div>'),
            'buildingHeritageSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.name + '</label><input type="text" id="name"></div>'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'
                + '<div><label>' + me.loc.surveyingType + '</label><select id="surveyingType"/></div>'
                + '<div><label>' + me.loc.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div>'
                + '<div><label>' + me.loc.conservationGroup + '</label><input type="text" id="conservationGroup"></div>'
                + '<div><label>' + me.loc.conservationStatus + '</label><input type="text" id="conservationStatus"></div></div>')
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
                subItemRow.find('.name').append(me.editor.formatData(me.loc.name, data.points[i].objectName));
                subItemRow.find('.description').append(me.editor.formatData(me.loc.description, data.points[i].description));
                subItemRow.find('.conservationGroup').append(me.editor.formatData(me.loc.conservationGroup, data.points[i].conservationGroup));
                subItemRow.find('.conservationStatus').append(me.editor.formatData(me.loc.conservationStatus, data.points[i].conservationStatus));
                subItemRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.points[i].surveyingAccuracy]));
                subItemRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.points[i].surveyingType]));
                subItemRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.points[i].modifyDate));
                subItemRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.points[i].createDate));
                subItemRow.find('.author').append(me.editor.formatData(me.loc.author, data.points[i].author));

                subItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i] }));

                //sub.append(subItemRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id + ' / ' + data.points[i].objectName);
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
                areaRow.find('.name').append(me.editor.formatData(me.loc.name, data.areas[i].objectName));
                areaRow.find('.description').append(me.editor.formatData(me.loc.description, data.areas[i].description));
                areaRow.find('.conservationGroup').append(me.editor.formatData(me.loc.conservationGroup, data.areas[i].conservationGroup));
                areaRow.find('.conservationStatus').append(me.editor.formatData(me.loc.conservationStatus, data.areas[i].conservationStatus));
                areaRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValuesArea[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValuesArea[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.areas[i].createDate));
                areaRow.find('.author').append(me.editor.formatData(me.loc.author, data.areas[i].author));

                areaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'sub', feature: data.areas[i] }));

                //area.append(areaRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.areas[i].id + ' / ' + data.areas[i].objectName);
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

        renderUpdateDialogContent: function (attributes, selectedFeature, fields) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                return me._renderBuildingHeritageAreaDetails(attributes, selectedFeature, fields);
            } else {
                return me._renderBuildingHeritageDetails(attributes, selectedFeature, fields);
            }
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.areas.push(me.editor.editFeature);
                }
            }

            me.editor.editFeature.geometry = JSON.parse(geometry);
            me.editor.editFeature.description = content.find("#description").val();
            me.editor.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
            me.editor.editFeature.surveyingType = content.find("#surveyingType").val();
            me.editor.editFeature.conservationStatus = content.find("#conservationStatus").val();
            me.editor.editFeature.conservationGroup = content.find("#conservationGroup").val();
            me.editor.editFeature.objectName = content.find("#name").val();
        },

        preparePostData: function () {
            var me = this,
                edited = { 'id': me.editor.itemData.id, 'edited': me.editor.itemData._edited, 'points': [], 'areas': [] };
                
            $.each(me.editor.itemData.points, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.points.push(item.id);
                }
            });
            $.each(me.editor.itemData.areas, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.areas.push(item.id);
                }
            });
            return { 'registerName': 'buildingHeritage', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited) };
        },

        _renderBuildingHeritageDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.buildingHeritageSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editor.editFeature.description);
            template.find("#name").val(me.editor.editFeature.objectName);
            template.find("#conservationGroup").val(me.editor.editFeature.conservationGroup);
            template.find("#conservationStatus").val(me.editor.editFeature.conservationStatus);
            accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
            typeSelect.val(me.editor.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            return template;
        },

        _renderBuildingHeritageAreaDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.buildingHeritageSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.surveyingAccuracyValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.surveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.surveyingTypeValuesArea, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.surveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editor.editFeature.description);
            template.find("#name").val(me.editor.editFeature.objectName);
            template.find("#conservationGroup").val(me.editor.editFeature.conservationGroup);
            template.find("#conservationStatus").val(me.editor.editFeature.conservationStatus);
            accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
            typeSelect.val(me.editor.editFeature.surveyingType);

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