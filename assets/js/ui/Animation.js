/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Animation.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 09/07/2023  11:58                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from 'Block'


class Animation {

    static #template
    static classes = {
        unload: 'unload',
        loading: 'loading',
        loaded: 'loaded',
        running: 'running',
    }

    loader = null

    static get loader() {
        return document.getElementById(this.#template.animationType())
    }

    static #remove_classes = (container) => {
        container.classList.remove(...Object.values(Animation.classes))
    }

    static loading(arg) {

        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)
        if (this.#template.animate() && this.loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.loading)
            this.loader?.classList.add(Animation.classes.running)
        }
    }

    static loaded(arg) {

        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)

        if (/*this.#template.animate() &&*/ this.loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.loaded)
            this.loader?.classList.remove(Animation.classes.running)
        }
    }

    static unloading(arg) {
        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)

        if (/*this.#template.animate() &&*/ this.loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.unload)
            this.loader?.classList.remove(Animation.classes.running)
        }
    }

    static clickToStopLoaderOnPage = () => {
        this.loader.addEventListener('click', () => {
            this.loaded('#content#')
        })
    }
}

export {Animation}