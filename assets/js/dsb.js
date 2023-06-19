/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : dsb.js                                                                                                      *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 19/06/2023  18:39                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from 'Block'
import * as bootstrap from 'bootstrap'
import {Bus as DSBEvent} from 'Bus'
import {Dashboard} from 'Dashboard'
import {DashboardWCManager} from 'DashboardWCManager'
import {LocalDB} from 'LocalDB'
import {customAlphabet} from 'nanoid'
import {Session} from 'Session'
import {Toaster} from 'Toaster'
import {Transient} from 'Transient'
import {User} from 'User'
import {Responsive} from 'Responsive'

//import {OverlayScrollbars} from 'overlayscrollbars' // keep lwercase

await import ('sprintf')

const nanoid = customAlphabet('1234567890', 6)

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export {SECOND, MINUTE, HOUR, DAY}

var dsb = {

    content_event: DSBEvent,

    add_instance(instance) {
        dsb.instance = new Dashboard(instance)
    },
    instance: null,

    // app information
    page: {
        main_title: 'Dashboard',

        /**
         * Set page title
         *
         * @param title if set, page title is "MAIN : title" else (default) it is "MAIN"
         *
         * @since 1.0
         */
        set_title: (title = null) => {
            if (title === null) {
                document.title = dsb.page.main_title
                return
            }

            document.title = `${dsb.page.main_title}: ${title}`
        },

        setBreadcrumbs: (item) => {

            const path = dsb.utils.findPath(dsb.menu.json, item.getAttribute('href'))
            let current = dsb.menu.json
            let breadcrumb = []

            path.forEach(child => {
                current = current[child]
                if (current.text !== undefined) {
                    let text = current.text
                    // If there is some translation, get it instead
                    if (current.lang && current.lang[dsb.ui.get_lang()]) {
                        text = current.lang[dsb.ui.get_lang()]
                    }
                    breadcrumb.push(text)
                }
            })
            // Show Text
            document.getElementById('breadcrumbs').innerHTML = '<i class="fa-regular fa-house"></i>'
                + breadcrumb.join('<i class="fa-regular fa-chevron-right"></i>'
                )

        },

        /**
         * History management from link on menu
         *
         * Add the url in the browser history
         *
         * @param item
         *
         * @since 1.0
         *
         */
        add_to_history_from_menu: (item) => {
            let href = item.getAttribute('href')
            href = href.startsWith('/') ? href : '/' + href
            history.pushState({
                title: document.title,
                full: href,
            }, dsb.menu.item_text(item), href)
        },

        /**
         * Add  History management from a tab
         *
         * Add the url in the browser history
         *
         *
         * @since 1.0
         *
         * @param page_title
         * @param full
         * @param url
         */
        add_to_history: (page_title, full, url) => {
            let href = url.startsWith('/') ? url : '/' + url
            history.pushState({
                title: page_title,
                full: full,
            }, page_title, href)
        },

        /**
         * History management
         *
         * @param event
         */
        show_history_item: (event) => {
            let url = location.href
            if (!event) {
                url = '/home'
            }
            if (event.state === null) {
                url = '/home'
            } else {
                url = event.state.full ?? '/home'
            }

            location.href = url
        },

        /**
         * Try to retrieve the right page in the history and isplay it.
         *
         * @since 1.0
         */
        init: () => {
            try {
                window.onpopstate = (event) => setTimeout(dsb.page.show_history_item, 0, event)
            } catch (e) {
                console.error(e)
            }
        },
    },

    menu: {

        template_id: '#menu#',
        pathname: null,
        current_roles: [],
        json: null,
        openClass: 'openItem',

        change_id: (new_id) => {
            dsb.menu.template_id = new_id
        },

        /**
         * Check the URL to find if it exists in the menu.
         * If it exists (or something similar)
         * and open the menu accordingly.
         *
         * If nothing found, we open the default
         *
         *
         * @param template
         * @param pathname
         */
        synchronize: (template, pathname = '') => {
            dsb.menu.change_id(template.ID)

            dsb.menu.read_json().then(data => {
                // If there is no pathname, we use the window location
                if (pathname === '' || pathname === null) {
                    pathname = `${window.location.pathname}${window.location.hash}`
                }
                let origin = pathname
                pathname = dsb.menu._clean_path(pathname)

                let found = false               // found in the menu
                let found_with_role = false     // found with a specific role if not in menu
                let item = {}

                // We try as is,then without hash and finally without index.
                for (let key of [' ', '#', 'index']) {
                    pathname = pathname.split(key)[0]
                    // Some entry in the menu ?
                    item = document.querySelector(`[data-template-id="${template.ID}"] a[data-level*="menu-item-"][href*="${pathname}"]`)
                    if (null !== item) {
                        // Yes, so we clean and check it
                        if (pathname === dsb.menu._clean_path(item.getAttribute('href').split(key)[0])) {
                            found = true
                            break
                        }

                    } else if (!dsb.session.active()) {
                        // Nothing... May be the user need to be logged in to see this item in the menu ...
                        found_with_role = dsb.menu.find_items_with_roles(dsb.menu.json.menu, 'href', pathname, dsb.menu.all_roles(), true).length > 0

                    }
                    if (found || found_with_role) {
                        break
                    }
                }

                if (!found) {
                    if (!found_with_role) {
                        // Nothing with role
                        //  we try to open the default if it is / | /home => pathname = null | home
                        if (pathname === '' || pathname === 'home') {
                            item = document.querySelector(`[data-template-id="${template.ID}"] a[data-level*="menu-item"][data-default-page]`)
                            if (null !== item) {
                                found = true
                            }
                        }
                    } else {
                        // We find an entry with the role : we load the modal and pass some parameters
                        dsb.menu.pathname = pathname
                        dsb.modal.load('login-form', {template: template, pathname: pathname})
                        dsb.modal.show()
                        return
                    }
                }
                // If we found something, we'll open the right menu
                // else we redirect to 404.
                if (found || found_with_role && item) {
                    let levels = item.dataset.level.split('-')
                    let id = 'menu-item-'
                    levels.slice(2).forEach(level => {  // remove the 2 first, 'menu' and 'item'
                        id += level
                        // try to click on item defined as href=#<level-x-x>
                        let item = document.querySelector(`[href="#${id}"]`)
                        // or id= <level-x-x>
                        if (null === item) {
                            item = document.querySelector(`[data-level=${id}]`)
                        }

                        // Click on
                        let link = item.getAttribute('href')
                        if (link.startsWith('#menu')) {
                            // Menu section : we click to open it.
                            item.click()
                        } else {
                            // Menu item : we do not click but simulate
                            dsb.menu.click(item, true)
                            dsb.ui.show_tab(Block._check_link(link).tab)
                        }
                        id += '-'

                    })
                } else {
                    Block.page404('#content#', origin)
                }
            })
        },

        /**
         * Get all roles
         */
        all_roles: () => {
            return ['logged', 'admin']
        },

        /**
         * Find a key and/or value in a nested object
         *
         * => from https://www.tutorialspoint.com/deep-search-json-object-javascript
         *
         * @return {{}|*}
         * @param obj
         * @param key
         * @param value
         * @param roles
         * @param single
         */
        find_items_with_roles: (obj = {}, key, value, roles = []) => {
            const result = []
            let used_roles = {}
            const recursive = (obj = {}) => {
                if (!obj || typeof obj !== 'object') {
                    return
                }
                // If no roles in input or no roles in data, search is enabled
                let search = roles.length === 0 || obj.roles === undefined

                if (obj?.roles !== undefined && roles.length > 0) {
                    // If there are some roles, we try to see if roles in data are
                    //  included in input roles
                    used_roles = obj.roles.filter(x => roles.includes(x))
                    search = used_roles.length > 0
                }

                // search is enabled
                if (search) {
                    // key and value match... OK we get'em

                    if (dsb.menu._clean_path(obj[key]) === dsb.menu._clean_path(value)) {
                        result.push({data: obj, roles: used_roles})
                    }
                    // Lets'trayt
                    Object.keys(obj).forEach(function (k) {
                        recursive(obj[k])
                    })
                }
            }
            // All starts here
            recursive(obj)
            return result
        },


        /**
         * Click on a menu item (in cascade, ie it opens all the hierarchy menu)
         * - mark it open
         * - display the url in the history
         *
         * @param item
         * @param historize  indicates if we need historization (default false)
         *
         * @since 1.0
         *
         */
        click: (item, historize = false) => {
            // it's the link ?  Manage history (and add url in the browser bar)
            if (item?.dataset?.level && !item.classList.contains(dsb.menu.openClass)) {
                // Mark new menu item open
                document.querySelector(`.${dsb.menu.openClass}[href]`)?.classList.remove(dsb.menu.openClass)
                item.classList.add(dsb.menu.openClass)
                // change title
                dsb.page.set_title(dsb.menu.item_text(item)) //TODO change
                dsb.page.setBreadcrumbs(item)

                if (historize) {
                    dsb.page.add_to_history_from_menu(item)
                }
            }

            // On responsive mode, each click collapse the menu
            if (Responsive.isSmallDevice()) {
                dsb.menu.collapse()
            }
            return false
        },

        toggleCollapse: () => {
            let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
            document.body.classList.toggle('menu-collapsed')
            menu.toggle()

        },

        unCollapse: () => {
            let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
            document.body.classList.remove('menu-collapsed')
            menu.show()
        },
        collapse: () => {
            let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
            document.body.classList.add('menu-collapsed')
            menu.hide()
        },

        /**
         * Get the text from the menu item
         *
         * @param item
         * @return {*}
         *
         * @since 1.0
         *
         */
        item_text: (item) => {
            return item?.innerText
        },

        /**
         * Suppress / at both first and end
         *
         * @param path
         * @return path
         *
         * @private
         */
        _clean_path: (path) => {
            if (path) {
                if (path.startsWith('/')) {
                    path = path.substring(1)
                }
                if (path.endsWith('/')) {
                    path = path.substring(0, path.length - 1)
                }
            }
            return path
        },

        update: () => {
            let id = dsb.session.context?.referrer
            if (id) {
                let item = id.split(/(level-[0-9]+)/gm)
            }
        },

        read_json: async () => {
            if (dsb.menu.json === null) {
                await fetch((dsb_ajax.get) + '?' + new URLSearchParams({
                    action: 'read-json-menu',
                })).then(function (response) {
                    return response.json()
                }).then(function (data) {
                    dsb.menu.json = data
                }).catch((error) => {
                    console.error('Error:', error) // Print or not print ?
                })
            }
            return dsb.menu.json
        },

        /**
         * Menu Initialisation
         *
         * @since 1.0
         *
         */
        init: async (block) => {
            /**
             *
             * Read JSON menu
             *
             * @since 1.0
             *
             */

            await dsb.menu.read_json()

            let menu_container = document.getElementById('menu-container')

            // We trap a specifi event on menu items click to instantiate the collapse/uncollapse
            dsb.content_event.on('click', (item) => {
                dsb.menu.click(item, true)
            })

            /**
             * Close/open all 1st level menu
             */
            let all_open = false
            menu_container.querySelector('#menu-container .dsb-collapse-vertical')?.addEventListener('click', (event) => {
                all_open = !all_open
                event.preventDefault()
                menu_container?.querySelectorAll(`#menu-container  #menu-wrapper a[data-bs-toggle="collapse"][aria-expanded="${!all_open}"]`).forEach((element) => {
                    let item = bootstrap.Collapse.getOrCreateInstance(menu_container.querySelector(element.getAttribute('href')))
                    if (all_open) {
                        item?.show()
                    } else {
                        item?.hide()
                    }
                })
            })

            dsb.menu.update()

        },
    },

    /**
     * template management
     */
    template: {

        init: () => {
            // During the init phase, we do not use the 404 redirection
            Block.use404(false)

            // When a template has been loaded, we register specific actions
            Block.event.on('template/loaded', dsb.template.genericLoadedEvent)

            // Import all the children
            Block.importChildren()

        },

        /**
         * This method emits some events that cousl be managed in blocks
         */
        genericLoadedEvent: (template => {
            /**
             * Let open links in content if required (for a tags with data-content attributes)
             */
            template.container.querySelectorAll('a[data-content]').forEach(item => {

                item.addEventListener('click', event => {
                    event.preventDefault()
                    Block.loadBlockFromEvent(event).then(() => {
                        dsb.content_event.emit('click', item)
                    })
                })

            })
            /**
             * Here is the case we need to open in content pseudo-modal
             */
            template.container.querySelectorAll('a[data-content-modal]').forEach(item => {
                item.addEventListener('click', dsb.ui.show_intermediate_content)
            })

            /**
             * Let's manage the select boxes and transform them into Choices Element.
             *
             * Selects are ignored if they use 'not-auto-choice's class
             *
             */
            template.container.querySelectorAll('select:not(.not-auto-choices)').forEach(select => {
                if (!select.hasAttribute('id')) {
                    select.id = nanoid()
                }

                let limit = select.dataset.limit ?? -1
                let search = select.dataset.search ?? false

                dsb.ui.lists[select.id] = new Choices(select, {
                    itemSelectText: '',
                    silent: true,
                    allowHTML: true,
                    shouldSort: false,
                    searchEnabled: search,
                    renderChoiceLimit: limit,
                })
            })

            /**
             * Manage Lang Switcher, ei a select box with 'lang-list' class
             *
             */
            dsb.ui.current_lang = dsb.ui.get_lang()
            template.container.querySelectorAll('select.lang-list').forEach(select => {

                if (!select.hasAttribute('id')) {
                    select.id = nanoid()
                }
                const select_lang = ({classNames}, data) => {
                    const CC = data.value.split('_')[1].toLowerCase()
                    return (`          <div class="${classNames.item} ${classNames.itemChoice} ${
                        data.disabled ? classNames.itemDisabled : classNames.itemSelectable
                    }" data-choice ${
                        data.disabled
                            ? 'data-choice-disabled aria-disabled="true"'
                            : 'data-choice-selectable'
                    } data-id="${data.id}" data-value="${data.value}" ${
                        data.groupId > 0 ? 'role="treeitem"' : 'role="option"'
                    } title="${data.label}"><i lang="${data.value}" class="fi fis fi-${CC}"></i></div>`)
                }

                dsb.ui.lists[select.id] = new Choices(select, {
                        searchEnabled: false,
                        allowHTML: true,

                        callbackOnCreateTemplates: function (template) {
                            return {
                                item: ({classNames}, data) => {
                                    return template(select_lang({classNames}, data))
                                },
                                choice: ({classNames}, data) => {
                                    return template(select_lang({classNames}, data))
                                },
                            }
                        },
                    },
                )
            })

            /**
             * Add scrolling
             *
             */
            dsb.ui.add_scrolling(template.container)

            /**
             * We can display 404 errors
             */
            Block.use404()

        }),

    },

    /**
     * Toast management
     */
    toast: {
        /**
         *
         * @param title        of the toast
         * @param message      content of the toast
         * @param buttons
         * @param type         any bootstrap type. Depending on the type, different icons are shown.
         * @param delay        Default to 3 seconds, To set it to permanent use 0
         * @param hide          autohide = true, permanent = false
         *
         * @return HTMLElement
         * @since 1.0
         *
         */
        message: function ({
                               title = '',
                               message = '',
                               template = null,
                               buttons = null,
                               type = null,
                               delay = null,
                               hide = true,

                           }) {

            let text, icon
            const toast_type = type ? eval(`Toaster.type.${type.toUpperCase()}`) : null

            switch (type) {
                case 'success':
                    icon = 'fas fa-check-circle'
                    break
                case 'danger':
                    icon = 'fas fa-bomb'
                    break
                case 'warning':
                    icon = 'fas fa-exclamation-triangle'
                    break
                default:
                    icon = 'fas fa-bell'
            }

            let html = ''
            //Buttons can be an array of objects { id,href,text } or a string
            if (buttons instanceof Array) {
                buttons.forEach(button => {
                    html += `<a id="${button.id}" class="btn btn-%TYPE%" href="${button.href}">${button.text}</a>`
                })
            } else {
                html = buttons
            }

            let options = {
                icon: `<i class="${icon} %TYPE%"></i>`,
                texts: {},
            }

            options.type = toast_type
            options.delay = delay
            options.buttons = html
            options.template = template

            return dsb.toast.toaster.create(title, message, options)
        },


        /**
         * Initialisation of the toast object
         *
         * @returns {dsb.toast}
         *
         * @since 1.0
         */
        init: function (delay = 5000) {

            dsb.toast.toaster = new Toaster({
                position: Toaster.position.BOTTOM_END,
                delay: delay,
                template: `
<div class="toast fade text-bg-%TYPE%" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
        <span class="bs-toaster-icon d-flex">%ICON%</span>
        <strong class="bs-toaster-title me-auto">%TITLE%</strong>
        <small class="bs-toaster-timer text-muted">%TIMER%</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="bs-toaster-text toast-body">
        %TEXT%
        <div class="bs-toaster-buttons">%BUTTONS%</div>
    </div>
</div>
`,
            })
            return dsb.toast
        },
    },
    modal: {
        _element: null,
        _instance: null,
        _parameters: null,
        /**
         * Init user modal
         *
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        init: function () {
            this._element = document.querySelector('#dashboard-modal')
            this._dialog = this._element.querySelector('.modal-dialog')
            this._instance = new bootstrap.Modal(this._element, {focus: false})

            return this
        }

        ,

        /**
         * Show the user modal
         *
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        show: function () {
            this._instance.show()
            return this
        }
        ,

        /**
         * Hide the user modal
         *
         * @returns {dsb.modal}
         *
         * @dince 1.0
         *
         */
        hide: function () {
            this._instance.hide()
            return this
        }
        ,

        /**
         * Change the modal content
         *
         * @param html
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        message: function (html) {
            this._element.querySelector('.modal-content').innerHTML = html
            return this
        }
        ,

        /**
         * This function makes an Ajax call used to get the modal content
         *
         * @param action The ajax action name
         * @param params some params to send to Ajax
         * @param custom use DSB ajax or custom ajax
         *
         * @since 1.0
         *
         */
        load: function (action, params = {}, custom = false) {
            this._parameters = params
            this._parameters['action'] = action
            dsb.modal.resize()

            this._element.addEventListener('show.bs.modal', dsb.modal.loading_events)
            this._element.addEventListener('shown.bs.modal', dsb.modal.load_events)

            fetch(((custom) ? ajax.get : dsb_ajax.get) + '?' + new URLSearchParams({
                action: action,
                params: JSON.stringify(params),
            })).then(function (response) {
                return response.text()
            }).then(async function (html) {
                dsb.modal.message(html)
                await Block.importChildren(document.getElementById('dashboard-modal'))
                return true
            }).catch((error) => {
                console.error('Error:', error) // Print or not print ?
            })
        }
        ,

        /**
         * Load 2 specific events when the modal is laoding
         *
         */
        loading_events: () => {
            // Throw a  generic load event
            let generic = new Event('modal/loading')
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)

            // and a new specific running event
            let specific = new Event(`modal/loading/${dsb.modal._parameters.action}`)
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)

            Block.event.emit(`modal/loading/${dsb.modal._parameters.action}`, dsb.modal)

        },

        /**
         * Load 2 specific events when the modal has been shown
         *
         *
         */
        load_events: () => {
            // Throw a  generic load event
            let generic = new Event('modal/loaded')
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)
            // and a new specific running event

            let specific = new Event(`modal/loaded/${dsb.modal._parameters.action}`)
            specific.modal = dsb.modal
            specific.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(specific)

            Block.event.emit(`modal/loaded/${dsb.modal._parameters.action}`, dsb.modal)
        },

        /**
         * Add the possibility to resize a modal
         *
         * @param size = sm | node | lg | xl
         */
        resize: (size = '') => {
            let sizes = ['modal-xl', 'modal-lg', 'modal-sm']
            let _dialog = document.querySelector('#dashboard-modal .modal-dialog')
            _dialog.classList.remove(...sizes)
            if (size !== '') {
                _dialog.classList.add(`modal-${size}`)
            }
        },

    }
    ,

    /**
     * User session management
     *
     * @since 1.0
     *
     */
    session: new Session(),


    /**
     * User and Session management
     *
     * @since 1.2
     *
     */
    user: {
        init: async function () {
            dsb.user.person = new User()
            dsb.session = new Session()

            document.addEventListener('modal/loaded/login-form', dsb.ui.manage_password)
            document.addEventListener('modal/loaded/change-password', dsb.ui.manage_password)

        },
        logout: () => {
            dsb.user.person.logout()
        },
        login: () => {
            dsb.user.person.login()
        },


    },

    /**
     * Error management in a form (with .alert class)
     *
     * @since 1.0
     *
     */
    error: {
        _element: null,
        _instance: null,
        _dialog: null,
        /**
         * Init the alert
         *
         * @param selector
         * @returns {dsb.error|null}
         *
         * @since 1.0
         *
         */
        init: function (selector = 'form .alert') {
            if ('' === selector) {
                return null
            }
            this._element = document.querySelector(selector)
            return this
        }

        ,

        /**
         * Print the error message
         *
         * @param error
         * @param _element
         *
         * @returns {dsb}
         *
         * @since 1.0
         */
        message: function (error, _element = 'p span') {
            this._element.querySelector(_element).innerHTML = error
            this._element.classList.toggle('dsb-hide')
            return this
        },
    }
    ,

    /**
     * Dashboard management utilities
     *
     * @since 1.0
     *
     */
    utils: {

        kebab2Pascal: (kebab) => {
            return kebab.replace(/(^\w|-\w)/g, dsb.utils._clearAndUpper)
        },
        kebab2Camel: (kebab) => {
            return kebab.replace(/-\w/g, dsb.utils._clearAndUpper)
        },
        kebab2Snake: (kebab) => {
            return kebab.replace('-', '_')
        },
        _clearAndUpper: (text) => {
            return text.replace(/-/, '').toUpperCase()
        },

        findPath: (obj, target) => {
            function helper(obj, target, path) {
                if (typeof obj !== 'object' || obj === null) return null;
                for (const key in obj) {
                    const newPath = [...path, key];
                    if (obj[key] === target) return newPath;
                    const result = helper(obj[key], target, newPath);
                    if (result) return result;
                }
                return null;
            }

            return helper(obj, target, []);
        },

        /**
         * path info
         *
         * @param string
         *
         * @return {{ext: *, path: *, file: *, name: *}}
         */
        path_info: file => {
            let info = file.match(/(.*?\/)?(([^/]*?)(\.[^/.]+?)?)(?:[?#].*)?$/)
            return {path: info[1], file: info[2], name: info[3], ext: info[4]}
        },

        /**
         * Transform \r\n, \r,\n to <br>
         *
         * @param str to change
         * @returns string with the <br> inside
         *
         * @since 1.0
         *
         */
        nl2br: (str) => {
            if (null !== str) {
                if (str instanceof Object) {
                    str = str.toString()
                }
                return str.replace(/(\r\n|\r|\n)/gm, '<br>')
            }
        },

        /**
         * Copy a string to the clipboard
         *
         * @param text
         *
         * @since 1.0
         *
         */
        copy_to_clipboard: async (text) => {
            let result = true
            if (!navigator.clipboard) {
                let c = document.createElement('textarea')
                c.value = text
                c.style.maxWidth = '0px'
                c.style.maxHeight = '0px'
                c.style.position = 'fixed'  // Prevent scrolling to bottom of page in Microsoft Edge.
                document.body.appendChild(c)
                c.focus()
                c.select()
                try {
                    document.execCommand('copy')
                } catch (e) {
                    result = false
                } finally {
                    document.body.removeChild(c)
                }
            } else {
                try {
                    await navigator.clipboard.writeText(text)
                } catch (e) {
                    result = false
                }
            }
            return result
        },

        copy_canvas_to_clipboard(canvas) {
            canvas.toBlob(function (blob) {
                const item = new ClipboardItem({'image/svg': blob})
                navigator.clipboard.write([item])
            })
        },

        /**
         * Export content to a file
         *
         * @param content
         * @param file
         */

        export_to_file: (content = '', file = 'sample.txt') => {
            const link = document.createElement('a')
            const blob = new Blob([content], {type: 'text/plain'})
            link.href = URL.createObjectURL(blob)
            link.download = file
            link.click()
            URL.revokeObjectURL(link.href)
        },

        /**
         * Download a file
         *
         * @param file              file URL
         * @param filename          file name
         *
         * @since 1.0
         *
         */
        download(file, filename = null) {
            let link = document.createElement('a')
            link.setAttribute('href', file)
            if (null !== filename) {
                link.setAttribute('download', filename)
            }
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
        ,

        /**
         * Sleep
         *
         * Call as 'await dsb.utils.sleep(duration)'
         *
         * @param   timer   time in milliseconds
         *
         * @since 1.0
         *
         */
        sleep: timer => {
            new Promise(r => setTimeout(r, timer))
        },

        /**
         * format a number
         *
         * @param value     value to format
         * @param digits    number of digits
         * @param type      type/unit
         *
         * TODO get locale.
         *
         * @since 1.0
         *
         */
        format: (value, digits = 0, type = null) => {

            value = dsb.utils.transform(value)

            switch (type) {
                case '%':
                    value = (Number(value)) * 100
                    break
            }

            if (0 === digits) {
                value = Math.floor(value)
            }


            // Else try to format accordingly
            let locale = 'en'
            return Number(value).toLocaleString(locale, {minimumFractionDigits: digits, maximumFractionDigits: digits})
        },

        format_date_locale_ISO: ({date, timezone = null, with_hour = true}) => {
            let d = date.toLocaleString('sv', {timezone: timezone}).slice(0, 16).replace(' ', 'T')
            return with_hour ? d : d.slice(0, 10)
        },


        /**
         * transform the value (change , to .)
         *
         * @param value     value to format
         *
         * @since 1.0
         *
         */
        transform: (value) => {
            if (typeof value === 'string') {
                value = parseFloat(value.replace(',', '.'))// In case we're in french format
            }
            return value
        },

        /**
         * Transform any 'number' in the right units according a transform weigth
         *
         * @param number        to transform
         * @param transform     weight; ie the divider   (1000 id number in bytes, else 1024) [1000]
         * @returns {string}    the transformation with the right units
         *
         * @since 1.0
         *
         */
        niceBytes: (number, transform = 1024) => {
            const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            let l = 0, n = parseInt(number, 10) || 0
            while (n >= transform && ++l) {
                n = n / transform
            }
            return (n.toFixed(n < 10 && l > 2 ? 2 : 2) + ' ' + units[l])
        },

        /**
         * Get an object from a namespaced string (ie a.b.c), defined in a JS global variable
         * @param namespace
         * @param global
         * @returns {*}
         *
         * @since 1.0
         *
         */
        get_object_from_string: (namespace, global = window) => {
            // https://stackoverflow.com/questions/4981671/access-namespaced-javascript-object-by-string-name-without-using-eval
            return namespace.split('.').reduce(function (a, b) {
                if (typeof (a) == 'string') {
                    return global[a][b]
                }
                return a[b]
            })
        },


        /**
         * Remove a key from an array
         *
         * @param array the array
         * @param key   the key to remove from array
         *
         * @returns new array
         *
         * @cince 1.0
         *
         */
        remove_key: (array, key) => {

            let tmp = []
            for (let x in array) {
                if (x != key) {
                    tmp[x] = array[x]
                }
            }
            return tmp
        },

        /**
         * Return tri if object_or_array is empty (ie length = 0)
         *
         * @param object_or_array
         */
        is_empty: (object_or_array) => {
            if ('object' === typeof object_or_array) {
                return 0 === Object.keys(object_or_array).length
            }
            if (object_or_array.isArray()) {
                return 0 === object_or_array.length
            }
            return false

        },

        /**
         * Check if a file exists
         *
         * @return boolean
         *
         * @param file
         */
        file_exists: async file => {
            return await fetch(dsb_ajax.get + '?' + new URLSearchParams({
                action: 'file-exists',
                file: file,
            })).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText)
                }
                return response
            })
                .then(response => response.json())
                .then(data => data.exist)
                .catch(exception => undefined)
        },

        importWebComponents: (...webComponents) => {
            webComponents.forEach(webComponent => {
                let scriptTag = document.createElement('script');
                scriptTag.type = 'module';
                scriptTag.src = `/dashboard/assets/components/${webComponent}/${webComponent}.js`;
                document.getElementsByTagName('head')[0].appendChild(scriptTag);
            })
        }
    },
    /**
     * UI management
     *
     * @since 1.0
     *
     */
    ui: {
        backdrop: document.getElementById('dsb-backdrop'),
        check_lang: false,
        current_lang: null,
        new_lang: false,

        hide: (element) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.startsWith('#')) {
                    element = document.querySelector(element)
                    if (element === null) {
                        return dsb.ui
                    }
                }

                element.classList.add('dsb-hide')
                element.classList.remove('dsb-show')
                element.classList.remove('dsb-show-flex')
                element.classList.remove('dsb-show-inline-block')
                element.classList.remove('dsb-show-inline-flex')
                element.classList.remove('dsb-show-table-row')
            }
            return dsb.ui
        },

        show: (element, flex = true) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element?.includes('#')) {
                    element = document.querySelector(element)
                    if (element === null) {
                        return dsb.ui
                    }
                }

                element.classList.remove('dsb-hide')
                if (flex) {
                    element.classList.add('dsb-show-flex')
                } else {
                    element.classList.add('dsb-show')
                }
            }
            return dsb.ui
        },

        /**
         * Show element sibling.
         *
         * @param element
         * @param sibling
         *
         * @return dsb.ui
         */
        showSibling: (element, sibling = '*') => {
            if (!(element instanceof HTMLElement) && element?.includes('#')) {
                element = document.querySelector(element)
                if (element === null) {
                    return dsb.ui
                }
            }
            dsb.ui.show(element.parentElement.querySelector(sibling));
            return dsb.ui
        },

        show_block: (element) => {
            if (element !== null) {
                dsb.ui.show(element, false)
            }
            return dsb.ui
        },

        show_inline: (element, flex = true) => {
            if (element !== null) {
                element.classList.remove('dsb-hide')
                if (flex) {
                    element.classList.add('dsb-show-inline-block')
                } else {
                    element.classList.add('dsb-show-inline-flex')
                }
            }
            return dsb.ui
        },

        show_table_row: (element) => {
            if (element !== null) {
                element.classList.remove('dsb-hide')
                element.classList.add('dsb-show-table-row')
            }
            return dsb.ui
        },

        disable: (element) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.includes('#')) {
                    element = document.querySelector(element)
                }

                element.setAttribute('disabled', '')
            }
            return dsb.ui
        },

        enable: (element) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.includes('#')) {
                    element = document.querySelector(element)
                }

                element.removeAttribute('disabled')
            }
            return dsb.ui
        },

        manage_password: () => {
            document.querySelectorAll('.input-group.password .toggle-password').forEach(item => {
                item.addEventListener('click', dsb.ui.toggle_password)
            })
        },

        toggle_password: (event) => {
            const eye = event.currentTarget
            const password = document.querySelector(`[name="${event.currentTarget.dataset.password}"]`)
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password'

            password.setAttribute('type', type)
            eye.querySelector('.show-password').classList.toggle('dsb-hide')
            eye.querySelector('.hide-password').classList.toggle('dsb-hide')
        },

        /**
         *
         * @param tab
         *
         */
        show_tab: (tab) => {
            // If we have some BS tab, let's try to open it
            if ('' !== tab) {
                tab = dsb.ui.get_tab(tab)
                if (null != tab) {
                    dsb.ui.click(tab)
                }
            }
        },

        /**
         * Add shown and hidden events to a tab
         *
         * @param name the tab is designed by a name
         *            In HTML this name is combine with tab- to identify the tab pane
         *            ie : if tab = test we manage tab-test pane
         *
         *
         */
        add_tab_events: (name) => {

            let tab = dsb.ui.get_tab(name)
            if (null !== tab) {

                /**
                 * Add tab/shown/${tab} event when a tab becomes active
                 *                      tabs = {
                 *                          target   : the new active tab
                 *                          previous : the previous active tab
                 *                      }
                 */
                let dsb_shown_event = new Event(`tab/shown/${name}`)
                tab.addEventListener('shown.bs.tab', event => {
                    dsb_shown_event.tabs = {target: event.target, previous: event.relatedTarget}
                    tab.dispatchEvent(dsb_shown_event)
                    // If it is required, we change the URL hash
                    if (event.target.classList.contains('change-url')   // check the required class
                        && event.target?.dataset?.bsToggle === 'tab'      // it should be a tab
                        && window.location.hash) {                      // and the URL should contain #

                        // change the hash, the ural and put them in history
                        let hash = event.target?.dataset?.bsTarget?.split('#tab-')[1]
                        let url = window.location.href.replace(window.location.hash, '#' + hash)
                        let pathname = url.split(window.location.origin)[1]
                        dsb.page.add_to_history(document.title, url, pathname)
                        // change menu info to corresponding item
                        document.querySelector(`.${dsb.menu.openClass}[href]`)?.classList.remove(dsb.menu.openClass)
                        document.querySelector(`[href="${pathname}"]`)?.classList.add(dsb.menu.openClass)
                    }
                })

                /**
                 * Add tab/hidden/${tab} event when a tab becomes inactive
                 *                      tabs = {
                 *                          target : the inactive tab
                 *                          new    : the new active tab
                 *                      }
                 */
                let dsb_hidden_event = new Event(`tab/hidden/${name}`)
                tab.addEventListener('hidden.bs.tab', event => {
                    dsb_hidden_event.tabs = {target: event.target, new: event.relatedTarget}
                    tab.dispatchEvent(dsb_hidden_event)
                })

            }
        },

        /**
         * Add events to all tabs contained in a HTMLElement
         *
         * @param menu CSS selector that targets an HTML element
         *
         */
        add_tabs_events: (menu) => {
            dsb.ui.list_tabs(menu).forEach(tab => {
                dsb.ui.add_tab_events(tab)
            })
        },

        /**
         * List all tabs contained in a HTMLElement
         *
         * We get the elements with data-bs-toggle="tab"
         *    If data-bs-target = '#tab-<something>" we return <something>
         *                                      else we return the data-bs-target content
         *
         * @param element CSS selector that targets an HTML element
         *
         * @returns []
         *
         */
        list_tabs: (element) => {

            element = document.querySelector(element)

            if (null !== element) {
                let list = []
                element.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
                    let t = tab.dataset.bsTarget
                    if (t) {
                        let l = t.split('#tab-')
                        list.push(l[l[0] === '' ? 1 : 0])
                    }
                })
                return list
            }
            return []
        },

        /**
         * Retrieve the active tab contained in an HTMLElement
         *
         * We get the elements with data-bs-toggle="tab"
         *    If data-bs-target = '#tab-<something>" we return <something>
         *                                      else we return the data-bs-target content
         *
         * We also return an HTMLElement when return_dom set to true
         *
         * @param element CSS selector that targets an HTML element

         * @param return_dom  if true we return an HTMLElement else the tab name (default = false)
         *
         * @returns []
         *
         */
        get_tab_active: (element, return_dom = false) => {

            element = document.querySelector(element)
            if (null !== element) {
                let tab = element.querySelector('.active[data-bs-toggle="tab"]')
                if (return_dom) {
                    return tab
                }
                let t = tab?.dataset.bsTarget
                if (t) {
                    let l = t.split('#tab-')
                    return l[l[0] === '' ? 1 : 0]
                }
            }
            return null
        },

        /**
         * Get a tab with data-bs-target = "#tab-<name>"
         *
         * @param name
         * @returns {Element}
         *
         */
        get_tab: (name) => {
            return document.querySelector(`[data-bs-target="#tab-${name}"]`)
        },

        button_animate: (button, action) => {
            // Bail early
            if (button === null) {
                return
            }
            if (button instanceof PointerEvent) {
                button = button.target
            }

            switch (action) {
                case 'start':
                    button.classList.add('animation', 'doing')
                    dsb.ui.hide(button.querySelector('.animation.start')).show(button.querySelector('.animation.doing'))
                    break
                case 'stop':
                case 'reset':
                    dsb.ui.show(button.querySelector('.animation.start')).hide(button.querySelector('.animation.doing'))
                    button.classList.remove('animation', 'start')

                    break

            }
        },

        show_pop_content: () => {
            dsb.ui.show_overlay()
            dsb.ui.hide(document.getElementById('content'))
            dsb.ui.show(document.getElementById('pop-content'))
            document.getElementById('pop-content').classList.add('view')
        },

        hide_pop_content: () => {
            document.getElementById('pop-content').classList.remove('view')
            dsb.ui.hide(document.getElementById('pop-content'))
            dsb.ui.show(document.getElementById('content'))
            dsb.ui.hide_overlay()
        },

        show_overlay: () => {
            dsb.ui.backdrop.classList.add('show')
        },
        hide_overlay: () => {
            dsb.ui.backdrop.classList.remove('show')
        },

        show_intermediate_content: (event) => {
            event.preventDefault()
            let template = new Block('#popcont#', null, event.currentTarget.getAttribute('href'))
            template.checkLink4Tab(event.currentTarget.getAttribute('href'))
            template.load().then(r => dsb.ui.show_pop_content())


            return false
        },

        hide_intermediate_content: () => {
            dsb.ui.hide_pop_content()
        },

        show_refresh: (id) => {
            let item = document.querySelector(`#${id} button .refresh`)
            if (item) {
                item.classList.add('dsb-show', 'fa-spin')
            }
        },

        hide_refresh: (id) => {
            let item = document.querySelector(`#${id} button .refresh`)
            if (item) {
                item.classList.remove('dsb-show', 'fa-spin')
            }
        },

        /**
         * Hide several elements
         *
         * If an element start with . or # it is taken as class or id, otherwise as a bloc
         *
         * @param elements
         *
         * @since 1.0.0
         *
         */
        hide_elements: (elements) => {
            elements.forEach(element => {
                if (element.startsWith('#')) {
                    // Id
                    dsb.ui.hide(element)
                } else if (element.startsWith('.')) {
                    // Class
                    document.querySelectorAll(element).forEach(element => {
                        dsb.ui.hide(element)
                    })
                } else {
                    // Block
                    dsb.ui.hide(document.querySelector(`[data-template="${element}"]`))
                }
            })
        },

        is_event: (event) => {
            return event instanceof Event
        },

        prevent_default: (event) => {
            if (event instanceof Event) {
                event.preventDefault()
            }
        },

        /**
         * Scroll are only applied on children or element if no cascading
         * @param element
         * @param params
         */
        add_scrolling: (element, params = {}) => {

            // Bail early in case we can not work with ekement
            if (element === null) {
                return
            }
            let _params = {cascade: true, options: {}, scroll: {}}
            params = {..._params, ...params}

            if (params.cascade) {
                // Try with the parent
                dsb.ui._add_scrolling_to_element(element, params.options)

                // target children with dsb-scroll class
                Array.from(element.getElementsByClassName('dsb-scroll')).forEach(child => {
                    dsb.ui._add_scrolling_to_element(child, params.options, params.scroll)
                })
            } else {
                // target is the element
                dsb.ui._add_scrolling_to_element(element, params.options, params.scroll)
            }
        },

        _add_scrolling_to_element: (element, options = {}, scroll = {}) => {

            // We need to have a 'dsb-scroll' class to launch the scrolling tool
            // But we check also if it has not been already initialised
            let list = element?.classList
            if (list?.contains('dsb-scroll') /*&& !list?.contains('os-host')*/) {
                let params = {
                    overflowBehavior: {
                        x: 'hidden',
                    },
                    scrollbars: {
                        autoHide: 'leave',
                    },
                    paddingAbsolute: true,

                }

                let instance = OverlayScrollbars(element, {...params, ...options})

                // If it is a console, we move the menu outside the scrolling area
                // in order to fix it when scrolling
                if ('CONSOLE' === element.tagName) {
                    element.appendChild(element.getElementsByTagName('console-menu')[0])
                }

                // Scroll if we have to do it
                if (Object.keys(scroll).length !== 0) {
                    instance.scroll(scroll)
                }
            }

        },
        click: (elem) => {
            // https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/#:~:text=To%20use%20it%2C%20call%20the,a%27)%3B%20simulateClick(someLink)%3B

            // Create our event (with options)
            let evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            })
            // If cancelled, don't dispatch our event
            let canceled = !elem.dispatchEvent(evt)
        },

        get_css_var: (variable) => {
            return window.getComputedStyle(document.documentElement).getPropertyValue('--' + variable).trim()
        },

        set_css_var: (variable, value) => {
            document.documentElement.style.setProperty('--' + variable, value)
        },

        chart: {
            /**
             * Apex Chart export to csv
             *
             * @param chart
             * @param fileName
             * @return {Promise<boolean>}
             */
            exportToSVG: async (chart, fileName = 'sample') => {
                try {
                    let tmp = chart.ctx.exports.w.config.chart.toolbar.export.svg.filename
                    chart.ctx.exports.w.config.chart.toolbar.export.svg.filename = fileName
                    chart.ctx.exports.exportToSVG(chart.ctx, {fileName: fileName})
                    chart.ctx.exports.w.config.chart.toolbar.export.svg.filename = tmp

                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('chart/svg', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('chart/svg', 'text'), fileName),
                        type: 'success',
                    })

                    return true
                } catch (e) {
                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('chart/svg', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('chart/svg', 'error'), fileName),
                        type: 'danger',
                    })
                    return false
                }
            },

            /**
             *  Apex Chart export svg
             *
             * @param chart
             * @param series
             * @param fileName
             * @return {Promise<boolean>}
             */
            exportToCSV: async (chart, series, fileName = 'sample') => {
                try {
                    chart.ctx.exports.exportToCSV({
                        series: series,
                        columnDelimiter: ',',
                        fileName: fileName,
                    })

                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('chart/csv', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('chart/csv', 'text'), fileName),
                        type: 'success',
                    })

                    return true
                } catch (e) {

                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('chart/csv', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('chart/csv', 'error'), fileName),
                        type: 'danger',
                    })

                    return false
                }
            },
        },

        add_alert_close: alert => {
            if (alert !== null) {
                if (!(alert instanceof HTMLElement) && alert.startsWith('#')) {
                    alert = document.querySelector(alert)
                }
                alert.querySelector('.btn-close').addEventListener('click', event => {
                    dsb.ui.hide(alert)
                })
            }

        },


        get_text_i18n: (context, key = null) => {
            const text = document.querySelector(`text-i18n[context="${context}"]`)
            if (key) {
                return text?.dataset[key]
            }
            return text?.dataset
        },

        /**
         * Get the <appli>_lang cookie content
         *
         *
         * @return {null|any}
         */
        get_lang_cookie: () => {
            // we do not know the right name, but it's ended with -lang
            for (const cookie in Cookies.get()) {
                if (cookie.endsWith('-lang')) {
                    return {name: cookie, value: Cookies.get(cookie)}
                }
            }
            return null
        },

        get_lang: () => {
            return document.querySelector('html').getAttribute('lang')
        },

        /**
         * Set Bootstrap switch
         *
         * The element that have the target must have also a role=switch
         *
         * @param element   the switch id element (HTMLElement,or string with|without #
         * @param checked   the value to set
         * @param values    the real values to push to element.value (['off','on'])
         *                  this array is taken as  [false, true]
         *
         *
         */
        set_switch: (element, checked, values = ['off', 'on']) => {
            if (!(element instanceof HTMLElement)) {
                // suppress #if it exists
                if (element.startsWith('#')) {
                    element = element.substring(1)
                }
            } else {
                element = element.id
            }
            const real = document.querySelector(`[role="switch"][data-target="#${element}"`)
            real.checked = checked
            document.getElementById(element).value = values[Number(checked)]
        },

        /**
         * Set a radio box element
         *
         * @param name      of the radio box
         * @param value     of the element to click on
         *
         *
         */
        set_radio: (name, value) => {
            document.querySelector(`[name="${name}"][value="${value}"]`).checked = true
        },

        INITIALISED: false,
        lists: [],
        init: () => {
            if (!dsb.ui.INITIALISED) {
                // Attach web components
                new DashboardWCManager()
            }
            dsb.ui.INITIALISED = true
        },

        resizeWindowEvent: () => {
            if (Responsive.isSmallDevice()) {
                dsb.menu.collapse()

            } else if (Responsive.isExtraLargeDevice()) {
                dsb.menu.unCollapse()

            } else if (Responsive.isMediumDevice()) {
            } else {
                Responsive.isLargeDevice()
            }
        },
    },


    init_lang: async () => {
        /**
         * Check if lang as changed
         * @since 1.1.0
         *
         */

        if (!dsb.ui.check_lang) {
            dsb.ui.new_lang = false
            const cookie = dsb.ui.get_lang_cookie()

            let transient = new Transient(cookie.name)

            // it's better to read content from transients
            let content = await transient.read()

            if (cookie && content?.change) {
                // it's a new lang, ok we sync the cookie content
                content.old = null
                content.change = false

                Cookies.remove(cookie.name, {path: '/'})
                //   Cookies.set(cookie.name, JSON.stringify(content), 365)

                dsb.ui.new_lang = true

                /**
                 * Add a toast if  there is a new lang
                 * @since 1.1.0
                 *
                 */

                if (dsb.ui.new_lang) {
                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('language/change', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('language/change', 'text'), content.name),
                        type: 'success',
                    })
                    dsb.ui.new_lang = false
                }
            }

            // update transient TTL
            await transient.update(content, YEAR)

            dsb.ui.check_lang = true
        }
    },


    db: new LocalDB({
        name: 'dashboard',
        store: [],
        manageTransients: true,
        version: null,
    }),

    /**
     * Init all functions
     *
     * @param   instance (Object)
     *               name : string
     *               title : string
     *
     * @returns {dsb}
     */

    init: async (instance) => {

        // Sometimes, init is called twice, so... //TODO Check this
        if (dsb.initialized) {
            return
        }

        dsb.add_instance(instance.name)

        // Clean all event
        dsb.content_event.clean()

        dsb.page.main_title = instance.title

        const {default: OverlayScrollbars} = await import ('/dashboard/assets/vendor/overlay-scrollbars/OverlayScrollbars.min.js')

        /**
         * First thing to do,manage history
         */
        dsb.page.init()

        /**
         * Then, get user and session information
         */
        dsb.user.init()

        /**
         *  Finally, Initialise other dashboard elements
         */
        dsb.ui.init()
        dsb.modal.init()
        dsb.error.init()
        dsb.toast.init()

        // Add some body classes at loading if the user is already logged in.
        if (dsb.session.context.logged) {
            document.body.classList.add('logged-in')
            document.body.classList.add(dsb.session.context.user)
        }

        /**
         * Once menu has been loaded, we initialise some functionalities
         */
        Block.event.on('template/loaded/blocks/menu', (block) => {
            dsb.menu.init(block).then(() => {
                dsb.menu.synchronize(block, dsb.menu.pathname)
                dsb.ui.resizeWindowEvent()
                window.onresize = dsb.ui.resizeWindowEvent
            })
        })

        /**
         * Once menu has been loaded, we initialise some functionalities
         */
        Block.event.once('template/loaded/blocks/languages', block => {
            dsb.init_lang()
        })


        // We need to manage some history retrieval

        dsb.initialized = true
        console.info('Dashboard Engine is running.')

        return this
    },

}
export {dsb}

/*1667583828996*/