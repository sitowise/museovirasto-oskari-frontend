/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentMaintenanceView
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.AncientMonumentMaintenanceView',
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
            //Ancient Monument Maintenance templates
            'maintenance': jQuery('<div id="maintenance"><div id="main"><h3>' + me.loc.main + '</h3></div><div id="sub"><h3>' + me.loc.sub + '</h3></div>'),
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
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'
                + '<div><label>' + me.loc.surveyingType + '</label><select id="surveyingType"/></div>'
                + '<div><label>' + me.loc.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>')
        };
    }, {

        getRegisterName: function () {
            return "ancientMaintenance";
        },

        render: function (data) {
            var me = this,
                itemDetails = me.templates.maintenance.clone(),
                subAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                sub = itemDetails.find("#sub");

            var mainItemRow = me.templates.maintenanceMainItem.clone();

            mainItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.id));
            mainItemRow.find('.name').append(me.editor.formatData(me.loc.objectName, data.objectName));
            mainItemRow.find('.municipalityName').append(me.editor.formatData(me.loc.municipalityName, data.municipalityName));
            mainItemRow.find('.subType').append(me.editor.formatData(me.loc.subType, data.subType));
            mainItemRow.find('.maintainingEntity').append(me.editor.formatData(me.loc.maintainingEntity, data.maintainingEntity));
            mainItemRow.find('.pointDescription').append(me.editor.formatData(me.loc.pointDescription, data.pointDescription));
            mainItemRow.find('.pointAuthor').append(me.editor.formatData(me.loc.pointAuthor, data.pointAuthor));
            mainItemRow.find('.pointCreateDate').append(me.editor.formatData(me.loc.pointCreateDate, data.pointCreateDate));
            mainItemRow.find('.pointModifyDate').append(me.editor.formatData(me.loc.pointModifyDate, data.pointModifyDate));
            mainItemRow.find('.pointSurveyingAccuracy').append(me.editor.formatData(me.loc.pointSurveyingAccuracy, me.loc.surveyingAccuracyValues[data.pointSurveyingAccuracy]));
            mainItemRow.find('.pointSurveyingType').append(me.editor.formatData(me.loc.pointSurveyingType, me.loc.surveyingTypeValues[data.pointSurveyingType]));
            mainItemRow.find('.areaAuthor').append(me.editor.formatData(me.loc.areaAuthor, data.areaAuthor));
            mainItemRow.find('.areaCreateDate').append(me.editor.formatData(me.loc.areaCreateDate, data.areaCreateDate));
            mainItemRow.find('.areaModifyDate').append(me.editor.formatData(me.loc.areaModifyDate, data.areaModifyDate));

            mainItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'area': true, 'id': data.id, 'type': 'main', feature: data })); 

            main.append(mainItemRow);

            for (var i = 0; i < data.subAreas.length; ++i) {
                var subItemRow = me.templates.maintenanceSubItem.clone();

                subItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.subAreas[i].objectId));
                subItemRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.subAreas[i].createDate));
                subItemRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.subAreas[i].modifyDate));

                subItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': data.subAreas[i].objectId, 'type': 'sub', feature: data.subAreas[i] }));

                //sub.append(subItemRow);
                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.subAreas[i].id + ' / ' + data.subAreas[i].objectName);
                panel.setContent(subItemRow);
                panel.setVisible(true);
                panel.close();

                subAccordion.addPanel(panel);
            }

            subAccordion.insertTo(sub);

            if (data.subAreas.length == 0) {
                sub.append(me.editor.templates.noItemsFound.clone());
            }

            return itemDetails;
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'point') {
                return me._renderMaintenanceDetails(attributes, selectedFeature, fields);
            }
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (geometry != null) {
                if (me.editor.editFeature._geometryType === 'point') {
                    me.editor.editFeature.pointGeometry = JSON.parse(geometry);
                    me.editor.editFeature.pointDescription = content.find("#description").val();
                    me.editor.editFeature.pointSurveyingAccuracy = content.find("#surveyingAccuracy").val();
                    me.editor.editFeature.pointSurveyingType = content.find("#surveyingType").val();
                } else if (me.editor.editFeature._type === 'main') {
                    me.editor.editFeature.areaGeometry = JSON.parse(geometry);
                } else if (me.editor.editFeature._type === 'sub'){
                    me.editor.editFeature.geometry = JSON.parse(geometry);
                }
            }
        },

        preparePostData: function() {
            var me = this,
                edited = { 'id': me.editor.itemData.id, 'edited': me.editor.itemData._edited, 'subAreas': [] };
                
            $.each(me.editor.itemData.subAreas, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.subAreas.push(item.id);
                }
            });
            return { 'registerName': 'ancientMaintenance', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited) };
        },

        _renderMaintenanceDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.maintenanceSurveyingDetails.clone(),
                accuracySelect = template.find("#surveyingAccuracy"),
                typeSelect = template.find("#surveyingType");

            $.each(me.loc.surveyingAccuracyValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.pointSurveyingAccuracy) {
                    option.prop('selected', true);
                }
                accuracySelect.append(option);
            });

            $.each(me.loc.surveyingTypeValues, function (key, value) {
                var option = jQuery('<option/>');
                option.attr({ 'value': key }).text(value);
                if (value === me.editor.editFeature.pointSurveyingType) {
                    option.prop('selected', true);
                }
                typeSelect.append(option);
            });

            template.find("#description").val(me.editor.editFeature.pointDescription);
            accuracySelect.val(me.editor.editFeature.pointSurveyingAccuracy);
            typeSelect.val(me.editor.editFeature.pointSurveyingType);

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