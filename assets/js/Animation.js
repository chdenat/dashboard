/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : Animation.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  6/1/22, 3:16 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
import {Template} from "./Template.js";


class Animation {

    static #template
    static classes = {
        unloading: 'unloading',
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
        this.#template = new Template(template_id)
        let loader = Animation.#loader

        if (this.#template.animate() && loader) {
            let container = document.querySelector(`[data-template-id="${template_id}"]`)
            Animation.#remove_classes(container)
            container.classList.add(Animation.classes.loading)
            loader?.classList.add(Animation.classes.running)
        }
    }

    static loaded(arg) {

        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Template(template_id)
        let loader = Animation.#loader

        if (this.#template.animate() && loader) {
            let container = document.querySelector(`[data-template-id="${template_id}"]`)
            Animation.#remove_classes(container)
            container.classList.add(Animation.classes.loaded)
            loader.classList.remove(Animation.classes.running)
        }
    }

    static unloading(arg) {
        let template_id = (arg instanceof Event) ? arg.template.ID : arg
        this.#template = new Template(template_id)
        let loader = Animation.#loader

        if (this.#template.animate() && loader) {
            let container = document.querySelector(`[data-template-id="${template_id}"]`)
            Animation.#remove_classes(container)
            container.classList.add(Animation.classes.unloading)
            loader.classList.remove(Animation.classes.running)
        }
    }
}

export {Animation}