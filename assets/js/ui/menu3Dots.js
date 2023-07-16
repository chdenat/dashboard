/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : menu3Dots.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 11/03/2023  18:39                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
export class menu3Dots extends HTMLElement {
    constructor() {

        super()

        const divElem = document.createElement('div')
        divElem.textContent = this.getAttribute('text')

        const shadowRoot = this.attachShadow({mode: 'open'})
        shadowRoot.appendChild(divElem)
    }
}
