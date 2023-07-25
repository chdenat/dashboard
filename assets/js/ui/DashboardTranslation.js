/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardTranslation.js                                                                                     *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 25/07/2023  09:54                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

export class DashboardTranslation {
    #element = null
    #translations = {}

    contructor(context = null) {
        this.bind(context)
    }

    bind = (context) => {
        if (context !== null) {
            this.#element = document.querySelector(`text-i18n[context="${context}"]`)
            if (this.#element !== undefined) {
                // Delete existing properties
                for (const [property, value] of Object.entries(this.#translations)) {
                    delete this[property]
                }

                // Add new translations
                this.#translations = this.#element?.dataset
                for (const [property, value] of Object.entries(this.#translations)) {
                    Object.defineProperty(this, property, {value: value, configurable: true})
                }
            }
        }
    }
}