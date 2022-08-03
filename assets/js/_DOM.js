/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : ShadowDOM.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  6/1/22, 8:59 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

class _DOM {
    static #list = []
    static #history = []

    constructor() {
    }

    // /**
    //  * Return the template corresponding to the key
    //  *
    //  * @param key  key could be a template ID or a template object
    //  *
    //  * @returns  object if by_id = true , else array of object or null if nothing found.
    //  *
    //  * @since 1.0
    //  */
    //
    // static query_template_by_key = (key) => {
    //     let id = key
    //     if (key instanceof Template) {
    //         id = key.ID
    //     }
    //     if (id.startsWith('#')) {
    //         return this.#list[id] ?? null
    //     } else {
    //         return this.#list.filter(element => element.ID === key) ?? null;
    //     }
    // }

    /**
     * Get templates by name
     *
     * @param parent
     * @param name
     * @returns NodeList  {NodeListOf<Element> | NodeListOf<SVGElementTagNameMap[keyof SVGElementTagNameMap]> |
     *                     NodeListOf<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>}
     *
     * @since 1.0
     *
     */
    static query_templates_by_name = (parent, name) => {
        return parent.querySelectorAll(`block[data-template="${name}"]`);
    }

    /**
     * Get all templates in DOM
     *
     * @param parent
     * @param no_empty : boolean empty templates with no value
     *
     * @returns {NodeListOf<Element> | NodeListOf<SVGElementTagNameMap[keyof SVGElementTagNameMap]> | NodeListOf<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>}
     *
     * @since 1.0
     *
     */
    static query_all_templates = (parent,no_empty=false) => {
        let query = 'block[data-template]'+(no_empty?':not([data-template=""])':'')
        return parent.querySelectorAll(query)
    }
    //
    // /**
    //  * Add a #content# template to the history
    //  *
    //  * @param key template ID
    //  */
    // static add_to_history = () => {
    //     if (template.is_content) {
    //         this.#history.push(template)
    //     }
    // }
    //
    // /**
    //  * Get the last element in the history
    //  *
    //  * @param index start from end (0,-1,-2 ...)
    //  */
    // static get last_in_history() {
    //     return this.#history.slice(-1)
    // }
    //
    // static get history() {
    //     return this.#history
    // }

}

export {_DOM}