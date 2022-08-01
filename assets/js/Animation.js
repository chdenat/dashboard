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


class Animation {


    static get #loader() {
        return document.getElementById('loader')
}

    static loading(arg) {

        let template = (arg instanceof Event) ?arg.template.ID :arg
        if ('#content#' === template) {
            if ( document.querySelector(`[data-template-id="#content#"]`).classList.contains('loaded')) {
                document.querySelector(`[data-template-id="#content#"]`).classList.replace('loadied','loading')
            } else {
                document.querySelector(`[data-template-id="#content#"]`).classList.add('loading')
            }
            Animation.#loader?.classList.add('running')
        } else {
        }
    }

    static loaded(arg) {

        let template = (arg instanceof Event) ?arg.template.ID:arg

        if ('#content#' === template) {
            document.querySelector(`[data-template-id="#content#"]`).classList.replace('loading','loaded')
            Animation.#loader.classList.remove('running')
        } else {

        }
    }

}

export {Animation}