/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentView
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentView',
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
            'ancientMonument': jQuery('<div id="ancientMonument"><div id="main"><h3>' + me.loc.main + '</h3></div><div id="sub"><h3>' + me.loc.sub + '</h3></div><div id="area"><h3>' + me.loc.area + '</h3></div></div>'),
            'ancientMonumentMainItem': jQuery('<div class="item ancientMonumentMainItem"><div class="id"/><div class="name"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="classification"/><div class="municipalityName"/><div class="url"/><div class="subType"/><div class="createDate"/><div class="modifyDate"/><div class="registryItemTools"/></div>'),
            'ancientMonumentSubItem': jQuery('<div class="item ancientMonumentSubItem"><div class="id"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="registryItemTools"/></div>'),
            'ancientMonumentAreaItem': jQuery('<div class="item ancientMonumentAreaItem"><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="areaSelectionType"/><div class="areaSelectionSource"/><div class="sourceDating"/><div class="digiMk"/><div class="areaChangeReason"/><div class="createDate"/><div class="modifyDate"/><div class="registryItemTools"/></div>'),
            'ancientMonumentAreaItemAdd': jQuery('<div class="item newItem ancientMonumentAreaItem"><h4>' + me.loc.addNew + '</h4><div class="registryItemTools"/></div>'),
            'ancientMonumentSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'
                + '<div><label>' + me.loc.surveyingType + '</label><select id="surveyingType"/></div>'
                + '<div><label>' + me.loc.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>'),
            'ancientMonumentAreaSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'
                + '<div><label>' + me.loc.surveyingTypeArea + '</label><select id="surveyingType"/></label></div>'
                + '<div><label>' + me.loc.surveyingAccuracyArea + '</label><select id="surveyingAccuracy"/></div>'
                + '<div><label>' + me.loc.areaChangeReason + '</label><input type="text" id="areaChangeReason"></div>')
        };
    }, {

        getRegisterName: function () {
            return "ancientMonument";
        },

        render: function (data) {
            var me = this,
                itemDetails = me.templates.ancientMonument.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub"),
                area = itemDetails.find('#area');

            var mainItemRow = me.templates.ancientMonumentMainItem.clone();

            mainItemRow.find('.description').append(me.editor.formatData(me.loc.description, data.description));
            mainItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.id));
            mainItemRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.surveyingAccuracy]));
            mainItemRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.surveyingType]));
            mainItemRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.modifyDate));
            mainItemRow.find('.url').append(me.editor.formatData(me.loc.url, data.nbaUrl));
            mainItemRow.find('.classification').append(me.editor.formatData(me.loc.classification, data.classification));
            mainItemRow.find('.municipalityName').append(me.editor.formatData(me.loc.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me.editor.formatData(me.loc.objectName, data.objectName));
            mainItemRow.find('.subType').append(me.editor.formatData(me.loc.subType, data.subType.join(", ")));
            mainItemRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.createDate));

            mainItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.id, 'type': 'main', feature: data, 'deleteOption': true }));

            main.append(mainItemRow);

            for (var i = 0; i < data.subItems.length; ++i) {
                var subItemRow = me.templates.ancientMonumentSubItem.clone();

                subItemRow.find('.description').append(me.editor.formatData(me.loc.description, data.subItems[i].description));
                subItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.subItems[i].objectId));
                subItemRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.subItems[i].surveyingAccuracy]));
                subItemRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.subItems[i].surveyingType]));

                subItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.subItems[i].objectId, 'type': 'sub', feature: data.subItems[i], 'deleteOption': true }));

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.subItems[i].id + ' / ' + data.subItems[i].objectName);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.open();

                //sub.append(subItemRow);
                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.subItems.length == 0) {
                sub.append(me.editor.templates.noItemsFound.clone());
            }

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.ancientMonumentAreaItem.clone();

                areaRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValuesArea[data.areas[i].surveyingAccuracy]));
                areaRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValuesArea[data.areas[i].surveyingType]));
                areaRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.areaSelectionSource').append(me.editor.formatData(me.loc.areaSelectionSource, data.areas[i].areaSelectionSource));
                areaRow.find('.sourceDating').append(me.editor.formatData(me.loc.sourceDating, data.areas[i].sourceDating));
                areaRow.find('.digiMk').append(me.editor.formatData(me.loc.digiMk, data.areas[i].digiMk));
                areaRow.find('.areaSelectionType').append(me.editor.formatData(me.loc.areaSelectionType, data.areas[i].areaSelectionType));
                areaRow.find('.description').append(me.editor.formatData(me.loc.description, data.areas[i].description));
                areaRow.find('.areaChangeReason').append(me.editor.formatData(me.loc.areaChangeReason, data.areas[i].areaChangeReason));
                areaRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.areas[i].createDate));
                areaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'sub', feature: data.areas[i], 'deleteOption': true }));

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
                area.append(me.editor.templates.noItemsFound.clone());
            }

            var newAreaRow = me.templates.ancientMonumentAreaItemAdd.clone();
            newAreaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': -1, 'type': 'sub', feature: {} }));
            area.append(newAreaRow)

            return itemDetails;
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                return me._renderAncientMonumentAreaDetails(attributes, selectedFeature, fields);
            } else {
                return me._renderAncientMonumentDetails(attributes, selectedFeature, fields);
            }
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.areas.push(me.editor.editFeature);
                }

                me.editor.editFeature.areaChangeReason = content.find("#areaChangeReason").val();
            }

            me.editor.editFeature.geometry = JSON.parse(geometry);
            me.editor.editFeature.description = content.find("#description").val();
            me.editor.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
            me.editor.editFeature.surveyingType = content.find("#surveyingType").val();
        },

        preparePostData: function () {
            var me = this,
                edited = { 'id': me.editor.itemData.id, 'edited': me.editor.itemData._edited, 'subItems': [], 'areas': [] },
                deleted = { 'id': me.editor.itemData.id, 'pointDeleted': me.editor.itemData._pointDeleted, 'subItems': [], 'areas': [] };
                
            $.each(me.editor.itemData.subItems, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.subItems.push(item.id);
                }
                if (item._deleted && item.id != null) {
                    deleted.subItems.push(item.id);
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
            return { 'registerName': 'ancientMonument', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited), 'deleted': JSON.stringify(deleted) };
        },

        _renderAncientMonumentDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.ancientMonumentSurveyingDetails.clone(),
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
            accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
            typeSelect.val(me.editor.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            return template;
        },

        _renderAncientMonumentAreaDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.ancientMonumentAreaSurveyingDetails.clone(),
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
            template.find("#areaChangeReason").val(me.editor.editFeature.areaChangeReason);
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