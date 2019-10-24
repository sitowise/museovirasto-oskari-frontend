Oskari.clazz.category('Oskari.mapframework.mapmodule.GetInfoPlugin', 'formatter', {
    __templates: {
        wrapper: '<div></div>',
        getinfoResultTable: '<table class="getinforesult_table"></table>',
        tableRow: '<tr></tr>',
        tableCell: '<td></td>',
        header: '<div class="getinforesult_header"><div class="icon-bubble-left"></div>',
        headerTitle: '<div class="getinforesult_header_title"></div>',
        myPlacesWrapper: '<div class="myplaces_place">' + 
            '<div class="getinforesult_header"><div class="icon-bubble-left"></div><div class="getinforesult_header_title myplaces_header"></div></div>' +
            '<p class="myplaces_desc"></p>' + 
            '<a class="myplaces_imglink" target="_blank"><img class="myplaces_img"></img></a>' + '<br><a class="myplaces_link" target="_blank"></a>' + '</div>',
        linkOutside: '<a target="_blank"></a>'
    },
    formatters: {
        html: function(datumContent){
            // html has to be put inside a container so jquery behaves
            var parsedHTML = jQuery('<div></div>').append(datumContent);
            // Remove stuff from head etc. that we don't need/want
            parsedHTML.find('link, meta, script, style, title').remove();
            // Add getinforesult class etc. so the table is styled properly
            parsedHTML.find('table').addClass('getinforesult_table');
            // FIXME this is unnecessary, we can do this with a css selector.
            parsedHTML.find('tr').removeClass('odd');
            parsedHTML.find('tr:even').addClass('odd');
            return parsedHTML;
        },
    /**
         * Formats the html to show for my places layers' gfi dialog.
         *
         * @method myplace
         * @param {Object} place response data to format
         * @return {jQuery} formatted html
         */
        myplace: function(place){
            var content = jQuery('<div class="myplaces_place">' + '<h3 class="myplaces_header"></h3>' + '<p class="myplaces_desc"></p>' + '<a class="myplaces_imglink" target="_blank"><img class="myplaces_img"></img></a>' + '<br><a class="myplaces_link" target="_blank"></a>' + '</div>'),
                desc = content.find('p.myplaces_desc'),
                img = content.find('a.myplaces_imglink'),
                link = content.find('a.myplaces_link');

            content.find('h3.myplaces_header').html(place.name);

            if (place.place_desc) {
                desc.html(place.place_desc);
            } else if (place.description) {
                desc.html(place.description);
            } else {
                desc.remove();
            }

            if (place.image_url && typeof place.image_url === 'string') {
                img.attr({
                    'href': place.image_url
                }).find('img.myplaces_img').attr({
                    'src': place.image_url
                });
            } else if (place.imageUrl && typeof place.imageUrl === 'string') {
                img.attr({
                    'href': place.imageUrl
                }).find('img.myplaces_img').attr({
                    'src': place.imageUrl
                });
            } else {
                img.remove();
            }

            if (place.link) {
                link.attr({
                    'href': place.link
                }).html(place.link);
            } else {
                link.remove();
            }

            return content;
        },
        /**
         * @method json
         * @private
         * Formats a GFI response value to a jQuery object
         * @param {pValue} datum response data to format
         * @return {jQuery} formatted HMTL
         */
        json: function(pValue){
            if (!pValue) {
                return;
            }
            var value = jQuery('<span></span>');
            // if value is an array -> format it first
            // TODO: maybe some nicer formatting?
            if (Object.prototype.toString.call(pValue) === '[object Array]') {
                var i,
                    obj,
                    objAttr,
                    innerValue,
                    pluginLoc,
                    myLoc,
                    localizedAttr;

                for (i = 0; i < pValue.length; i += 1) {
                    obj = pValue[i];
                    for (objAttr in obj) {
                        if (obj.hasOwnProperty(objAttr)) {
                            innerValue = this.formatters.json(obj[objAttr]);
                            if (innerValue) {
                                // Get localized attribute name
                                // TODO this should only apply to omat tasot?
                                pluginLoc = this.getMapModule().getLocalization('plugin', true);
                                myLoc = pluginLoc[this._name];
                                localizedAttr = myLoc[objAttr];
                                value.append(localizedAttr || objAttr);
                                value.append(': ');
                                value.append(innerValue);
                                value.append('<br class="innerValueBr" />');
                            }
                        }
                    }
                }
            } else if (pValue.indexOf && pValue.indexOf('://') > 0 && pValue.indexOf('://') < 7) {
                var link = jQuery('<a target="_blank"></a>');
                link.attr('href', pValue);
                link.append(pValue);
                value.append(link);
            } else {
                value.append(pValue);
            }
            return value;
        },
        registry: function (data, me) {
            var layer = Oskari.getSandbox().findMapLayerFromSelectedMapLayers(data.layerId),
                layerName = (layer != null && layer != undefined) ? layer.getName() : '',
                fields,
                hiddenFields = ['__fid', '__centerX', '__centerY', 'subItems', 'areas', 'itemClassName', 'geometry', 'pointGeometry', 'areaGeometry',
                    'mapLayers', 'bounds', 'filtered', 'lines', 'points', 'subAreas', 'editable', 'registryIdentifier'],
                type = 'wfslayer',
                result,
                markup,
                locale = Oskari.getLocalization("RegistryEditor").RegistryEditorView,
                registryLayerConf = Oskari.getSandbox().findRegisteredModuleInstance('nba-registers').conf.registryLayers[data.layerId];

            if (data.features === 'empty') {
                return;
            }
            result = _.map(data.features, function (feature) {
                var showNulls = false;
                if (registryLayerConf != null && registryLayerConf.gfiAttributes != null) {
                    fields = registryLayerConf.gfiAttributes;
                    showNulls = true;
                } else {
                    fields = Object.keys(feature);
                }

                //A workaround for RKY2000 registry items to show feature name in the popup
                me._setFeatureNameForRky2000Feature(feature);

                var feat = _.chain(fields)
                    .filter(function (key) {
                        return !_.contains(hiddenFields, key);
                    })
                    .foldl(function (obj, key) {
                        var value = feature[key];
                        var name = key;
                        if (locale[key]) {
                            name = locale[key];
                        }
                        if (locale.hasOwnProperty(key + "Values") && locale[key + "Values"].hasOwnProperty(value)) {
                            value = locale[key + "Values"][value];
                        }
                        if (_.isArray(value)) {
                            value = value.join(", ");
                        }
                        obj[name] = value;
                        return obj;
                    }, {})
                    .value();

                markup = me._json2html(feat, showNulls);

                return {
                    markup: markup,
                    layerId: data.layerId,
                    layerName: layerName,
                    type: type,
                    isMyPlace: false
                };
            });

            return result;
        },
        /**
         * Checks if the given string is a html document
         *
         * @method _isHTML
         * @private
         * @param datumContent
         * @return true if HTML
         */
        isHTML: function(datumContent){
            var ret = false;
            if (datumContent && typeof datumContent === 'string') {
                if (datumContent.indexOf('<html') >= 0) {
                    ret = true;
                } else if (datumContent.indexOf('<HTML') >= 0) {
                    ret = true;
                }
            }
            return ret;
        }
    },
    /**
     * Wraps the html feature fragments into a container.
     *
     * @method _renderFragments
     * @private
     * @param  {Object[]} fragments
     * @param  {Boolean} wideHeader
     * @return {jQuery}
     */
    _renderFragments: function (fragments, wideHeader) {
        var me = this;

        return _.foldl(fragments, function (wrapper, fragment) {
            var fragmentTitle = fragment.layerName,
                fragmentMarkup = fragment.markup;

            if (fragment.isMyPlace) {
                if (fragmentMarkup) {
                    wrapper.append(fragmentMarkup);
                }
            } else {
                var contentWrapper = me.template.wrapper.clone(),
                    headerWrapper = me.template.header.clone(),
                    titleWrapper = me.template.headerTitle.clone();

                titleWrapper.append(fragmentTitle);
                titleWrapper.attr('title', fragmentTitle);

                //FIXME Find better way to automatically fit width of popup to the title width 
                if (wideHeader) {
                    titleWrapper.css({
                        'width': '530px'
                    });
                }

                headerWrapper.append(titleWrapper);
                contentWrapper.append(headerWrapper);

                if (fragmentMarkup) {
                    contentWrapper.append(fragmentMarkup);
                }
                wrapper.append(contentWrapper);
            }

            delete fragment.isMyPlace;

            return wrapper;
        }, me.template.wrapper.clone());
    },
    /**
     * Parses and formats a GFI response
     *
     * @method _parseGfiResponse
     * @private
     * @param {Object} resp response data to format
     * @return {Object} object { fragments: coll, title: title } where
     *  fragments is an array of JSON { markup: '<html-markup>', layerName:
     * 'nameforlayer', layerId: idforlayer }
     */
    _parseGfiResponse: function (data) {
        if (data.layerCount === 0) {
            return;
        }
        var me = this,
            sandbox = Oskari.getSandbox(),
            coll;

        coll = _.chain(data.features)
            .map(function (datum) {
                var layer = sandbox.findMapLayerFromSelectedMapLayers(datum.layerId),
                    layerName = layer ? layer.getName() : '',
                    pretty = me._formatGfiDatum(datum),
                    layerIdString = datum.layerId + '';

                if (pretty !== null && pretty !== undefined) {
                    return {
                        markup: pretty,
                        layerId: layerIdString,
                        layerName: layerName,
                        type: datum.type,
                        isMyPlace: !!layerIdString.match('myplaces_')
                    };
                }
            })
            .reject(function (feature) {
                return feature === undefined;
            })
            .value();

        return coll || [];
    },

    /**
     * Formats a GFI HTML or JSON object to result HTML
     *
     * @method _formatGfiDatum
     * @private
     * @param {Object} datum response data to format
     * @return {jQuery} formatted HMTL
     */
    _formatGfiDatum: function (datum) {
        // FIXME this function is too complicated, chop it to pieces
        if (!datum.presentationType) {
            return null;
        }

        var me = this,
            response = me.template.wrapper.clone();

        if (datum.presentationType === 'JSON' || (datum.content && datum.content.parsed)) {
            // This is for my places info popup
            if (datum.layerId && typeof datum.layerId === 'string' && datum.layerId.match('myplaces_')) {
                return _.foldl(datum.content.parsed.places, function (div, place) {
                    div.append(me.formatters.myplace(place));
                    return div;
                }, jQuery('<div></div>'));
            }

            var even = false,
                rawJsonData = datum.content.parsed,
                dataArray = [],
                i,
                attr,
                jsonData,
                table,
                value,
                row,
                labelCell,
                pluginLoc,
                myLoc,
                localizedAttr,
                valueCell;

            if (Object.prototype.toString.call(rawJsonData) === '[object Array]') {
                dataArray = rawJsonData;
            } else {
                dataArray.push(rawJsonData);
            }

            for (i = 0; i < dataArray.length; i += 1) {
                jsonData = dataArray[i];
                table = me.template.getinfoResultTable.clone();
                for (attr in jsonData) {
                    if (jsonData.hasOwnProperty(attr)) {
                        value = me.formatters.json(jsonData[attr]);
                        if (value) {
                            row = me.template.tableRow.clone();
                            // FIXME this is unnecessary, we can do this with a css selector.
                            if (!even) {
                                row.addClass('odd');
                            }
                            even = !even;

                            labelCell = me.template.tableCell.clone();
                            // Get localized name for attribute
                            // TODO this should only apply to omat tasot?
                            pluginLoc = this.getMapModule().getLocalization('plugin', true);
                            myLoc = pluginLoc[this._name];
                            localizedAttr = myLoc[attr];
                            labelCell.append(localizedAttr || attr);
                            row.append(labelCell);
                            valueCell = me.template.tableCell.clone();
                            valueCell.append(value);
                            row.append(valueCell);
                            table.append(row);
                        }

                    }
                }
                response.append(table);
            }
        } else if (me.formatters.isHTML(datum.content)) {
            var parsedHTML = me.formatters.html(datum.content);
            if (jQuery.trim(parsedHTML.html()) === '') {
                return null;
            }
            response.append(parsedHTML.html());
        } else {
            response.append(datum.content);
        }
        if (datum.gfiContent) {
            var trimmed = datum.gfiContent.trim();
            if (trimmed.length) {
                response.append(trimmed);
            }
        }
        return response;
    },

    /**
     * @method _formatWFSFeaturesForInfoBox
     */
    _formatWFSFeaturesForInfoBox: function (data) {
        var me = this,
            layer = Oskari.getSandbox().findMapLayerFromSelectedMapLayers(data.layerId),
            isMyPlace = layer.isLayerOfType('myplaces'),
            fields = layer.getFields().slice(),
            //hiddenFields = ['__fid', '__centerX', '__centerY'],
            hiddenFields = (layer.isLayerOfType('USERLAYER') ? ['__fid'] : ['__fid', '__centerX', '__centerY']),
            type = 'wfslayer',
            result,
            markup;

        if (data.features === 'empty' || layer === null || layer === undefined) {
            return;
        }

        if (!isMyPlace) {
            // replace fields with locales
            fields = _.chain(fields)
                .zip(layer.getLocales().slice())
                .map(function (pair) {
                    // pair is an array [field, locale]
                    if (_.contains(hiddenFields, _.first(pair))) {
                        // just return the field name for now if it's hidden
                        return _.first(pair);
                    }
                    // return the localized name or field if former is undefined
                    return _.last(pair) || _.first(pair);
                })
                .value();
        }

        result = _.map(data.features, function (feature) {
            if (fields.length) {
                var feat = _.chain(fields)
                    .zip(feature)
                    .filter(function (pair) {
                        return !_.contains(hiddenFields, _.first(pair));
                    })
                    .foldl(function (obj, pair) {
                        obj[_.first(pair)] = _.last(pair);
                        return obj;
                    }, {})
                    .value();

                if (isMyPlace) {
                    markup = me.formatters.myplace(feat);
                } else {
                    if (!jQuery.isEmptyObject(feat)) {
                        markup = me._json2html(feat);
                    } else {
                        markup = "<table><tr><td>" + me._loc.noAttributeData + "</td></tr></table>";
                    }
                }
            } else {
                markup = "<table><tr><td>" + me._loc.noAttributeData + "</td></tr></table>";
            }
            return {
                markup: markup,
                layerId: data.layerId,
                layerName: layer.getName(),
                type: type,
                isMyPlace: isMyPlace
            };

        });

        return result;
    },

    /**
     * @method _json2html
     * @private
     * Parses and formats a WFS layers JSON GFI response
     * @param {Object} node response data to format
     * @param {Boolean} showNulls specify if attributes with null or undefined values should be shown
     * @return {String} formatted HMTL
     */
    _json2html: function (node, showNulls) {
        // FIXME this function is too complicated, chop it to pieces
        if (node === null || node === undefined) {
            return '';
        }
        var even = true,
            html = this.template.getinfoResultTable.clone(),
            row = null,
            keyColumn = null,
            valColumn = null,
            arrayObject = {},
            key,
            value,
            vType,
            valpres,
            valueDiv,
            innerTable,
            i;
        for (key in node) {
            if (node.hasOwnProperty(key)) {
                value = node[key];

                if (key === null || key === undefined) {
                    continue;
                }

                if ((value === null || value === undefined) && !showNulls) {
                    continue;
                }

                vType = (typeof value).toLowerCase();
                valpres = '';
                switch (vType) {
                case 'string':
                    if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) {
                        valpres = this.template.linkOutside.clone();
                        valpres.attr('href', value);
                        valpres.append(value);
                    } else {
                        valpres = value;
                    }
                    break;
                case 'undefined':
                    valpres = 'n/a';
                    break;
                case 'boolean':
                    valpres = (value ? 'true' : 'false');
                    break;
                case 'number':
                    valpres = '' + value;
                    break;
                case 'function':
                    valpres = '?';
                    break;
                case 'object':
                    // format array
                    if (jQuery.isArray(value)) {
                        valueDiv = this.template.wrapper.clone();
                        if(value.length > 0){
                            if ((typeof value[0]).toLowerCase() === 'object'){
                        for (i = 0; i < value.length; i += 1) {
                            innerTable = this._json2html(value[i]);
                            valueDiv.append(innerTable);
                        }
                        valpres = valueDiv;

                    } else {
                                // Create object for array values
                                for (i = 0; i < value.length; i += 1) {
                                    arrayObject[key+'.'+i] =  value[i];
                                }
                                valpres = this._json2html(arrayObject);
                            }
                        }

                    } else {
                        valpres = this._json2html(value);
                    }
                    break;
                default:
                    valpres = '';
                }
                even = !even;

                row = this.template.tableRow.clone();
                // FIXME this is unnecessary, we can do this with a css selector.
                if (!even) {
                    row.addClass('odd');
                }

                keyColumn = this.template.tableCell.clone();
                keyColumn.append(key);
                row.append(keyColumn);

                valColumn = this.template.tableCell.clone();
                valColumn.append(valpres);
                row.append(valColumn);

                html.append(row);
            }
        }
        return html;
    },

    /**
     * @method _setFeatureNameForRky2000Feature
     * @private
     * Sets featureName property value for RKY2000 feature
     * @param {Object} feature RKY2000 feature
     */
    _setFeatureNameForRky2000Feature: function (feature) {

        if (feature.registryIdentifier !== "rky2000" || feature.featureName != null)
            return;

        if (feature.areas != null && feature.areas.length > 0) {
            feature.featureName = feature.areas[0].featureName;
        } else if (feature.lines != null && feature.lines.length > 0) {
            feature.featureName = feature.lines[0].featureName;
        } else if (feature.points != null && feature.points.length > 0) {
            feature.featureName = feature.points[0].featureName;
        }
    }
});