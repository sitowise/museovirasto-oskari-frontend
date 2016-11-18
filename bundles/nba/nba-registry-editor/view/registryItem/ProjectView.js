/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.ProjectView
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.ProjectView',
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
            'projectRegistry': jQuery('<div id="projectRegistry"><div id="main"><h3>' + me.loc.main + '</h4></div><div id="point"><h4>' + me.loc.point + '</h4></div><div id="area"><h4>' + me.loc.area + '</h4></div></div>'),
            'projectRegistryMainItem': jQuery('<div class="item projectRegistryMainItem"><div class="id"/><div class="name"/><div class="municipalityName"/></div>'),
            'projectRegistryPoint': jQuery('<div class="item projectRegistryPoint"><div class="id"/><div class="description"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'projectRegistryArea': jQuery('<div class="item projectRegistryAreaItem"><div class="id"/><div class="description"/><div class="type"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'projectRegistrySubItemAdd': jQuery('<div class="item newItem projectRegistrySubItem"><h4>' + me.loc.addNew + '</h4><div class="registryItemTools"/></div>'),
            'projectRegistryPointSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'),
            'projectRegistryAreaSurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></label></div>'
                + '<div><label>' + me.loc.type + '</label><input type="text" id="type"/></label></div>')
        };
    }, {

        getRegisterName: function () {
            return "project";
        },

        render: function (data) {
            var me = this,
                itemDetails = me.templates.projectRegistry.clone(),
                pointAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                point = itemDetails.find("#point"),
                area = itemDetails.find('#area');

            var mainItemRow = me.templates.projectRegistryMainItem.clone();

            mainItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.id));
            mainItemRow.find('.municipalityName').append(me.editor.formatData(me.loc.municipalityName, data.municipalityName));
            mainItemRow.find('.name').append(me.editor.formatData(me.loc.objectName, data.objectName));

            main.append(mainItemRow);

            if (data.points == null) {
                data.points = [];
            }

            for (var i = 0; i < data.points.length; ++i) {
                var pointItemRow = me.templates.projectRegistryPoint.clone();

                pointItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.points[i].objectId));
                pointItemRow.find('.description').append(me.editor.formatData(me.loc.description, data.points[i].description));
                pointItemRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.points[i].modifyDate));
                pointItemRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.points[i].createDate));
                pointItemRow.find('.author').append(me.editor.formatData(me.loc.author, data.points[i].author));

                pointItemRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i] }));

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id);
                panel.setContent(pointItemRow);
                panel.setVisible(true);
                panel.close();

                pointAccordion.addPanel(panel);
            }

            pointAccordion.insertTo(point);

            if (data.points.length == 0) {
                point.append(me.editor.templates.noItemsFound.clone());
            }

            var newPointRow = me.templates.projectRegistrySubItemAdd.clone();
            newPointRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': -1, 'type': 'sub', feature: {} }));
            point.append(newPointRow)

            if (data.areas == null) {
                data.areas = [];
            }

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.projectRegistryArea.clone();

                areaRow.find('.id').append(me.editor.formatData(me.loc.id, data.areas[i].objectId));
                areaRow.find('.description').append(me.editor.formatData(me.loc.description, data.areas[i].description));
                areaRow.find('.type').append(me.editor.formatData(me.loc.type, data.areas[i].type));
                areaRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.areas[i].modifyDate));
                areaRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.areas[i].createDate));
                areaRow.find('.author').append(me.editor.formatData(me.loc.author, data.areas[i].author));

                areaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': data.areas[i].id, 'type': 'sub', feature: data.areas[i] }));

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

            var newAreaRow = me.templates.projectRegistrySubItemAdd.clone();
            newAreaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': -1, 'type': 'sub', feature: {} }));
            area.append(newAreaRow)

            return itemDetails;
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'area') {
                return me._renderProjectRegistryAreaDetails(attributes, selectedFeature, fields);
            } else {
                return me._renderProjectRegistryDetails(attributes, selectedFeature, fields);
            }
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'point') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.points.push(me.editor.editFeature);
                }
            } else if (me.editor.editFeature._geometryType === 'area') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.areas.push(me.editor.editFeature);
                }

                me.editor.editFeature.type = content.find("#type").val();
            }

            me.editor.editFeature.geometry = JSON.parse(geometry);
            me.editor.editFeature.description = content.find("#description").val();
        },

        preparePostData() {
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
            return { 'registerName': 'project', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited) };
        },

        _renderProjectRegistryDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.projectRegistryPointSurveyingDetails.clone();

            template.find("#description").val(me.editor.editFeature.description);

            //if (attributes != null && selectedFeature != null) {
            //add dropdowns
            //    me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            //}

            return template;
        },

        _renderProjectRegistryAreaDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.projectRegistryAreaSurveyingDetails.clone();

            template.find("#description").val(me.editor.editFeature.description);
            template.find("#type").val(me.editor.editFeature.type);

            //if (attributes != null && selectedFeature != null) {
            //add dropdowns
            //    me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            //}

            return template;
        }
    },
    {
        // a list of protocols this class implements
        "protocol": ['Oskari.nba.bundle.nba-registry-editor.view.RegistryItemViewProtocol']
    }
);