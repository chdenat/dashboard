/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Block.js                                                                                                    *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 28/06/2023  20:03                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {Animation} from 'Animation'
import {Bus as BlockEvent} from 'Bus'
import {nanoid} from 'nanoid'
import {DashboardUI as UI} from 'DashboardUI'

let blocksList = [];

class Block {

    static #HOME = ''
    static #EXCEPTIONS = []
    static #reserved = ['menu', 'content', 'pop-content']    // Special templates
    static #use404 = false
    static event = BlockEvent
    static #TAG = 'BLOCK'
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
    #defer;
    nofile;

    /**
     *
     * @param element could be an HTMLElement or a string
     *                If it is a string, it should be the data-template-id value
     *
     * @param variable add to template file.
     *                when the template file is 'xxxx/yyyyy'        ==> we check this as template file, no variable
     *                when the template file is 'xxxx/yyyyy[zzz]'   ==> we check 'xxxx/yyyyy' as template file, zzz as
     *     variable
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

        if (element && element.dataset.template !== undefined) {
            this.#ID = element.dataset.templateId ?? '#' + nanoid()
            this.#defer = (element.getAttribute('defer') != undefined)

            // file  or data-template info
            this.checkLink4Tab(file ?? element.dataset.template)

            // Then save it in DOM
            if (file) {
                element.setAttribute('data-template', file)
            }

            // Block file could be
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

            this.nofile = this.file === '' || this.file === null

            this.#dom = {
                container: element,
                defer: this.#defer,
                forced: element.dataset.templateForced ?? false,        // data-template-forced
                animate: element.dataset.animationType ?? false,         // data-animation-load
                animation_type: element.dataset.animationType ?? null,  // data-animation-type
            }

            this.#load = false
            this.#parent = element.parentElement?.closest('[data-template]')

            this.children

            // we push ID to the DOM element
            element.setAttribute('data-template-id', this.#ID)


            // Load Status Observer use d to load the right events
            this.load_status_observer = new MutationObserver(this.loadStatusObserver)

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
        let parent = this.#dom.container ?? document.body
        Block.getFirstLevelEmbeddedBlocks(parent).forEach(child => {
            let tmp = new Block(child)
            Block.addBlockToList(tmp)
            this.#children.push(tmp)
        })
    }

    get is_reserved() {
        return Block.#reserved.includes(this.ID.replace(/#/g, '',))
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

    get sameFile() {
        return this.#file === this?.#old
    }

    get container() {
        return this.#dom.container
    }

    get defer() {
        return this.#defer
    }

    set defer(value) {
        this.#defer = false;
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

    static setHome(home) {
        Block.#HOME = home
    }

    static getHome(last = false) {
        if (!last) {
            return Block.#HOME
        } else {
            return Block.#HOME.split('/').pop()
        }
    }

    static setExceptions(list) {
        Block.#EXCEPTIONS = list
    }

    static getExceptions() {
        return Block.#EXCEPTIONS
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
    static page404 = (template_id, url) => {
        let t = new Block(document.querySelector(`[data-template-id="${template_id}"]`))

        if (t.is_content && !Block.#use404) {
            return
        }

        t.checkLink4Tab(`${t.#page_path}404`)
        t.load(true, {url: url}).then(() => Block.use404())


    }

    static use404 = (use = true) => {
        Block.#use404 = use
    }

    static doWeUse404 = () => {
        return Block.#use404
    }

    /**
     * Manage template loading when it comes from an event.
     * Links must be bound to same managed template
     *
     * This function should be launch using addEventListener
     * @param event
     */
    static async loadBlockFromEvent(event) {

        // We check if the link has been bound to a reserved template
        for (const item in event.currentTarget.dataset) {
            if (this.#reserved.includes(item)) {
                // If it s the case, lets'go
                let template = Block.getBlock(`#${item}#`)

                if (undefined !== template) {


                    // save old...
                    template.historize = template

                    // And now we work on the new content, we push the file and tab
                    template.checkLink4Tab(event.currentTarget.getAttribute('href'))

                    let force = true
                    // Same file  : De we force a loading?
                    if (template.sameFile) {
                        force = event.target.dataset.forceReload ?? false
                        // If reload not forced, we do nothing and say bye
                        if (!force) {
                            template.loaded = true
                        }
                    }

                    // The events com from the menu, so, add an animation if it's only a tab template.
                    if (!template.is_content) {
                        Animation.loading('#content#')
                    }

                    let parameters = {}
                    let href = event.currentTarget.getAttribute('href')
                    // if data-allow-back is present, we inform the block by passing the caller
                    let caller = null
                    if (event.currentTarget.hasAttribute('data-allow-back')) {
                        href = new URL(event.currentTarget.baseURI).pathname
                        parameters.caller = href
                    }

                    await template.loadPage(force, parameters)

                    // save file information
                    template.#dom.container.setAttribute('data-template', template.file)

                    //Add breadcrumbs
                    UI.setBreadcrumbs(href)
                    // Add Title
                    UI.setTitle(href)

                }

                event.preventDefault(); // Cancel the native event
                return false
            }
        }
        Animation.loaded('#content#')
    }

    /**
     * Load Blocks (only 1st level)
     *
     * @param parent root (document by default)
     */
    static importChildren = async function (parent = document) {
        let blocks = Block.getFirstLevelEmbeddedBlocks(parent)
        if (blocks.length > 0) {
            let children = []
            for (const block of blocks) {
                let element = Block.addBaseToTemplate(block)
                let item = new Block(element)
                children.push(item)
            }
            for (const block of children) {
                block.loadPage(true).then(async (ok) => {
                    if (ok) {
                        await block.importDeferredBlock()
                    }
                })
            }
        }
    }

    static addBaseToTemplate = (block) => {
        if (block.dataset?.templateId === '#content#') {
            // In case it is  the content block, we push the baseUri or home if nothing
            const base = (block.dataset.template === '') ? (block.baseURI ? block.baseURI : Block.getHome()) : block.dataset.template
            block.setAttribute('data-template', dsb.utils.path_info(base).file)
        }
        return block
    }

    static importPageController = async (template) => {
        let parts = template.file.split('/')
        if (parts[parts.length - 1] === 'index') {
            parts.pop()
        }
        return dsb.instance.importPageController(parts.pop(), template)
    }

    /**
     * For a dedicated node, find the first elements of type #TAG in each node.
     *
     * - node - tag#1
     *   node - node -tag#2
     *   node - tag#3 - tag#4
     *
     *   It retrieves : tag#1,tag#2,tag#3
     *
     *
     * @param node  the node element
     * @param tag   the tag to search on (#TAG by default)
     *
     *
     * @returns {NodeListOf<Element> | NodeListOf<SVGElementTagNameMap[keyof SVGElementTagNameMap]> |
     *     NodeListOf<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>}
     *
     * @since 1.6
     *
     */
    static getFirstLevelEmbeddedBlocks = (node = document, tag = Block.#TAG) => {
        const all = node.querySelectorAll(`:scope ${tag}`)
        const parents = node.querySelectorAll(`:scope ${tag} ${tag}`)
        return Array.from(all).filter(x => !Array.from(parents).includes(x))
    }

    /**
     * Add a template to the DOM list
     *
     * @param template
     */
    static addBlockToList = (block = this) => {
        blocksList[block.ID] = block
    }

    /**
     * Delete a template from the DOM list
     *
     * @param key  key could be a template ID or a template object
     */
    static removeBlockFromList = (key = this) => {
        let id = key
        if (key instanceof Block) {
            id = key.ID
        }
        blocksList.forEach((item, index) => {
            if (index === id) {
                blocksList.splice(index, 1);
            }
        })
    }

    /**
     * Set a block by getting the item in the list
     *
     * @param key
     * @returns {*}
     */
    static getBlock = (key) => {
        return blocksList[key]
    }

    static async reloadPage() {
        let t = new Block(document.querySelector('[data-template-id="#content#"]'))
        t.loadingAnimation()
        await t.load(true)
        // await Block.importChildren(t.container)
        t.loadedAnimation()
    }

    static reload_page(soft = true) {
        if (soft) {
            Block.importChildren()
            return
        }
        location.reload()
    }

    /**
     * Load all templates with tag defer
     */
    importDeferredBlock = async () => {
        for (const block of this.container.querySelectorAll("[defer]")) {
            let template = new Block(block)
            template.defer = false
            await template.load(true)
        }
        return true
    }

    /**
     * Reset the defer value frome the one saved during the template creation
     */
    #resetDefer = () => {
        this.#defer = this.#dom.defer
    }

    hasDirectory = () => {
        return this.directory !== ''
    }

    hasTab = () => {
        return this.tab !== ''
    }

    /**
     * Check if a string is an exception
     *
     *
     * @return {boolean}
     * @param text
     */
    #isException = (text) => {
        let is_exception = false;
        for (let exception in Block.getExceptions()) {
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

    checkLink4Tab = (link) => {
        let tmp = link.split('#');
        this.#file = tmp[0]
        this.#tab = tmp[1] ?? '';
    }

    /**
     * Load a block
     *
     * if the template target is #content#, let init the page
     * else load olly defer
     *
     * @param force
     * @return {Promise<boolean>}
     */
    loadPage = async (force, parameters = {}) => {
        let value = true
        // Load the link content in the right template
        if (this.is_content && !this.nofile) {
            Block.importPageController(this)
                .then(result => {
                    // Once the page  has been loaded, it's time to initalise the page,
                    // if the required method exists
                    if (result.success) {
                        this.load(force, parameters).then((ok) => {
                            if (ok) {
                                this.importDeferredBlock().then((ok) => {
                                    if (ok) {
                                        if (!result.message && result.page['pageInitialisation']) {
                                            result.page.pageInitialisation()
                                        }
                                    } else {
                                        value = false
                                    }
                                })
                            } else {
                                value = false
                            }
                        })
                    }
                })
                .catch(error => {
                    console.error(error.message)
                    value = false
                })
        } else {
            this.load(force).then((ok) => {
                if (ok) {
                    this.importDeferredBlock(ok => {
                        value = ok
                    })
                } else {
                    value = false
                }
            })
        }
        return value
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
     * Block are loaded only if
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

        if ((!this.is_content && this.nofile) || this.#defer) {
            return false
        }

        /**
         *  @since 1.1.0
         */
        this.parameters = parameters

        /**
         * @since 1.6.0
         */
        if (this.parameters.length === 0) {
            // Lets try to see if we have embedded parameters (declared in json)
            if (this.#dom.container.dataset?.parameters) {
                this.parameters = JSON.parse(this.#dom.container.dataset?.parameters)
            }
        }
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
            this.#resetDefer()
            return true
        }

        /**
         * We observe the change on block
         */
        this.observeLoadStatus()

        /**
         * We get the actual '#content#' template in order to apply the unload event
         */

        if (!this.sameFile) {
            if (null !== this?.#old) {
                this.unloadAnimation(true)
                Block.event.emit(`template/unload/${this?.#old}`.replace('//', '/'))
            }
        }

        /**
         * OK, all is ready to
         * We start to load the template
         */

        // Step 1 : Dispatch loading event
        this.loadingAnimation(true)


        // Step 2 : run animation


        let current = this
        // Step 3 : Load the template using ajax and children if there are some
        await fetch(dsb_ajax.get + '?' + new URLSearchParams({
            action: 'load-template',
            template: this.file,
            tab: this.tab,
            parameters: JSON.stringify(this.parameters)
        }), {
            cache: "no-store"
        }).then((response) => {
            if (response.ok) {
                return response.text();     // <template>###<content>
            }
            return '###'                     // No valid template ...

        }).then(async (html) => {

            let [template, content] = html.split('###')
            if (template) {

                current.#templateCompletion(template)
                //load content.
                current.container.innerHTML = content;

                // Step 4 : Check if we need to open some tab
                if (null !== current.tab) {
                    dsb.ui.show_tab(current.tab)
                }
            } else {
                Block.page404(current.container?.dataset?.templateId, this.file)
            }
            current.loaded = true

            await Block.importChildren(current.container)

            Block.addBlockToList(current)

        }).catch((error) => {
            console.error('Error:', error);                     // Print or not print ?
        })

        this.loadedAnimation(true)
        this.#resetDefer()

        return true
    }

    /**
     * If the template is a directory, we need to add /index at the end in order to keep the template event working
     *
     * @param template
     */
    #templateCompletion(template) {
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

            if (!this.#isException(pathname)) {

                if (pathname.includes(this.#page_path)) {
                    // Redirection to /pages/xxxx
                    this.checkLink4Tab(pathname)
                } else if (pathname.includes('/home')) {
                    this.checkLink4Tab(Block.getHome())
                } else {
                    // Redirection to home
                    this.checkLink4Tab(Block.getHome())
                }

            }
            return {file: this.file, tab: this.tab}
        }
    }

    dispatchEvents = (type, file = this.file, directory = this.#directory) => {

        let generic_event = new Event(`${type}`)
        generic_event.template = this;
        document.dispatchEvent(generic_event)
        Block.event.emit(type, this);

        // template event if it is a reserved template
        if (this.is_reserved) {
            Block.event.emit(`${type}/${this.ID}`, this);
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
        Block.event.emit(`${type}/${file}`, this);

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
    loadingAnimation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.loading)
        if (this.animate()) {
            this.animation.loading(this.ID)
        }
    }

    /**
     * Stop the animation for this template  (if there is one)
     *
     */
    loadedAnimation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.loaded)
        if (this.animate()) {
            this.animation.loaded(this.ID)
        }
    }

    /**
     * Stop the animation for this template  (if there is one)
     *
     */
    unloadAnimation = () => {
        this.container.setAttribute('data-load-status', Animation.classes.unload)
        if (this.animate()) {
            this.animation.unloading(this.ID)
        }
    }

}

export {Block}