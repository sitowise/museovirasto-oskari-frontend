/**
 * @class Oskari.<mynamespace>.bundle.<mybundle>.request.MyRequest
 *
 * Requests are build and sent through Oskari.mapframework.sandbox.Sandbox.
 * Oskari.mapframework.request.Request superclass documents how to send one.
 */
Oskari.clazz.define('Oskari.mapframework.bundle.downloadBasket.request.AddToBasketRequest',
  /**
   * @method create called automatically on construction
   * @static
   *
   * @param {String}
   *            param what you want to request
   */
  function(param) {
    this._param = param;
  }, {
    /** @static @property __name request name */
    __name : 'DownloadBasket.AddToBasketRequest',
    /**
     * @method getName
     * @return {String} request name
     */
    getName : function() {
      return this.__name;
    },
    /**
     * @method getParameter
     * @return {String} something you want to send as param for handling the request
     */
    getParameter : function() {
      return this._param;
    }
  }, {
    'protocol' : ['Oskari.mapframework.request.Request']
  });
