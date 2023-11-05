/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardMenu.js                                                                                            *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 05/11/2023  09:40                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from '/dashboard/assets/js/Block.js'
import {DashboardUtils as Utils} from '/dashboard/assets/js/DashboardUtils.js'
import {DashboardUI as UI} from '/dashboard/assets/js/ui/DashboardUI.js'

//import * as bootstrap from 'bootstrap'

export class DashboardMenu {

    static template_id = '#menu#'
    static pathname = null
    static current_roles = []
    static json = null
    static openClass = 'openItem'
    static  allRoles = ['logged', 'admin', 'superadmin']

    static setID = (new_id) => {
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
    static  synchronize = async (template, pathname = '') => {
        this.setID(template.ID)

        DashboardMenu.getJSON().then(data => {
            // If there is no pathname, we use the window location
            if (pathname === '' || pathname === null) {
                pathname = `${window.location.pathname}${window.location.hash}`
            }
            let origin = pathname
            pathname = this.#cleanValue(pathname)

            let found = false               // found in the menu
            let foundWithRole = false     // found with a specific role if not in menu

            let item = {}
            let menuItem = {}
            // Let's find the right entry in the menu
            // We try as is,then without hash and finally without index.

            for (let key of [' ', '#', 'index']) {
                pathname = pathname.split(key)[0]
                // Some entry in the menu ?
                menuItem = this.findMenuItemByKey(DashboardMenu.json.menu, 'href', pathname, [], true)
                if (dsb.session.active()) {
                    found = menuItem.length > 0
                } else {
                    found = menuItem.length > 0 && menuItem[0].roles.length === 0
                }

                if (found) break

                // OK so may-be session is inactive, let's search id there is one bound to a role
                if (!found && !dsb.session.active()) {
                    // Nothing... May be the user need to be logged in to see this item in the menu ...
                    menuItem = this.findMenuItemByKey(DashboardMenu.json.menu, 'href', pathname, DashboardMenu.allRoles, true)
                    foundWithRole = menuItem.length > 0
                    if (foundWithRole) break
                }
            }

            if (!found) {
                if (!foundWithRole) {
                    // Nothing with role
                    //  we try to open the default if it is / | /home => pathname = null | home
                    if (pathname === '' || pathname === 'home' || pathname === 'pages/home') {
                        menuItem = this.findMenuItemByKey(DashboardMenu.json.menu, 'default', true, [], true)
                        found = menuItem.length > 0
                        pathname = this.#cleanValue(menuItem[0].data.href)
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
            if (found || foundWithRole) {
                item = document.querySelector(`[data-template-id="${template.ID}"] a[data-level*="menu-item-"][href*="${pathname}"]`)
                if (item !== null) {
                    // Item found ie it exists in the menu block
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

                        // we search the link
                        let link = item.getAttribute('href')

                        if (link?.startsWith('#menu')) {
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
                    // Item is hidden
                    this.click(menuItem[0].data, true)
                    dsb.ui.show_tab(Block._check_link(menuItem[0].data.href).tab)

                }
            } else {
                Block.page404('#content#', origin)
            }
        })
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
    static findMenuItemByKey = (obj = {}, key, value, roles = []) => {
        const result = []
        let usedRoles = []
        const haveRoles = roles.length > 0
        const recursive = (obj = {}) => {
            if (!obj || typeof obj !== 'object') {
                return
            }
            // If no roles in input or no roles in data, search is enabled
            let search = obj.roles === undefined

            if (obj?.roles !== undefined) {
                // If there are some roles, we try to see if roles in data are
                //  included in input roles
                usedRoles = obj.roles.filter(x => {
                    if (roles.length) return roles.includes(x)
                    return true
                })
                // if (Object.keys(usedRoles).length > 0) {
                //     search = haveRoles // Reject if role=[] and we found roles
                // }
                search = (Object.keys(usedRoles).length > 0)
            }

            // search is enabled
            if (search) {
                if (this.#cleanValue(obj[key]) === this.#cleanValue(value)) {
                    result.push({data: obj, roles: usedRoles})
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
        if (item instanceof HTMLElement) {
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
        } else {
            // we assume it is a menu element

            //Add breadcrumbs
            UI.setBreadcrumbs(item.href)
            // Add Title
            UI.setTitle(item.name)
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
    static #cleanValue = (path) => {
        if (path && typeof path === 'string') {
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
            let menu = await Utils.readJSON(`${dsb.instance.appPath}templates/menu.json`)
            if (menu) {
                DashboardMenu.json = menu
            }
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
        let expandButton = document.getElementById('main-menu-expand')
        let unexpandButton = document.getElementById('main-menu-unexpand')

        menu_container.querySelector('#menu-container .dsb-collapse-vertical')?.addEventListener('click', (event) => {
            all_open = !all_open
            if (all_open) {
                dsb.ui.hide(expandButton).show(unexpandButton)
            } else {
                dsb.ui.hide(unexpandButton).show(expandButton)
            }

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