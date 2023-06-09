/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBSortUpAndDown.js                                                                                         *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 09/06/2023  16:25                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

// web component

export class DSBDotsMenuComponent extends HTMLElement {
    directions = {
        up: 'up',
        down: 'down',
        none: 'none'
    }
    direction = 'none'

    constructor() {
        super();
        // we do not use shadow root as it does not work with bootstrap
    }


    // component attributes
    static get observedAttributes() {
        return ['name', 'id', 'class']
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {

        if (oldValue === newValue) return;
        this[property] = newValue;

    }

    // connect component
    connectedCallback() {
        let up = {class: 'regular'}, down = {class: 'regular'}
        this.direction = this.getAttribute('direction') ?? this.directions.none
        switch (this.direction) {
            case this.directions.up :
                up.class = 'solid'
                break;
            case this.directions.down:
                down.class = 'solid'
        }
        const template = `
<style>@import "/dashboard/assets/components/DSBSortUpAndDown/style.css"</style>
    <span class="dsb-sort-up-down">
    <a class="dsb-sort-up" href="#"><i class="fa-${up.class} fa-sort-up" data-fa-transform="shrink-8 right-6"></i></i></a>
    <a class="dsb-sort-down" href="#2"><i class="fa-${down.class} fa-sort-down" data-fa-transform="shrink-8 right-6"></i></a>
    </span>
  `
        this.innerHTML = template


        if (this.hasAttribute('id')) {
            this.setAttribute('id', this.id)
        }

    }

}

// register component
customElements.define('dsb-sort-up-down', DSBDotsMenuComponent);
