/**
 * @class Oskari.mapframework.bundle.myplacesimport.UserLayersTab
 */
Oskari.clazz.define('Oskari.mapframework.bundle.myplacesimport.UserLayersTab',
    /**
     * @method create called automatically on construction
     * @static
     * @param {Oskari.mapframework.bundle.myplacesimport.MyPlacesImportBundleInstance} instance
     *      reference to the myplacesimport instance
     */

    function (instance) {
        var me = this,
            p;
        me.instance = instance;
        me.loc = Oskari.getMsg.bind(null, 'MyPlacesImport');
        me.layerMetaType = 'USERLAYER';
        me.visibleFields = [
            'name', 'description', 'source', 'edit', 'remove', 'zoomToData'
        ];
        me.grid = undefined;
        me.container = undefined;
        me.errorDialog = null;

        // templates
        me.template = {};
        for (p in me.__templates) {
            if (me.__templates.hasOwnProperty(p)) {
                me.template[p] = jQuery(me.__templates[p]);
            }
        }
    }, {
        __templates: {
            "main": '<div class="oskari-user-layers-tab"></div>',
            "link": '<a href="JavaScript:void(0);"></a>'
        },
        /**
         * Returns reference to a container that should be shown in personal data
         *
         * @method getContent
         * @return {jQuery} container reference
         */
        getContent: function () {
            var me = this,
                sandbox = me.instance.getSandbox(),
                grid = Oskari.clazz.create('Oskari.userinterface.component.Grid'),
                addMLrequestBuilder = sandbox.getRequestBuilder('AddMapLayerRequest');

            grid.setVisibleFields(this.visibleFields);
            // set up the link from name field
            grid.setColumnValueRenderer('name', function (name, data) {
                var link = me.template.link.clone();

                link.append(name).bind('click', function () {
                    // add myplacesimport layer to map on name click
                    var request = addMLrequestBuilder(data.id);
                    sandbox.request(me.instance, request);
                    return false;
                });
                return link;
            });
            grid.setColumnValueRenderer('remove', function (name, data) {
                var link = me.template.link.clone();

                link.append(me.loc('tab.buttons.delete')).bind('click', function () {
                    me._confirmDeleteUserLayer(data);
                    return false;
                });
                return link;
            });
            grid.setColumnValueRenderer('edit', function (name, data) {
                var link = me.template.link.clone();

                link.append(me.loc('tab.buttons.edit')).bind('click', function () {
                    if (data) {
                        me._showEditPopUp(data);
                    }
                    return false;
                });
                return link;
            });
            grid.setColumnValueRenderer('zoomToData', function (name, data) {
                var link = me.template.link.clone();

                link.append(me.loc('tab.buttons.zoomToData')).bind('click', function () {
                    if (data) {
                        me._zoomToData(data);
                    }
                    return false;
                });
                return link;
            });

            // setup localization
            _.each(this.visibleFields, function (field) {
                grid.setColumnUIName(field, me.loc('tab.grid.' + field));
            });

            me.container = me.template.main.clone();
            me.grid = grid;
            // populate initial grid content
            me.refresh();
            return me.container;
        },
        refresh: function () {
            if (this.container) {
            this.container.empty();
            this.grid.setDataModel(this._getGridModel());
            this.grid.renderTo(this.container);
            }
        },
        /**
         * Confirms delete for given layer and deletes it if confirmed. Also shows
         * notification about cancel, deleted or error on delete.
         * @method _confirmDeleteLayer
         * @param {Object} data grid data object for place
         * @private
         */
        _confirmDeleteUserLayer: function (data) {
            var me = this;
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');

            okBtn.setTitle(me.loc('tab.buttons.delete'));
            okBtn.addClass('primary');

            okBtn.setHandler(function () {
                me._deleteUserLayer(data.id);
                dialog.close();
            });
            var cancelBtn = dialog.createCloseButton(me.loc('tab.buttons.cancel')),
                confirmMsg = me.loc('tab.confirmDeleteMsg', {name: data.name});
            dialog.show(me.loc('tab.title'), confirmMsg, [cancelBtn, okBtn]);
            dialog.makeModal();
        },
        /**
         * @method _deleteUserLayer
         * Request backend to delete user layer. On success removes the layer
         * from map and layerservice. On failure displays a notification.
         * @param layer layer analysis data to be destroyed
         * @private
         */
        _deleteUserLayer: function (layerId) {
            var me = this,
                sandbox = me.instance.sandbox;

            // parse actual id from layer id
            var tokenIndex = layerId.lastIndexOf("_") + 1,
                idParam = layerId.substring(tokenIndex);

            jQuery.ajax({
                url: sandbox.getAjaxUrl(),
                data: {
                    action_route: 'DeleteUserLayer',
                    id: idParam
                },
                type: 'POST',
                success: function (response) {
                    if (response && response.result === 'success') {
                        me._deleteSuccess(layerId);
                    } else {
                        me._operationFailure();
                    }
                },
                error: function () {
                    me._operationFailure();
                }
            });
        },
        /**
         * Success callback for backend operation.
         * @method _deleteSuccess
         * @param layerId Id of the layer that was removed
         * @private
         */
        _deleteSuccess: function (layerId) {
            var me = this,
                sandbox = me.instance.sandbox,
                service = sandbox.getService('Oskari.mapframework.service.MapLayerService');

            // Remove layer from grid... this is really ugly, but so is jumping
            // through hoops to masquerade as a module
            var model = me.grid.getDataModel().data,
                i,
                gridModel = Oskari.clazz.create('Oskari.userinterface.component.GridModel');
            for (i = 0; i < model.length; i++) {
                if (model[i].id !== layerId) {
                    gridModel.addData(model[i]);
                }
            }
            me.grid.setDataModel(gridModel);
            me.grid.renderTo(me.container);

            // TODO: shouldn't maplayerservice send removelayer request by default on remove layer?
            // also we need to do it before service.remove() to avoid problems on other components
            var removeMLrequestBuilder = sandbox.getRequestBuilder('RemoveMapLayerRequest'),
                request = removeMLrequestBuilder(layerId);
            sandbox.request(me.instance, request);
            service.removeLayer(layerId);

            // show msg to user about successful removal
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            dialog.show(me.loc('tab.notification.deletedTitle'), me.loc('tab.notification.deletedMsg'));
            dialog.fadeout(3000);
        },
        /**
         * Failure callback for backend operation.
         * @method _operationFailure
         * @private
         */
        _operationFailure: function (errorText) {
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                okBtn = dialog.createCloseButton(this.loc('tab.buttons.ok'));

            if (errorText == null) {
                errorText = this.loc('tab.error.generic')
            }
            dialog.show(this.loc('tab.error.title'), errorText, [okBtn]);
        },
        /**
         * Renders current user layers to a grid model and returns it.
         *
         * @method _getGridModel
         * @private
         * @param {jQuery} container
         */
        _getGridModel: function (container) {
            var service = this.instance.sandbox.getService('Oskari.mapframework.service.MapLayerService'),
                layers = service.getAllLayersByMetaType(this.layerMetaType),
                gridModel = Oskari.clazz.create('Oskari.userinterface.component.GridModel');
            gridModel.setIdField('id');

            _.each(layers, function (layer) {
                if (gridModel.data.length === 0) {
                    gridModel.addData({
                        'id': layer.getId(),
                        'name': layer.getName(),
                        'description': layer.getDescription(),
                        'source': layer.getSource(),
                        'isBase': layer.isBaseLayer(),
                        'bounds': layer.getBounds()
                    });
                    return;
                }
                var idDouble = false;
                for (i=0; i < gridModel.data.length; i++) {
                    if (layer.getId() === gridModel.data[i].id) {
                        idDouble = true;
                        break;
                    }
                }
                if (!idDouble) {
                    gridModel.addData({
                        'id': layer.getId(),
                        'name': layer.getName(),
                        'description': layer.getDescription(),
                        'source': layer.getSource(),
                        'isBase': layer.isBaseLayer(),
                        'bounds': layer.getBounds()
                    });
                }
            });
            return gridModel;
        },

        _showEditPopUp: function (data) {
            var me = this,
				sandbox = this.instance.getSandbox(),
				dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
				cancelBtn = dialog.createCloseButton(me.loc('tab.buttons.cancel')),
				saveBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');

            var content = jQuery('<div id="editUserLayerPopup"></div>');

            //Description
            var descField = Oskari.clazz.create('Oskari.userinterface.component.FormInput', 'descField');
            descField.getField().find('input').before('<br />');
            descField.setLabel(me.loc('tab.grid.description'));
            content.append(descField.getField());

            if (data) {
                descField.setValue(data.description);
            }

            //Data source
            var sourceField = Oskari.clazz.create('Oskari.userinterface.component.FormInput', 'sourceField');
            sourceField.getField().find('input').before('<br />');
            sourceField.setLabel(me.loc('tab.grid.source'));
            content.append(sourceField.getField());

            if (data) {
                sourceField.setValue(data.source);
            }

            saveBtn.addClass('primary');
            saveBtn.setTitle(me.loc('tab.buttons.save'));
            saveBtn.setHandler(function () {
                var savingData = {};
                if (data) {
                    savingData.id = data.id;
                }
                
                savingData.description = descField.getValue();
                savingData.source = sourceField.getValue();

                var successCb = function (response) {
                    
                    // show msg to user about successful edit
                    var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
                    dialog.show(me.loc('tab.notification.editedTitle'), me.loc('tab.notification.editedMsg'));
                    dialog.fadeout(3000);
                    
                    //remove and add user layer again
                    var mapLayerService = me.instance.sandbox.getService('Oskari.mapframework.service.MapLayerService');
                    mapLayerService.removeLayer(response.id);
                    me.instance.getService().addLayerToService(response, false, function(mapLayer) {
                        // refresh the tab
                        me.refresh();
                        // Request the layer to be added to the map.
                        var requestBuilder = me.instance.sandbox.getRequestBuilder('AddMapLayerRequest');
                        if (requestBuilder) {
                            var request = requestBuilder(mapLayer.getId());
                            me.instance.sandbox.request(me.instance, request);
                        }
                    });
                };

                var errorCb = function () {
                    me._operationFailure(me.loc('tab.error.save'));
                };

                me._saveUserLayer(savingData, successCb, errorCb);
                dialog.close();
            });

            dialog.show(me.loc('tab.grid.edit'), content, [saveBtn, cancelBtn]);
            dialog.makeModal();
        },

        _saveUserLayer: function (data, successCb, errorCb) {
            var me = this;
            var url = me.instance.sandbox.getAjaxUrl() + 'action_route=UpdateUserLayer';
            jQuery.ajax({
                type: 'POST',
                dataType: 'json',
                url: url,
                beforeSend: function (x) {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType("application/j-son;charset=UTF-8");
                    }
                },
                data: {
                    "id": data.id,
                    "description": data.description,
                    "datasource": data.source,
                },
                success: function (response) {
                    if (typeof successCb === 'function') {
                        successCb(response);
                    }
                },
                error: function (jqXHR, textStatus) {
                    if (typeof errorCb === 'function' && jqXHR.status !== 0) {
                        errorCb(jqXHR, textStatus);
                    }
                }
            });
        },

        _zoomToData: function (data) {
            var me = this,
                geojsonFormat = new OpenLayers.Format.GeoJSON(),
                feature,
                registerSearchLayer = new OpenLayers.Layer.Vector('registerSearchLayer'),
                extent,
                center;

            if (data.bounds != null) {
                
                feature = geojsonFormat.read(data.bounds);
                registerSearchLayer.addFeatures([feature[0]]);

                //calculate bounding box from fake layer
                extent = registerSearchLayer.getDataExtent();
                center = extent.getCenterLonLat();

                //zoom map to the extent
                me.instance.sandbox.postRequestByName('MapMoveRequest', [center.lon, center.lat, extent, false]);
            }
        }
    });
