/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardWCManager.js                                                                                       *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 11/03/2023  18:39                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/


/**********************************************************************************************************************
 *  Dashboard Web Component Manager
 */
export class DashboardWCManager {
    #webComponents = []

    constructor() {

        this.#webComponents = [
            {class: 'menu3Dots', name: 'dsb-menu-3dots'}
        ]

        this.attachWebComponents(() => {
            console.info('Web components attached !')
        })


    }

    attachWebComponents = async () => {
        for (const component of this.#webComponents) {
            const usedClass = await import(`./${component.class}.js`)
            customElements.define(component.name, eval(`usedClass.${component.class}`))
        }
    }
}