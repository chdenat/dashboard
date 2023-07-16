/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Modal.js                                                                                                    *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/02/2023  10:46                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {Block} from "Block";

class Modal {

    #instance = null
    #dom_modal = null
    #parameters = []
    #custom = false
    #dialog = null
    #action = null


    constructor({
                    element = '#dashboard-modal',    // Ajax CSS identifier
                    action = null,                       // Ajax method
                    parameters = [],                  // Sent to ajax
                    custom = false                  // False = standard, true = specific
                }) {

        this.#dom_modal = document.querySelector(element)
        this.#dialog = this.#dom_modal.querySelector('.modal-dialog')
        this.#instance = new bootstrap.Modal(this.#dom_modal, {focus: false})
        this.#parameters = parameters
        this.#parameters['action'] = action

        if (null !== action) {
            this.#action = action
        } else {
            this.action = parameters.action
        }

        this.#parameters = parameters
        this.#custom = custom


        // Some generic function
        this.#dom_modal.addEventListener('shown.bs.modal', this.loading_events)

        // Launch loaded events
        this.#dom_modal.addEventListener('shown.bs.modal', this.loaded_events)
        // Launch closed events
        this.#dom_modal.addEventListener('hidden.bs.modal', this.closed_events)

        // Some generic function
        this.#dom_modal.addEventListener('modal/loaded', this.loaded_event)

        this.load()
    }

    /**
     * Generic event dispatche when a mdda has been loaded
     * @param event
     */
    loaded_event = (event) => {
        Block.importChildren(this.#dom_modal)
    }

    /**
     * Show the user modal
     *
     * @returns {dsb.modal}
     *
     * @since 1.0
     *
     */
    show = function () {
        this.#instance.show();
        return this;
    }

    /**
     * Hide the user modal
     *
     * @returns {dsb.modal}
     *
     * @dince 1.0
     *
     */
    hide = function () {
        this.#instance.hide();
        return this;
    }

    /**
     * Change the modal content
     *
     * @param html
     * @returns {dsb.modal}
     *
     * @since 1.0
     *
     */
    message = (html) => {
        this.#dom_modal.querySelector('.modal-content').innerHTML = html;
        return this
    }

    /**
     * This function makes an Ajax call used to get the modal content

     *
     * @since 1.0
     *
     */
    load = () => {
        this.#parameters.action = this.#action
        let self = this
        this.resize()


        fetch(((this.#custom) ? ajax.get : dsb_ajax.get) + '?' + new URLSearchParams({
            action: this.#action,
            params: JSON.stringify(this.#parameters),
        })).then(function (response) {
            return response.text();
        }).then(function (html) {
            self.message(html);
            Block.importChildren(self.#dom_modal)

            return true;
        }).catch((error) => {
            console.error('Error:', error); // Print or not print ?
        })
    }
    /**
     * Load 2 specific events when the modal is laoding
     *
     */
    loading_events = () => {
        // Throw a  generic load event
        let generic = new Event('modal/loading')
        generic.modal = dsb.modal
        generic.parameters = dsb.modal._parameters.keys
        document.dispatchEvent(generic)

        // and a new specific running event
        let specific = new Event(`modal/loading/${dsb.modal._parameters.action}`)
        generic.modal = dsb.modal
        generic.parameters = dsb.modal._parameters.keys
    }

    /**
     * Load 2 specific events when the modal has been shown
     *
     *
     */
    loaded_events = () => {
        // Throw a  generic load event
        let generic = new Event('modal/loaded')
        generic.modal = this
        generic.parameters = this.#parameters.keys
        this.#dom_modal.dispatchEvent(generic)

        // and a new specific running event
        let specific = new Event(`modal/loaded/${this.#parameters.action}`)
        generic.modal = this.modal
        generic.parameters = this.#parameters.keys
        this.#dom_modal.dispatchEvent(specific)
    }
    /**
     * Load 2 specific events when the modal has been hidden
     *
     *
     */
    closed_events = () => {
        // Throw a  generic load event
        let generic = new Event('modal/closed')
        generic.modal = this
        generic.parameters = this.#parameters.keys
        this.#dom_modal.dispatchEvent(generic)

        // and a new specific running event
        let specific = new Event(`modal/closed/${this.#parameters.action}`)
        generic.modal = this
        generic.parameters = this.#parameters.keys
        this.#dom_modal.dispatchEvent(specific)
    }
    /**
     * Add the possibility to resize a modal
     *
     * @param size = sm | node | lg | xl
     */
    resize = (size = '') => {
        let sizes = ['modal-xl', 'modal-lg', 'modal-sm']
        let _dialog = document.querySelector('#dashboard-modal .modal-dialog')
        _dialog.classList.remove(...sizes)

        if (size !== '') {
            _dialog.classList.add(`modal-${size}`);
        }

    }

    get instance() {
        return this.#instance
    }

    get element() {
        return this.#dom_modal
    }
}

export {Modal}