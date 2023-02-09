/*******************************************************************************************************************
 * Project : shelteradmin
 * file       : Page.js
 *
 * @author : Christian Denat
 * @email   : contact@noleam.fr
 *
 * --
 *
 * updated on:  2/8/23, 7:36 PM
 *
 * @copyright (c) 2023 noleam.fr
 *
 ******************************************************************************************************************/
import {Animation} from "Animation";
import {dsb} from "dsb";

export class Page {

    #main = null
    #id= ''

    constructor(id) {
        this.#id = id
        this.main=id
    }

    loaded() {
        Animation.loaded('#content#')
        dsb.ui.show(this.main)
    }

    /**
     * main setter
     * @param id
     */
    set main(id) {
        this.#main = document.getElementById(id)
    }

    /**
     * main getter
     *
     * @return {HTMLElement}
     */
    get main() {
        return this.#main
    }

    /**
     * page id getter
     *
     * @return {string}
     */
    get id() {
        return this.#id
    }

}