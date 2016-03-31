/**
 * @class Oskari.nba.bundle.nba-link.service.RegisterService
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-link.service.RegisterService',
    function (instance) {
        this.instance = instance;
        this.sandbox = instance.getSandbox();
    }, {
        _name: 'Oskari.nba.bundle.nba-link.service.RegisterService',

        getName: function () {
            return this._name;
        },

        init: function () {

        },

        getRegistryItem: function (params, successCb, errorCb) {
            var url = this.sandbox.getAjaxUrl() + '&action_route=GetRegistryItems&registerName=' + params.registerName + '&id=' + params.registryItemId;
            jQuery.ajax({
                dataType: "json",
                type: "GET",
                beforeSend: function (x) {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType("application/json");
                    }
                },
                url: url,
                error: errorCb,
                success: successCb
            });
        }
    }, {
        'protocol': ['Oskari.mapframework.service.Service']
    });