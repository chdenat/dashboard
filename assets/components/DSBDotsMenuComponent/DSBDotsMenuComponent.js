/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBDotsMenuComponent.js                                                                                     *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 27/07/2023  14:44                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

// web component

export class DSBDotsMenuComponent extends HTMLElement {

    icon = 'fa-regular fa-ellipsis-vertical'
    direction = 'start'
    list = ''
    DIVIDER = 'divider'
    title = ''

    constructor() {
        super();

        // we do not use shadow root as it does not work with bootstrap

    }


    // component attributes
    static get observedAttributes() {
        return ['name', 'id', 'class', 'icon', 'title']
    }

    divider = () => {
        return '<li><hr class="dropdown-divider"></li>'
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {

        if (oldValue === newValue) return;
        this[property] = newValue;

    }

    // connect component
    connectedCallback() {

        const container = this.querySelector('ul')
        this.querySelectorAll('dsb-dots-menu-item').forEach((element) => {
            const type = element.getAttribute('modal')
            let list = (type === this.DIVIDER) ? this.divider() : ''
            if (type !== this.DIVIDER) {
                const action = element.getAttribute('action')
                if (action === this.DIVIDER) {
                    list = this.divider()
                } else {
                    const context = element.getAttribute('context')
                    const id = element.getAttribute('id')
                    const modal = element.getAttribute('modal')
                    const icon = element.getAttribute('icon')
                    const text = element.getAttribute('text')
                    const action = element.getAttribute('action')
                    const href = element.getAttribute('href')

                    const parameter = element.getAttribute('parameter')
                    const attributes = element.getAttribute('attributes') ?? ''

                    const textAttributes = ' ' + attributes.split(',').join(' ')
                    const textParam = (parameter !== null) ? ` data-parameter="${parameter}"` : ''
                    const textId = (id) ? ` id="${id}"` : ''
                    const textAction = (action) ? ` data-action="${action}"` : ''
                    const textHref = ` href="${(href) ? href : '#'}"`
                    const textContext = (context !== null) ? ` data-context="${context}"` : ''
                    const textModal = (modal !== null) ? ` data-bs-toggle="modal" data-bs-target="${modal}"` : ''
                    list = `
<li ${textId}>
    <a class="dropdown-item" ${textAction}${textHref}${textParam}${textContext}${textModal}${textAttributes}>
        <i class="${icon ?? ''} "></i><span>${text ?? ''}</span>
    </a>
</li>
`
                }
            }
            this.list += list

        })

        const template = `
<style>@import "/dashboard/assets/components/DSBDotsMenuComponent/style.css"</style>
    <div class="drop${this.direction}">
        <a href="#" role="button" class="dsb-dot-menu-button" data-bs-toggle="dropdown" aria-expanded="false">
            <span>${this.title}</span><i class="${this.icon}"></i>
        </a>
        <ul class="dropdown-menu">
            ${this.list}
        </ul>
    </div>
  `
        this.innerHTML = template


        if (this.hasAttribute('id')) {
            this.setAttribute('id', this.id)
        }

    }

}

// register component
customElements.define('dsb-dots-menu', DSBDotsMenuComponent);