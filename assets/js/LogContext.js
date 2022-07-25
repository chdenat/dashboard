/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : LogContext.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  5/20/22, 8:57 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

const CTX_END = true
const CTX_READ = false;

class LogContext {

    #status = CTX_READ                  // reading status
    #error = false                      // reading result
    #lines = 0                          // lines to read
    #read = 0                           // number of read lines

    #selector = null                    // CSS used to display information
    #logID = null                       // context key
    #file = null                        // file to read

    timers = {
        animate: 0,                     // animation timer
        read: 0,                        // reading timer
        wait: 0                         // when there is no new lines
    }

    constructor(logID, logfile) {
        this.#logID = logID
        this.#file = logfile
    }

    set parameters(object) {
        this.#selector = object?.selector
        this.#lines = object?.lines
        this.#read = object?.read
    }

    /**
     * Get reading status
     *
     * @returns {boolean}
     */
    get status() {
        return this.#status
    }

    /**
     * Set reading status (default end=true) to a file in the context
     *
     * @param status string ( end|read )
     *               integer
     */
    set status(status) {
        if (typeof status === 'string') {
            if (status === 'end') this.#status = this.end
            else if (status === 'read') this.#status = this.read
        }
    }

    get read() {
        return CTX_READ
    }

    get end() {
        return CTX_END
    }

    /**
     * Set reading error type (default 0=none) to a file in the context
     *
     * @param error
     */
    set error(error) {
        this.#error = error
    }

    /**
     * Get reading error
     * @returns {boolean}
     */
    get error() {
        return this.#error
    }

    get selector() {
        return this.#selector
    }

    get file() {
        return this.#file
    }

    get lines() {
        return this.#lines
    }

    get read_lines() {
        return this.#read
    }

    set read_lines(lines) {
        this.#read = lines
    }

    get ID() {
        return this.#logID
    }

}

export {LogContext}