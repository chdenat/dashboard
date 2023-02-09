/**
 *
 *
 */
//import {Template} from "/dashboard/assets/js/Template.js";

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


    import_module = async (page = null, js = 'script.js') => {
        if (page === null) {
            page = this.current_page
        }

        if (page) {
            await import(`${this.#cpath}${this.#dir}${page}/${js}`)
                .then(module => {
                    if (module) {

                        let components = Object.values(module)
                        if (components.length !== 0) {
                            let script = Object.values(module)[0]
                            if (script?.module) {
                                // We use legacy object, we need to force init
                                window[script.module] = script
                                script.init()
                            } else {
                                // We use Classes , nothing to do
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }

    get current_page()  {
        //assume pathname = /pages/<page>

        // We 1st set current to home (can contains #)
        let current = '' // Template.get_home().split('#')[0].split('/').pop()

        let path = location.pathname
        if (path !== '/') {
            current = path.split('/')[2]
        }
        return current
    }
}

export {Dashboard}