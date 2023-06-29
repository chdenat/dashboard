/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardMenu.js                                                                                            *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 29/06/2023  10:14                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from 'Block'
import {DashboardUI as UI} from 'DashboardUI'
import * as bootstrap from 'bootstrap'

export class DashboardMenu {

    static template_id = '#menu#'
    static pathname = null
    static current_roles = []
    static json = null
    static openClass = 'openItem'
    static  ALL_ROLES = ['logged', 'admin']

    static change_id = (new_id) => {
        this.template_id = new_id
    }

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
    static  synchronize = (template, pathname = '') => {
        this.change_id(template.ID)

        DashboardMenu.getJSON().then(data => {
            // If there is no pathname, we use the window location
            if (pathname === '' || pathname === null) {
                pathname = `${window.location.pathname}${window.location.hash}`
            }
            let origin = pathname
            pathname = this._clean_path(pathname)

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
                    if (pathname === this._clean_path(item.getAttribute('href').split(key)[0])) {
                        found = true
                        break
                    }

                } else if (!dsb.session.active()) {
                    // Nothing... May be the user need to be logged in to see this item in the menu ...
                    found_with_role = this.find_items_with_roles(DashboardMenu.json.menu, 'href', pathname, this.all_roles(), true).length > 0

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
                    this.pathname = pathname
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
                        this.click(item, true)
                        dsb.ui.show_tab(Block._check_link(link).tab)
                    }
                    id += '-'

                })
            } else {
                Block.page404('#content#', origin)
            }
        })
    }

    /**
     * Get all roles
     */
    static all_roles = () => {
        return DashboardMenu.ALL_ROLES
    }

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
    static find_items_with_roles = (obj = {}, key, value, roles = []) => {
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

                if (this._clean_path(obj[key]) === this._clean_path(value)) {
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
    }

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
    static click = (item, historize = false) => {
        // it's the link ?  Manage history (and add url in the browser bar)
        if (item?.dataset?.level && !item.classList.contains(this.openClass)) {
            // Mark new menu item open
            document.querySelector(`.${this.openClass}[href]`)?.classList.remove(this.openClass)
            item.classList.add(this.openClass)

            if (historize) {
                dsb.page.add_to_history_from_menu(item)
            }

            //Add breadcrumbs
            UI.setBreadcrumbs(item)
            // Add Title
            UI.setTitle(item)

        }


        // On responsive mode, each click collapse the menu
        import ('/dashboard/assets/js/ui/Responsive.js').then((module) => {
            if (module.Responsive.isSmallDevice()) {
                this.collapse()
            }
        })

        return false
    }

    static toggleCollapse = () => {
        let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
        document.body.classList.toggle('menu-collapsed')
        menu.toggle()

    }

    static unCollapse = () => {
        let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
        document.body.classList.remove('menu-collapsed')
        menu.show()
    }
    static collapse = () => {
        let menu = bootstrap.Collapse.getOrCreateInstance(document.getElementById('menu-container'), {})
        document.body.classList.add('menu-collapsed')
        menu.hide()
    }

    /**
     * Get the text from the menu item
     *
     * @param item
     * @return {*}
     *
     * @since 1.0
     *
     */
    static item_text = (item) => {
        return item?.innerText
    }

    /**
     * Suppress / at both first and end
     *
     * @param path
     * @return path
     *
     * @private
     */
    static _clean_path = (path) => {
        if (path) {
            if (path.startsWith('/')) {
                path = path.substring(1)
            }
            if (path.endsWith('/')) {
                path = path.substring(0, path.length - 1)
            }
        }
        return path
    }

    static update = () => {
        let id = dsb.session.context?.referrer
        if (id) {
            let item = id.split(/(level-[0-9]+)/gm)
        }
    }

    static getJSON = async () => {
        if (DashboardMenu.json === null) {
            await fetch((dsb_ajax.get) + '?' + new URLSearchParams({
                action: 'read-json-menu',
            })).then(function (response) {
                return response.json()
            }).then(function (data) {
                DashboardMenu.json = data
            }).catch((error) => {
                console.error('Error:', error) // Print or not print ?
            })
        }
        return DashboardMenu.json
    }

    /**
     * Menu Initialisation
     *
     * @since 1.0
     *
     */
    static init = async (block) => {
        /**
         *
         * Read JSON menu
         *
         * @since 1.0
         *
         */

        await this.getJSON()

        let menu_container = document.getElementById('menu-container')

        // We trap a specifi event on menu items click to instantiate the collapse/uncollapse
        dsb.content_event.on('click', (item) => {
            this.click(item, true)
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

        this.update()

    }

}