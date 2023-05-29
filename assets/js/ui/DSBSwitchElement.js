/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBSwitchElement.js                                                                                         *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 29/05/2023  11:43                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {Bus} from 'Bus'

export class DSBSwitchElement {

    static event = Bus

    /**
     *
     * @param element   it is the .switch-field element
     * @param name
     * @param callback
     */
    constructor(element, name, callback = null) {
        if (!(element instanceof HTMLElement)) {
            element = document.querySelector(element)
        }
        this.element = element
        this.name = name
        this.input = this.element.querySelector('input')
        if (callback) {
            this.callback = callback
            this.addClickEvent()
        }
    }

    isChecked = () => {
        return this.input.checked
    }

    check = () => {
        this.input.checked = true
        DSBSwitchElement.event.emit(`${this.name}/check`, this)
    }
    uncheck = () => {
        this.input.checked = false
        DSBSwitchElement.event.emit(`${this.name}/uncheck`, this)
    }

    toggle = () => {
        this.isChecked() ? this.uncheck() : this.check()
    }


    addClickEvent = () => {
        this.input.addEventListener('click', (event) => {
            eval(this.callback).call(null, event, this)
        })
    }
}
