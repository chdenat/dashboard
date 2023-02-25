/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Template.js                                                                                                 *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 25/02/2023  11:59                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {nanoid} from 'nanoid'
import {Animation} from 'Animation';
import {Bus as TemplateEvent} from 'Bus';


let templates_list = [];

class Template {

    static #HOME = ''
    static #EXCEPTIONS = []
    static #reserved = ['menu', 'content', 'pop-content']    // Special templates
    static #use_404 = false
    static event = TemplateEvent
    #ID = null
    #file = ''
    #directory = ''
    #tab = ''
    #dom = {}
    #load = false
    #parent = null
    #children = []
    #old = null
    #variable = null
    animation = Animation
    #page_path = '/pages/'
    #observer

    /**
     *
     * @param element could be an HTMLElement or a string
     *                If it is a string, it should be the data-template-id value
     *
     * @param variable add to template file.
     *                when the template file is 'xxxx/yyyyy'        ==> we check this as template file, no variable
     *                when the template file is 'xxxx/yyyyy[zzz]'   ==> we check 'xxxx/yyyyy' as template file, zzz as variable
     * @param file    force a file instead the defind in data-template
     *
     * @since 1.0.0
     *
     *
     */
    constructor(element = document, variable = null, file = null) {


        // If it is not a DOM element, we get it from the ID
        if (typeof element === 'string') {
            element = document.querySelector(`[data-template-id="${element}"]`)
        }

        if (element) {
            this.#ID = element.dataset.templateId ?? '#' + nanoid()

            // file  or data-template info
            this.check_link(file ?? element.dataset.template)

            // Then save it in DOM
            if (file) {
                element.setAttribute('data-template', file)
            }

            // Template file could be
            //      'xxxx/yyyyy'                => we check this as template file
            //      'xxxx/yyyyy[variable]       =>

            if (variable === null) {
                // Try to extract it from file
                let match = this.file.match(/\[(.*)]/)
                if (match) {
                    variable = match[1]
                }
            }
            if (variable !== null) {
                this.#variable = variable
                this.file = this.file.replace(`[${this.#variable}]`, '')
            }

            this.#dom = {
                container: element,
                forced: element.dataset.templateForced ?? false,        // data-template-forced
                animate: element.dataset.animationType ?? false,         // data-animation-load
                animation_type: element.dataset.animationType ?? null,  // data-animation-type
            }

            this.#load = false
            this.#parent = element.parentElement.closest('[data-template]')

            this.children

            // we push ID to the DOM element
            element.setAttribute('data-template-id', this.#ID)


            // Load Satus Observer
            this.load_status_observer = new MutationObserver(this.loadStatusObserver, this)

        } else {
            this.#ID = null
        }
    }

    /**
     * Scan the DOM element and get children
     *
     * @since 1.0
     *
     */
    get children() {
        let parent = this.#dom.container ?? document
        Template.get_all_templates(parent).forEach(child => {
            let tmp = new Template(child)
            Template.add_template_to_list(tmp)
            this.#children.push(tmp);
        })
    }

    get is_reserved() {
        return Template.#reserved.includes(this.ID.replace(/#/g, '',))
    }

    get is_content() {
        return '#content#' === this.ID
    }

    get ID() {
        return this.#ID
    }

    get container() {
        return this.dom.container
    }

    get dom() {
        return this.#dom
    }

    get file() {
        return this.#file ?? false
    }

    set file(file) {
        this.#file = file
    }

    set file(file) {
        this.#file = file
    }

    get directory() {
        return this.#directory
    }

    set directory(directory) {
        this.#directory = directory
    }

    get tab() {
        return this.#tab
    }

    set tab(tab) {
        this.#tab = tab
    }

    get loaded() {
        return this.#load
    }

    set loaded(status) {
        this.#load = status
    }

    set historize(template) {
        this.#old = template.file
    }

    get history() {
        return this.#old
    }

    get same_file() {
        return this.#file === this?.#old
    }

    get container() {
        return this.#dom.container
    }

    static ID_from_element(element) {
        if (!element instanceof HTMLElement) {
            element = document.querySelector(element)
        }

        if (element?.dataset?.templateID?.startsWith('#')) {
            return element?.dataset?.templateID
        }

        return ''
    }

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
    static get_templates_by_name = (parent, name) => {
        return parent.querySelectorAll(`block[data-template="${name}"]`);
    }

    static set_home(home) {
        Template.#HOME = home
    }

    static get_home() {
        return Template.#HOME
    }

    static set_exceptions(list) {
        Template.#EXCEPTIONS = list
    }

    static get_exceptions() {
        return Template.#EXCEPTIONS
    }

    static _check_link = (link) => {
        let tmp = link.split('#');
        return {file: tmp[0], tab: tmp[1] ?? ''};
    }

    /**
     *
     * @param template_id
     * @param url
     */
    static page_404 = (template_id, url) => {
        let t = new Template(document.querySelector(`[data-template-id="${template_id}"]`))

        if (t.is_content && !Template.#use_404) {
            return
        }

        t.check_link(`${t.#page_path}404`)
        t.load(true, {url: url})
        Template.use_404();

    }

    static use_404 = (use = true) => {
        Template.#use_404 = use
    }

    static do_we_use_404 = () => {
        return Template.#use_404
    }

    /**
     * Manage template loading when it comes from an event.
     * Links must be bound to same managed template
     *
     * This function should be launch using addEventListener
     * @param event
     */
    static async load_from_event(event) {

        // We check if the link has been bound to a reserved template
        for (const item in event.currentTarget.dataset) {
            if (this.#reserved.includes(item)) {
                // If it s the case, lets'go
                let template = Template.get_template(`#${item}#`)

                if (undefined !== template) {


                    // save old...
                    template.historize = template

                    // And now we work on the new content, we push the file and tab
                    template.check_link(event.currentTarget.getAttribute('href'))

                    let force = true
                    // Same file  : De we force a loading?
                    if (template.same_file) {
                        force = event.target.dataset.forceReload ?? false
                        // If reload not forced, we do nothing and say bye
                        if (!force) {
                            template.loaded = true;
                        }
                    }

                    // The events com from the menu, so, add an animation if it's only a tab template.
                    if (!template.is_content) {
                        Animation.loading('#content#')
                    }

                    template.loadPage(force)

                    // save file information
                    template.#dom.container.setAttribute('data-template', template.file)
                }

                event.preventDefault(); // Cancel the native event
                return false
            }
        }
        Animation.loaded('#content#')
    }

    /**
     * Load all tremplates
     *
     * @param parent root (document by default)
     */
    static load_all_templates = async function (parent = document) {

        let templates = Template.get_all_templates(parent);
        let children = []
        for (const template of templates) {
            if (template.dataset?.templateId !== '#popcont#') {
                let element = Template.add_base_to_template(template)
                let item = new Template(element)
                children.push(item)
            }
        }
        for (const template of children) {
            template.loadPage(true).then(() => {
                template.loadDefer()
            })
        }


    }

    static add_base_to_template = (template) => {
        if (template.dataset?.templateId === '#content#') {
            // In case it is  the content block, we push the baseUri as template
            template.setAttribute('data-template', dsb.utils.path_info(template.baseURI).file)
        }
        return template
    }

    static importPageController = async (template) => {
        let parts = template.file.split('/')
        if (parts[parts.length - 1] === 'index') {
            parts.pop()
        }
        return dsb.instance.importPageController(parts.pop(), template)
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
    static get_all_templates = (parent, no_empty = false) => {
        let query = 'block[data-template]' + (no_empty ? ':not([data-template=""])' : '')
        return parent.querySelectorAll(query)
    }

    /**
     * Add a template to the DOM list
     *
     * @param template
     */
    static add_template_to_list = (template = this) => {
        templates_list[template.ID] = template
    }

    /**
     * Delete a template from the DOM list
     *
     * @param key  key could be a template ID or a template object
     */
    static remove_template_from_list = (key = this) => {
        let id = key
        if (key instanceof Template) {
            id = key.ID
        }
        templates_list.forEach((item, index) => {
            if (index === id) {
                templates_list.splice(index, 1);
            }
        })
    }

    /**
     * Set a template by getting the item in the list
     *
     * @param key
     * @returns {*}
     */
    static get_template = (key) => {
        return templates_list[key]
    }

    static async reloadPage() {
        let t = new Template(document.querySelector('[data-template-id="#content#"]'))
        t.loading_animation()
        await t.load(true)
        await Template.load_all_templates(t.container)
        t.loaded_animation()
    }

    static reload_page(soft = true) {
        if (soft) {
            Template.load_all_templates()
            return
        }
        location.reload()
    }

    /**
     * Load all templates with tag defer
     */
    loadDefer = () => {
        this.container.querySelectorAll("[data-template-defer]").forEach(async template => {
            const t = new Template(template, null, template.dataset.templateDefer)
            await t.load(true)
        })
    }

    has_directory = () => {
        return this.directory !== ''
    }

    has_tab = () => {
        return this.tab !== ''
    }

    /**
     * Check if a string is an exception
     *
     *
     * @return {boolean}
     * @param text
     */
    #check_exception = (text) => {
        let is_exception = false;
        for (let exception in Template.get_exceptions()) {
            if (text.includes(exception)) {
                is_exception = true
                break
            }
        }
        return is_exception
    }

    /**
     * Checks the href refers to a tab
     *
     *   => without     dummy/page
     *   => with        dummy/page#tab
     *
     * @param link
     */

    check_link = (link) => {
        let tmp = link.split('#');
        this.#file = tmp[0]
        this.#tab = tmp[1] ?? '';
    }

    /**
     * Load a page if the template target is #content#
     *
     *
     * @param force
     * @return {Promise<void>}
     */
    loadPage = async (force) => {
        // Load the link content in the right template
        if (this.is_content && dsb.instance && this.file !== null) {
            Template.importPageController(this)
                .then(result => {
                    // Once the page  has been loaded, it's time to initalise the page,
                    // if the required method exists
                    if (result.success) {
                        this.load(force).then(() => {
                            if (!result.message && result.page['pageInitialisation']) {
                                result.page.pageInitialisation()
                            }
                        })
                    }
                })
                .catch(error => {
                    console.error(error.message)
                })
        } else {
            await this.load(force);
        }
    }

    /**
     * We detect if the target element has a data-load-status change.
     * If it is the case we launch events accordingly
     *
     * @since 1.6
     */
    observeLoadStatus = () => {
        this.load_status_observer.observe(this.#dom.container, {
            attributeFilter: ['data-load-status'],
            attributeOldValue: true,

            characterData: false,
            childList: false,
            subtree: false,
            characterDataOldValue: false
        });
    }

    /**
     * Load Status Observer
     *
     * @param mutations {MutationRecord}
     *
     * @since 1.6
     *
     */
    loadStatusObserver = (mutations) => {
        let template = this
        mutations.forEach(function (mutation) {
            let found = false
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-load-status') {
                let status = mutation.target.dataset.loadStatus
                if (status && status != mutation.oldValue && !found) {
                    template.dispatchEvents(`template/${status}`)
                    found = true
                }
            }
        })
    }

    /**
     * Load a template by Ajax in any DOM element that contains the right data-template attribute
     *
     * Template are loaded only if
     *    - data-template-forced is false or not defined
     *    - force = false (ie defaults)
     *
     * @param force         Force template to load

     * @param parameters
     *
     *
     * @since 1.0
     *
     */

    load = async (force = false, parameters = []) => {

        /*
         * Bail early if we have no file in any template except content
         */
        if (this.file === '' && !this.is_content) {
            return false
        }

        /**
         *  @since 1.1.0
         */
        this.parameters = parameters

        /**
         * Maybe we need to redirect on home...
         */

        this.#fix_template()

        /**
         * force template is false ...
         *
         * We just show the tab if the template has already been loaded
         * and stop the animation.
         *
         */

        if (force === false && this.loaded) {
            if (null !== this.tab) {
                dsb.ui.show_tab(this.tab)
            }
            return true
        }

        /**
         * We observe the change on block
         */
        this.observeLoadStatus()

        /**
         * We get the actual '#content#' template in order to apply unload event
         */
        if (!this.same_file) {
            this.unload_animation(true)
        }

        /**
         * OK, all is ready to
         * We start to load the template
         */

        // Step 1 : Dispatch loading event
        this.loading_animation(true)


        // Step 2 : run animation


        let current = this
        // Step 3 : Load the template using ajax and children if there are some
        await fetch(dsb_ajax.get + '?' + new URLSearchParams({
            action: 'load-template',
            template: this.file,
            tab: this.tab,
            parameters: JSON.stringify(parameters)
        }), {
            cache: "no-store"
        }).then((response) => {
            if (response.ok) {
                return response.text();     // <template>###<content>
            }
            return '###'                     // No valid template ...

        }).then((html) => {

            let [template, content] = html.split('###')
            if (template) {

                current.#template_completion(template)
                //load content.
                current.container.innerHTML = content;

                // Step 4 : Check if we need to open some tab
                if (null !== current.tab) {
                    dsb.ui.show_tab(current.tab)
                }
            } else {
                Template.page_404(current.container?.dataset?.templateId, this.file)
            }
            current.loaded = true

            Template.load_all_templates(this.container)
            this.loaded_animation(true)

            Template.add_template_to_list(current)

            return true;
        }).catch((error) => {
            console.error('Error:', error);                     // Print or not print ?
        })

    }

    /**
     * If the template is a directory, we need to add /index at the end in order to keep the template event working
     *
     * @param template
     */
    #template_completion(template) {
        if (template.includes('.php')) {
            template = template.slice(0, template.length - 4) // remove .php
            let origin = dsb.utils.path_info(this.file).name
            let from_php = dsb.utils.path_info(template).name

            // If the file name is not the same, the origin template was a directory
            // so we save it and change the template file
            if (origin !== from_php) {
                this.directory = this.file
                this.file += `/${from_php}`
            }

            // If we have /pages/, we remove it
            if (this.directory.includes(this.#page_path)) {
                this.directory = this.directory.replace(this.#page_path, '')
            }
        }
    }

    /**
     * Fix template file (ie tab and file) when we try to laod nothing to #content#
     *
     * @return {*}
     *
     */
    #fix_template = () => {
        if (this.is_content && this.file === '') {
            // 2 possibilities : app home page or dedicated pages ('/pages/....')
            const pathname = location.pathname

            if (!this.#check_exception(pathname)) {

                if (pathname.includes(this.#page_path)) {
                    // Redirection to /pages/xxxx
                    this.check_link(pathname)
                } else if (pathname.includes('/home')) {
                    this.check_link(Template.get_home())
                } else {
                    // Redirection to home
                    this.check_link(Template.get_home())
                }

            }
            return {file: this.file, tab: this.tab}
        }
    }

    dispatchEvents = (type, file = this.file, directory = this.#directory) => {

        let generic_event = new Event(`${type}`)
        generic_event.template = this;
        document.dispatchEvent(generic_event)
        Template.event.emit(type, this);

        // template event if it is a reserved template
        if (this.is_reserved) {
            Template.event.emit(`${type}/${this.ID}`, this);
            let load_event = new Event(`${type}/${this.ID}`)
            load_event.template = this
            document.dispatchEvent(load_event)
        }

        if (file === null) {
            return
        }

        // add some cleaning
        file = file.startsWith('/') ? file.substring(1) : file
        file.replace('//', '/')

        // Specific event
        let load_event = new Event(`${type}/${file}`)
        load_event.template = this
        document.dispatchEvent(load_event)
        Template.event.emit(`${type}/${file}`, this);

    }

    /**
     * Check if there is an animation with this template
     *
     * @return  boolean
     *
     */
    animate = () => {
        return (this.is_reserved || this.#dom.animate)
    }

    /**
     * Check if there is an animation with this template
     *
     * @return  boolean true if there is an animation or
     *                  if it is the content template which have always an animation
     *
     */
    animation_type = () => {
        return ('loader' || this.#dom.animation_type)
    }

    /**
     * Start the animation for this template (if there is one)
     *
     */
    loading_animation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.loading)
        if (this.animate()) {
            this.animation.loading(this.ID)
        }
    }

    /**
     * Stop the animation for this template  (if there is one)
     *
     */
    loaded_animation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.loaded)
        if (this.animate()) {
            this.animation.loaded(this.ID)
        }
    }

    /**
     * Stop the animation for this template  (if there is one)
     *
     */
    unload_animation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.unload)
        if (this.animate()) {
            this.animation.unloading(this.ID)
        }
    }

}

export {Template}
