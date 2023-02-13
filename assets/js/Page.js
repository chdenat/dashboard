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
    #page= null

    constructor(page) {
        this.#page = page
        dsb.instance.current_page
    }

    loaded() {
        Animation.loaded('#content#')
      //  dsb.ui.show(this.main)
    }

    /**
     * main setter
     * @param id
     */
    set main(id) {
        this.#main = document.getElementById(id)
    }

    /**
     * page getter
     *
     * @return {string|null}
     */
    get page() {
        return this.#page
    }

}