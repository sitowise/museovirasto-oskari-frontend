/**
 * @class Oskari.nba.bundle.nba-registers.NbaRegistersBundleInstance
 */
Oskari.clazz.define('Oskari.nba.bundle.nba-registers.NbaRegistersBundleInstance',
/**
 * @method create called automatically on construction
 * @static
 */
function () {
    // Best practice is to initialize instance variables here.
    //this.myVar = undefined;
}, {
    /**
     * @static
     * @property __name
     */
    __name: 'nba-registers',
    /**
     * Module protocol method
     *
     * @method getName
     */
    getName: function () {
        return this.__name;
    },
    eventHandlers: {
    },
    /**
     * DefaultExtension method for doing stuff after the bundle has started.
     * 
     * @method afterStart
     */
    afterStart: function (sandbox) {
        //var conf = this.conf;

        //Create the search service
        this.searchService = Oskari.clazz.create('Oskari.nba.bundle.nba-registers.service.RegistersSearchService', this);

        //Create the search tab
        this.tab = Oskari.clazz.create('Oskari.nba.bundle.nba-registers.view.RegistersSearchTab', this);
        this.tab.requestToAddTab();
    },

    getSearchService: function () {
        return this.searchService;
    }

}, {
    "extend": ["Oskari.userinterface.extension.DefaultExtension"]
});