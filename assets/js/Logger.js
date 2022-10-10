/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : logger.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  5/16/22, 7:02 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
import {LogContext} from './LogContext.js'
import {DSBConsole} from './DSBConsole.js'
import {dsb} from "./dsb.js";
import {EventEmitter} from "../vendor/EventEmitter/EventEmitter.js";


class Logger {

    #errors = {
        KO: 1,
        STOP: 2
    }

    #markers = {
        OK: '#OK#',
        ABORT: '#ABORT#',
        KO: '#KO#',
        STOP: '#STOP#',
    }

    #delays = {
        read: 2000,
        animate: 1000 // Should be shorter than read
    }

    #ID = 0
    #file = ''
    #console = null
    #history = true
    #once = false
    #loop = 0
    #scroll_bottom = false
    #erase = true;
    #anim_iter = 0

    #parameters = {}

    #event = new EventEmitter()

    /**
     *
     * It throws :
     *   'log/start' and 'log/start/${context.ID}'
     *
     * @param parameters  Object
     *  {
     *      ID                  Log file identifier, used for the events
     *      file                file path
     *      lines                max lines to read from end
     *
     *      console              console selector
     *      erase                true if it is possible to erase the console content  (default true)
     *      once                 read once or loop (default = false)
     *      history              boolean, use history or not   (default = true)
     *                           if once=true, history is forced to true
     *
     *      scroll_to_bottom     True if we scroll at the end of the console when text longer than console height/
     *
     *  }
     *
     *
     *     Where we start  (check >)
     *
     *      history=false
     *                  ............................>
     *
     *      history=true
     *                  .............>...............
     *                                <--- lines --->
     *
     */
    constructor(parameters = {}) {

        /**
         * 1step : Initialize logger
         */

        let lines = parameters?.lines ?? 100

        // Set logger parameters
        this.#ID = parameters.ID
        this.#file = parameters.file
        this.#erase = parameters.erase ?? true

        this.#console = new DSBConsole(parameters.console, this.#erase)

        this.#once = parameters?.once ?? false
        // if once, we force history to true
        this.#history = this.#once ? true : (parameters.history ?? true)

        // Create the context
        this.context = new LogContext(this.#ID, this.#file)

        // add some parameters
        this.context.parameters = {
            selector: this.#console,
            lines: lines,
            read: 0
        }

        this.#scroll_bottom = parameters.scroll_to_bottom ?? false


    }

    /**
     *
     * @returns {Promise<Logger>}
     */
    start = async (show_console = true) => {

        // Get the number of lines
        this.context.read_lines = await this.get_lines_number()

        // We need to manage some future standard events
        this.event.on('log/start', this.start_log);
        this.event.on('log/running', this.update_log);
        this.event.on('log/stop', this.end_log);
        this.event.on('log/error', this.error_log);

        // Dispatch generic starting event
        this.event.emit('log/start')

        // Dispatch specific starting event
        this.event.emit(`log/start/${this.#ID}`, {logger: this})

        if (show_console) {
            this.#console.show()
        }
        dsb.ui.add_scrolling(this.#console, {cascade: false});

        return this
    }

    get event() {
        return this.#event
    }

    /**
     * Returns the Logger ID
     *
     * @returns {number}
     * @constructor
     */
    get ID() {
        return this.#ID
    }

    /**
     * Set the parameters attribute
     *
     * Each set delete the current one
     *
     * @param object
     */
    set parameters(object) {
        this.#parameters = object
    }

    /**
     * Read the parameters
     *
     * @returns #parameters
     */
    get parameters() {
        return this.#parameters
    }

    /**
     * Get the console object
     *
     * @returns #console
     *
     */
    get console() {
        return this.#console
    }

    /**
     * Get the console DOM object
     *
     * @returns #console
     *
     */
    get dom_console() {
        return this.#console.console
    }

    get file() {
        return this.#file
    }

    /**
     * Read number of lines of the file
     *
     * @param file
     * @returns {Promise<void>}
     *
     */
    get_lines_number = async (file = this.#file) => {
        // Get log file size
        let value = 0
        await fetch(ajax.get + '?' + new URLSearchParams({
            action: 'lines-number',
            file: file,
        })).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).then(response => response.json())
            .then(json => {
                value = json.total
            })
            .catch(error => {
                return false
            })

        return value
    }

    /**
     * This method read file in a tail mode (ie starting at n lines from end)
     *
     * It throws
     *           'log/running' and 'log/running/${context.ID}' events during reading
     * and       'log/stop' and 'log/stop/${context.ID}'  events once reading has been done
     *
     */

    read =  async () => {

        /**
         * Bail early  if we're in pause
         */
        if (!this.running) {
            // We'll try later
            this.context.timers.read = setTimeout(this.read, this.#delays.read)
            return
        }

        /**
         * 2nd step :
         * Reading log file
         */

        this.context.status = 'read'
        let lines = (this.#loop === 0 && !this.#history) ? 0 : this.context.lines
        let start = this.context.read_lines - (this.#loop === 0 && this.#history ? lines : 0)

        if (!this.#once) {
            this.animate()
        }
        fetch(ajax.get + '?' + new URLSearchParams({
            action: 'logger',
            file: this.context.file,
            lines: lines,
            read: start,
        })).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).then(response => response.json())
            .then(json => {
                /**
                 * Step 3 :
                 * If we read something,we try to detect the end marker and add the corresponding result ie ok, error or warning
                 * and update some context data
                 */
                let found_marker = false
                if (json.content?.length > 0) {

                    json.content = json.content.map(item => item.replace('\n', ''))

                    // Detect end of reading
                    if (json.content.includes(this.#markers.OK)) {
                        found_marker = true
                    } else if (json.content.includes(this.#markers.ABORT)) {
                        found_marker = true
                        this.context.error = this.#errors.KO
                    } else if (json.content.includes(this.#markers.KO)) {
                        found_marker = true
                        this.context.error = this.#errors.KO
                    } else if (json.content.includes(this.#markers.STOP)) {
                        found_marker = true
                        this.context.error = this.#errors.STOP
                    }

                    // A marker has been found, let's stop
                    if (found_marker) {
                        this.stop()
                    }

                    this.context.read_lines = json.total

                    // If we only read once, we need to force end now.
                    if (this.#once) {
                        this.stop()
                    }
                }
                if (this.context.status !== this.context.end) {
                    /**
                     * Step 4 :
                     * We continue to read the file
                     *
                     */
                    // Throw a new generic running event
                    this.#event.emit('log/running', {logger: this, json: json})

                    // and a new specific running event
                    this.#event.emit(`log/running/${this.#ID}`, {logger: this, json: json})

                    // Relaunch the reading in few seconds
                    if (!this.#once) {
                        this.#clear_timers()
                        this.context.timers.read = setTimeout(this.read, this.#delays.read)
                    }

                } else {
                    /**
                     * Step 5 :
                     * It is the end of the reading
                     */
                    if (found_marker) {
                        // if we had a marker in the text, we delete it to avoid publishing it.
                        json.content.pop()
                    }

                    // Throw a new generic end event
                    this.#event.emit('log/stop', {logger: this, json: json})

                    // and a new specific end event
                    this.#event.emit(`log/stop/${this.#ID}`, {logger: this, json: json})

                    this.stop()
                }
            })
            .catch(error => {
                /**
                 * We encounter an error... We need to stop
                 */

                // Throw a new generic error event
                this.#event.emit('log/error', this.context)

                // and a new specific error event
                this.#event.emit(`log/error/${this.#ID}`, this.context)

                this.stop()

            })

        this.#loop++

    }

    /**
     * Force stop
     */
    stop = () => {
        this.context.status = 'end'
        this.#clear_timers()

        this.#event.off([
            'log/running',
            `log/running/${this.#ID}`,
            'log/error',
            `log/error/${this.#ID}`]
        )

    }

    /**
     * Clear all or some timers
     *
     * @param timers array of timers to clear (all,animate,read,wait)
     */
    #clear_timers = (timers = ['all']) => {
        if (timers.includes('all') || timers.includes('animate')) {
            clearTimeout(this.context.timers.animate)
        }
        if (timers.includes('all') || timers.includes('read')) {
            clearTimeout(this.context.timers.read)
        }
        if (timers.includes('all') || timers.includes('wait')) {
            clearInterval(this.context.timers.wait)
        }
    }

    /**
     * Update log
     **
     * @param context
     * @param message
     * @param clear
     * @param animation
     */
    update = async ({message = '', clear = false, animation = true, classes = ''}) => {

        // If clear has been required ...
        if (clear) {
            this.#console.clear()
        }

        // Message is empty or only a br, quitting
        if (['', '<br>'].includes(message)) {
            return
        }

        // Print the content (with additionnal) classes is required
        this.#console.log(message, classes)

        // Keep the user focused on
        this.animate(animation)
    }

    /**
     * Scroll to bottom if we text is longer than console height
     */
    scroll_to_bottom = () => {
        let screen = this.dom_console
        let instance = OverlayScrollbars(screen)
        instance.scroll({x: 0, y: '100%'})
    }

    /**
     * Add the dot animation when user is waiting for new information
     *
     * @param animation true, we run it else we abort it
     * @param type      name of animation (cursor,dotshorts)
     * @returns true if all is ok else false
     */

    animate = (animation = true, type = 'dotshorts') => {

        let anime = {};
        const max = 80; //()=>{return Math.round(20 + Math.random() * 60)}

        anime.cursor = () => {
            if (this.running) {
                const P = ['\\', '|', '/', '-'];
                this.#anim_iter = (this.#anim_iter > 3) ? 0 : this.#anim_iter
                let target = this.#console.last
                if (null !== target) {
                    target.innerHTML = `${P[this.#anim_iter++]}`
                }
            }
        }
        anime.dotshorts = () => {
            if (this.running) {
                this.#anim_iter = (this.#anim_iter > max) ? 0 : this.#anim_iter
                let target = this.#console.last
                if (null !== target) {
                    if (this.#anim_iter) {
                        target.innerHTML = target?.innerHTML + '.'
                    } else {
                        target.innerHTML = '.'
                    }
                    this.#anim_iter++
                }
            }
        }
        /**
         * For some reason if we reach the end, we stop the current animation
         */
        if (this.context.status === this.context.end) {
            this.stop()
        } else {
            if (this.running) {
                // we run the dedicated animation
                anime[type]()
                // Should we continue or not ?
                if (animation) {
                    this.context.timers.animate = setTimeout(anime[type], this.#delays.animate)
                } else {
                    this.#clear_timers('animate')
                }
            }
        }
    }

    /**
     * Event launched before reading
     *
     */
    start_log = async () => {
        // Keep the user focused on
        this.animate(true)
    }

    /**
     * Event launched each time we read something
     *
     * @param data
     */
    update_log = async (data) => {

        if (data?.json?.read > 0) {
            // We print only if we have to
            await this.update({
                    message: data.json.content.join('<br>')
                }
            )
        }
        // Scroll to bottom
        if (this.#scroll_bottom) {
            this.scroll_to_bottom()
        }
    }

    /**
     * Event launched after reading
     *
     * @param data
     */
    end_log = async (data) => {

        // We update with the last data from file
        await this.update_log(data)

    }

    /**
     * Event launched if an error occurs
     *
     *
     */
    error_log = async (data) => {

        await this.update(this.context, {
                message: '---<br>' + new Date().toLocaleTimeString() + ': A problem occurred.',
                animation: false
            }
        )
        this.stop()
    }

    /**
     * Return the running console status
     *
     * @returns {*}
     */
    get running() {
        return this.console.running
    }

}

export {Logger}
