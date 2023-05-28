/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBAlertComponent.js                                                                                        *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 28/05/2023  16:50                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

// web component

export class DSBAlertComponent extends HTMLElement {

    icon = 'fa-regular fa-circle-info'
    direction = 'start'
    list = ''
    DIVIDER = 'divider'

    constructor() {
        super();

        // we do not use shadow root as it does not work with bootstrap

    }


    // component attributes
    static get observedAttributes() {
        return ['name', 'id', 'class', 'icon']
    }


    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {

        if (oldValue === newValue) return;
        this[property] = newValue;

    }

    static setMessage(id, message) {
        document.getElementById(id).querySelector('.alert-body').innerHTML = message
        return this
    }

    static show(id) {
        document.getElementById(id).classList.add('show')
        return this
    }

    // connect component
    connectedCallback() {
        const type = this.getAttribute('type')
        const dismiss = this.getAttribute('dismiss') === 'true'
        const icon = this.getAttribute('icon') ?? this.icon
        const noIcon = this.getAttribute('no-icon') === 'true'
        const dataId = this.id ?? ''
        const classes = this.getAttribute('class') ?? ''

        const dataType = (type) ? `alert-${type}` : ''
        let dataDismiss = ''
        let dismissIcon = ''
        if (dismiss && dataId) {
            dismissIcon = `<i class="dismiss-alert fa-regular fa-xmark" onClick="document.getElementById('${dataId}').classList.remove('show')"></i>`
        }
        const dataIcon = (!noIcon)
            ? `<i class="icon-alert ${icon}"></i>`
            : ''

        const template = `
            <style>@import "/dashboard/assets/components/DSBAlertComponent/style.css"</style>
        <div class="alert ${dataType}" id="${dataId}-inner">
            ${dismissIcon}${dataIcon}<div class="alert-body">${this.innerHTML}</div>
        </div>
  `
        this.innerHTML = template
    }

}

// register component
customElements.define('dsb-alert', DSBAlertComponent);
