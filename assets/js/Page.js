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

    #template = null
    #page= null

    constructor(page, template) {
        this.#page = page
        this.#template = template
        dsb.instance.current_page

        //import sheet from './style.css' assert { type: 'css' };
        //document.adoptedStyleSheets = [sheet];
    }

    /**
     * Those 2 methods could be declared in the Cpntroller Page Class
     *
     * They are automatically called when we import the class and instantiate the controller
     *

     static globalPageInitialisation  = ()=> {
        console.error(`You must implement "globalPageInitialisation" method !`)
    }
     attachEvents  = ()=> {
        throw new Error(`You must implement "attachEvents" method !`)
    }

     *
     *
     */

    initialisation = () => {
        //Silent mode :  this is called when there is no child method
    }

    loaded() {
        Animation.loaded('#content#')
    }

    /**
     * template getter
     *
     * @return {Template|null}
     */
    get template() {
        return this.#template
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