/**
 *
 *
 */

class Dashboard {
    #cpath = ''
    #js_path = 'assets/js'
    #dir = 'pages'
    pages = []

    #dpath = 'dashboard/' + this.#js_path

    constructor(cpath, dir = 'templates/pages') {
        this.#cpath = `/${cpath}/`
        this.#dir = `${dir}/`
    }

    get current_page() {
        //assume pathname = /pages/<page>

        // We 1st set current to home (can contains #)
        let current = '' // Template.get_home().split('#')[0].split('/').pop()

        let path = location.pathname
        if (path !== '/') {
            current = path.split('/')[2]
        }
        return current
    }

    /**
     * Import page controller.
     *
     * For each page, like  'my-admin', we should have a page controller named MyAdminPage
     * then we instantiate a global variable my_admin=new MyAdminPage('my-admin')
     *
     * @param page
     * @param template
     *
     * @return {Promise}
     *         resolve : {
     *                       success : true
     *                       page : page controller
     *                   }
     *         reject :  {
     *                      success : true
     *                   }
     *
     */
    importPageController = (page = null, template = null) => {

        let success = false
        let _page = null;

        if (page === null) {
            page = this.current_page
        }

        return new Promise((resolve, reject) => {
            let pascal = `${dsb.utils.kebab2Pascal(page)}Page`
            try {
                import(`${this.#cpath}${this.#dir}${page}/${pascal}.js`)
                    .then(module => {
                        if (module) {
                            let components = Object.values(module)
                            if (components.length !== 0) {
                                let imported
                                if (Object.values(module)[0]?.module) {
                                    // We use object with module attribute, so we're able
                                    // to create the exported variable, populate it and init it
                                    imported = Object.values(module)[0]
                                    window[imported.module] = imported
                                    imported.init()
                                    return {legacy: imported, controller: imported.module}
                                } else {
                                    // We use Classes, so we're able
                                    // to instantiate the class
                                    let _class = components[0]
                                    let name = dsb.utils.kebab2Camel(page)
                                    window[name] = new _class(page, template)
                                    //Call  Global page Initialisation which is a static method
                                    if (undefined === window[name]['globalPageInitialisation']) {
                                        _class.globalPageInitialisation()
                                    }
                                    // Then attach all the events to the instance
                                    if (undefined === window[name]['attachEvents']) {
                                        window[name].attachEvents()
                                    }
                                    // Finally we pass it to the caller
                                    return window[name]
                                }
                            }
                        }
                    })
                    .then(page => {
                        if (page?.legacy) {
                            resolve({
                                success: true,
                                page: page.legacy, message: `${page.controller} use legacy controller !`
                            })
                        }
                        resolve({success: true, page: page})
                    })
                    .catch(error => {
                        reject({
                            success: false,
                            message: error
                        })
                    })
            } catch (error) {
                reject({
                    success: false,
                    message: 'Probably due to legacy :' + error
                })
            }
        })

    }
}

export {Dashboard}