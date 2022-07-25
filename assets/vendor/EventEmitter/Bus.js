/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : EventEmitter.js
 *
 * fork from  https://github.com/dimitrilahaye/vanilla-js-es6-event-emitter
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  7/16/22, 4:50 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

import {EventEmitter} from "./EventEmitter.js";

/**
 * EventEmitter classe singleton.
 * Require EventEmitter class
 */
const EventBus = (function() {

    /** @type {Object} module public api */
    var singleton = {};

    /** @type {EventEmitter} the instance of EventEmitter class */
    var _instance;

    /**
     * Creates and/or returns an instance of the EventEmitter class.
     * @return {EventEmitter} an EventEmitter class instance
     * @private
     */
    singleton._getInstance = function() {
        if (!_instance) {
            _instance = new EventEmitter();
        }
        return _instance;
    };

    // returns unique instance of EventEmitter
    return singleton._getInstance();

})();


export {EventBus}