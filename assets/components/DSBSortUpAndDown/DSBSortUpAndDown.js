/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBSortUpAndDown.js                                                                                         *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 10/06/2023  10:50                                                                                *
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
        return ['direction']
    }

    // attribute change
    attributeChangedCallback(attribute, oldValue, newValue) {

        if (oldValue === newValue) {
            return;
        }

        this[attribute] = newValue;

        if (attribute === 'direction') {
            if (newValue !== null) {
                let item = this.querySelector(`[data-sort="${newValue}"] i`)
                item.classList.remove('fa-regular')
                item.classList.add('fa-solid')
            } else {
                this.querySelectorAll(`a i`).forEach(item => {
                    item.classList.remove('fa-solid')
                    item.classList.add('fa-regular')
                })
            }
        }

    }

    #changeArrow = (arrow) => {

    }

    // connect component
    connectedCallback() {
        let up = {class: 'regular'}, down = {class: 'regular'}
        this.direction = this.getAttribute('direction') ?? this.directions.none
        this.asc = this.getAttribute('up')
        this.desc = this.getAttribute('down')
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
    <a class="dsb-sort-up" data-sort="up" data-action="${this.asc}" href="#"><i class="fa-${up.class} fa-sort-up"></i></i></a>
    <a class="dsb-sort-down" data-sort="down" data-action="${this.desc}" href="#"><i class="fa-${down.class} fa-sort-down"></i></a>
    </span>
  `
        this.innerHTML = template


        // if (this.hasAttribute('id')) {
        //     this.setAttribute('id', this.id)
        // }

    }

}

// register component
customElements.define('dsb-sort-up-down', DSBDotsMenuComponent);
