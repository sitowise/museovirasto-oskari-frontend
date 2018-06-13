/**
 * @class Oskari.<mynamespace>.bundle.<mybundle>.request.MyRequestHandler
 * Handles Oskari.<mynamespace>.bundle.<mybundle>.request.MyRequest
 */
Oskari.clazz.define('Oskari.mapframework.bundle.downloadBasket.request.AddToBasketRequestHandler',

  /**
   * @method create called automatically on construction
   * @static
   * @param {Oskari.<mynamespace>.bundle.<mybundle>.MyBundleInstance} instance
   *          reference to instance so we can call its methods, param depends on what you need to handle the request
   */

  function (sandbox, instance) {
    this.sandbox = sandbox;
    this.instance = instance;
  }, {
    /**
     * Protocol method that is called when a request this handler is registered to is received by core.
     *
     * @method handleRequest
     * @param {Oskari.mapframework.core.Core} core
     *      reference to the application core (reference sandbox core.getSandbox())
     * @param {Oskari.<mynamespace>.bundle.<mybundle>.request.MyRequest} request
     *      request to handle
     */
    handleRequest : function(core, request) {
      var map = this.instance.mapModule.getMap();
      var geometry = request.getParameter();
      var features = [new OpenLayers.Feature.Vector(geometry, {croppingMode: 'free'})];
      this.instance.cropping.addToBasket(map, features);
    }
  }, {
    /**
     * @property {String[]} protocol array of superclasses as {String}
     * @static
     */
    protocol : ['Oskari.mapframework.core.RequestHandler']
  });
