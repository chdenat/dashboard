/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Animation.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/02/2023  10:46                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from "./Block.js";


class Animation {

    static #template
    static classes = {
        unload: 'unload',
        loading: 'loading',
        loaded: 'loaded',
        running: 'running',
    }

    static get #loader() {
        return document.getElementById(this.#template.animation_type())
    }

    static #remove_classes = (container) => {
        container.classList.remove(...Object.values(Animation.classes))
    }

    static loading(arg) {

        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)
        let loader = Animation.#loader

        if (/*this.#template.animate() && */loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.loading)
            loader?.classList.add(Animation.classes.running)
        }
    }

    static loaded(arg) {

        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)
        let loader = Animation.#loader

        if (/*this.#template.animate() &&*/ loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.loaded)
            loader?.classList.remove(Animation.classes.running)
        }
    }

    static unloading(arg) {
        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Block(template_id)
        let loader = Animation.#loader

        if (/*this.#template.animate() &&*/ loader) {
            Animation.#remove_classes(this.#template.container)
            this.#template.container.classList.add(Animation.classes.unload)
            loader?.classList.remove(Animation.classes.running)
        }
    }
}

export {Animation}