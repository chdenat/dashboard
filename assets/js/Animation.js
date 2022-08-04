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


    static get #loader() {
        return document.getElementById(this.#template.animation_type())
}

    static loading(arg) {

        let template_id = (arg instanceof Event) ?arg.template.ID :arg
        this.#template = new Template(template_id)
        let loader = Animation.#loader

        if (this.#template.animate() && loader) {
            if ( document.querySelector(`[data-template-id="${template_id}"]`).classList.contains('loaded')) {
                document.querySelector(`[data-template-id="${template_id}"]`).classList.replace('loaded','loading')
            } else {
                document.querySelector(`[data-template-id="${template_id}"]`).classList.add('loading')
            }
           loader?.classList.add('running')
        }
    }

    static loaded(arg) {

        let template_id = (arg instanceof Event) ?arg.template.ID:arg
        this.#template = new Template(template_id)
        let loader = Animation.#loader

        if (this.#template.animate() && loader) {
            document.querySelector(`[data-template-id="${template_id}"]`).classList.replace('loading','loaded')
            loader.classList.remove('running')
        }
    }

}

export {Animation}