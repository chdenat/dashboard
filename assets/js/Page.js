/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Page.js                                                                                                     *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 09/07/2023  11:52                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Animation} from "Animation";
import {dsb} from "dsb";

export class Page {

    #template = null
    #page = null

    constructor(page, template) {
        this.#page = page
        this.#template = template

        Animation.clickToStopLoaderOnPage()
    }

    /**
     * template getter
     *
     * @return {Block|null}
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

    pageInitialisation() {
        this.loading()
    }

    /**
     * Encapsulate dsb importWebComponents
     *
     * @param components
     */
    importWebComponents = (...components) => {
        dsb.utils.importWebComponents(components)
    }

    /**
     * Those methods could be declared in the Controller Page Class
     * They are automatically called when we import the class and instantiate the controller
     *
     * Ordering :
     *      - import JS Page Controller          // in Dashboard class
     *      - call globalPageInitialisation      // call in Dashboard class
     *      - call attachEvents                  // call in Dashboard class
     *      - load Page                          // in Dashboard class
     *
     *      - call pageInitialisation            // call in Block

     * This is a  static method used to make some global initialisation

     static pageInitialisation  = ()=> {}

     * This method initialise page data

     pageInitialisation = () => {}

     * This is a method used to attach events before we load the page

     attachEvents  = ()=> {}

     *
     *
     */

    loading() {
        Animation.loading('#content#')
    }

    loaded() {
        Animation.loaded('#content#')
    }


}