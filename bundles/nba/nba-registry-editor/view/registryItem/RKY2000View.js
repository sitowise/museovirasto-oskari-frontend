/**
 * @class Oskari.nba.bundle.nba-registry-editor.view.RKY2000View
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registry-editor.view.RKY2000View',
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
            'rky2000': jQuery('<div id="rky2000"><div id="main"><h4>' + me.loc.main + '</h4></div><div id="point"><h4>' + me.loc.point + '</h4></div><div id="area"><h4>' + me.loc.area + '</h4></div><div id="line"><h4>' + me.loc.line + '</h4></div></div>'),
            'rky2000MainItem': jQuery('<div class="item rky2000MainItem"><div class="id"/></div>'),
            'rky2000Geometry': jQuery('<div class="item rky2000Geometry"><div class="id"/><div class="name"/><div class="description"/><div class="surveyingType"/><div class="surveyingAccuracy"/><div class="createDate"/><div class="modifyDate"/><div class="author"/><div class="registryItemTools"/></div>'),
            'rky2000GeometryAdd': jQuery('<div class="item newItem rky2000GeometryItem"><h4>' + me.loc.addNew + '</h4><div class="registryItemTools"/></div>'),
            'rky2000SurveyingDetails': jQuery('<div class="itemDetails">'
                + '<div><label>' + me.loc.name + '</label><input type="text" id="name"></div>'
                + '<div><label>' + me.loc.description + '</label><input type="text" id="description"></div>'
                + '<div><label>' + me.loc.surveyingType + '</label><select id="surveyingType"/></div>'
                + '<div><label>' + me.loc.surveyingAccuracy + '</label><select id="surveyingAccuracy"/></div></div>')
        };
    }, {

        getRegisterName: function () {
            return "rky2000";
        },

        render: function (data) {
            var me = this,
                itemDetails = me.templates.rky2000.clone(),
                pointAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                areaAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                lineAccordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion'),
                panel,
                main = itemDetails.find("#main"),
                point = itemDetails.find("#point"),
                area = itemDetails.find('#area'),
                line = itemDetails.find('#line');

            var mainItemRow = me.templates.rky2000MainItem.clone();

            mainItemRow.find('.id').append(me.editor.formatData(me.loc.id, data.id));

            main.append(mainItemRow);

            for (var i = 0; i < data.points.length; ++i) {
                var pointRow = me.templates.rky2000Geometry.clone();

                pointRow.find('.id').append(me.editor.formatData(me.loc.id, data.points[i].objectId));
                pointRow.find('.name').append(me.editor.formatData(me.loc.name, data.points[i].objectName));
                pointRow.find('.description').append(me.editor.formatData(me.loc.description, data.points[i].description));
                pointRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.points[i].surveyingAccuracy]));
                pointRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.points[i].surveyingType]));
                pointRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.points[i].modifyDate));
                pointRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.points[i].createDate));
                pointRow.find('.author').append(me.editor.formatData(me.loc.author, data.points[i].author));

                pointRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': data.points[i].objectId, 'type': 'sub', feature: data.points[i] }));

                //point.append(pointRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.points[i].id + ' / ' + data.points[i].objectName);
                panel.setContent(pointRow);
                panel.setVisible(true);
                panel.close();

                pointAccordion.addPanel(panel);
            }

            pointAccordion.insertTo(point);

            if (data.points.length == 0) {
                point.append(me.editor.templates.noItemsFound.clone());
            }

            var newPointRow = me.templates.rky2000GeometryAdd.clone();
            newPointRow.find('.registryItemTools').append(me.editor.getEditTools({ 'point': true, 'id': -1, 'type': 'sub', feature: {} }));
            point.append(newPointRow)

            for (var i = 0; i < data.areas.length; ++i) {
                var areaRow = me.templates.rky2000Geometry.clone();

                areaRow.find('.id').append(me.editor.formatData(me.loc.id, data.areas[i].objectId));
                areaRow.find('.name').append(me.editor.formatData(me.loc.name, data.areas[i].objectName));
                areaRow.find('.description').append(me.editor.formatData(me.loc.description, data.areas[i].description));
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

            var newAreaRow = me.templates.rky2000GeometryAdd.clone();
            newAreaRow.find('.registryItemTools').append(me.editor.getEditTools({ 'area': true, 'id': -1, 'type': 'sub', feature: {} }));
            area.append(newAreaRow)

            for (var i = 0; i < data.lines.length; ++i) {
                var lineRow = me.templates.rky2000Geometry.clone();

                lineRow.find('.id').append(me.editor.formatData(me.loc.id, data.lines[i].objectId));
                lineRow.find('.name').append(me.editor.formatData(me.loc.name, data.lines[i].objectName));
                lineRow.find('.description').append(me.editor.formatData(me.loc.description, data.lines[i].description));
                lineRow.find('.surveyingAccuracy').append(me.editor.formatData(me.loc.surveyingAccuracy, me.loc.surveyingAccuracyValues[data.lines[i].surveyingAccuracy]));
                lineRow.find('.surveyingType').append(me.editor.formatData(me.loc.surveyingType, me.loc.surveyingTypeValues[data.lines[i].surveyingType]));
                lineRow.find('.modifyDate').append(me.editor.formatData(me.loc.modifyDate, data.lines[i].modifyDate));
                lineRow.find('.createDate').append(me.editor.formatData(me.loc.createDate, data.lines[i].createDate));
                lineRow.find('.author').append(me.editor.formatData(me.loc.author, data.lines[i].author));

                lineRow.find('.registryItemTools').append(me.editor.getEditTools({ 'line': true, 'id': data.lines[i].id, 'type': 'sub', feature: data.lines[i] }));

                //line.append(lineRow);

                panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
                panel.setTitle(data.lines[i].id + ' / ' + data.lines[i].objectName);
                panel.setContent(lineRow);
                panel.setVisible(true);
                panel.close();

                lineAccordion.addPanel(panel);
            }

            lineAccordion.insertTo(line);

            if (data.lines.length == 0) {
                line.append(me.editor.templates.noItemsFound.clone());
            }

            var newLineRow = me.templates.rky2000GeometryAdd.clone();
            newLineRow.find('.registryItemTools').append(me.editor.getEditTools({ 'line': true, 'id': -1, 'type': 'sub', feature: {} }));
            line.append(newLineRow)

            return itemDetails;
        },

        renderUpdateDialogContent: function (attributes, selectedFeature, fields) {
            var me = this;
            return me._renderRKY2000SurveyingDetails(attributes, selectedFeature, fields);
        },

        collectDataForUpdate: function (content, geometry) {
            var me = this;
            if (me.editor.editFeature._geometryType === 'point') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.points.push(me.editor.editFeature);
                }
            }
            if (me.editor.editFeature._geometryType === 'area') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.areas.push(me.editor.editFeature);
                }
            }
            if (me.editor.editFeature._geometryType === 'line') {
                if (typeof me.editor.editFeature.id === 'undefined') {
                    me.editor.itemData.lines.push(me.editor.editFeature);
                }
            }

            me.editor.editFeature.geometry = JSON.parse(geometry);
            me.editor.editFeature.description = content.find("#description").val();
            me.editor.editFeature.surveyingAccuracy = content.find("#surveyingAccuracy").val();
            me.editor.editFeature.surveyingType = content.find("#surveyingType").val();
            me.editor.editFeature.objectName = content.find("#name").val();
        },

        preparePostData: function () {
            var me = this,
                edited = { 'id': me.editor.itemData.id, 'edited': me.editor.itemData._edited, 'points': [], 'areas': [], 'lines': [] };
                
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
            $.each(me.editor.itemData.lines, function (index, item) {
                if (item._edited && item.id != null) {
                    edited.lines.push(item.id);
                }
            });
            return { 'registerName': 'rky2000', 'item': JSON.stringify(me.editor.itemData), 'edited': JSON.stringify(edited) };
        },

        _renderRKY2000SurveyingDetails: function (attributes, selectedFeature, fields) {
            var me = this,
                template = me.templates.rky2000SurveyingDetails.clone(),
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
            accuracySelect.val(me.editor.editFeature.surveyingAccuracy);
            typeSelect.val(me.editor.editFeature.surveyingType);

            if (attributes != null && selectedFeature != null) {
                //add dropdowns
                me.editor.addDropdownsToTemplate(template, attributes, selectedFeature, fields);
            }

            return template;
        },
    },
    {
        // a list of protocols this class implements
        "protocol": ['Oskari.nba.bundle.nba-registry-editor.view.RegistryItemViewProtocol']
    }
);