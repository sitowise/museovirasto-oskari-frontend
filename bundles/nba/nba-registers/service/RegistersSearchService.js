/**
 * @class Oskari.nba.bundle.nba-registers.service.RegistersSearchService
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registers.service.RegistersSearchService',
    function (instance) {
        this.instance = instance;
        this.sandbox = instance.getSandbox();
    }, {
        _name: 'Oskari.nba.bundle.nba-registers.service.RegistersSearchService',

        getName: function () {
            return this._name;
        },

        init: function () {

        },

        getRegistryItems: function (params, successCb, errorCb) {
            var url = this.sandbox.getAjaxUrl();
            jQuery.ajax({
                dataType: "json",
                type: "POST",
                data: {
                    'action_route': 'GetRegistryItems',
                    'keyword': params.keyword,
                    'registries':  params.registries,
                    'geometry': params.geometry
                },
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