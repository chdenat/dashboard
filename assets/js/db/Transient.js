/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Transient.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 16/07/2023  08:34                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {dsb, MINUTE} from '/dashboard/assets/js/dsb.js'
import {DateTime} from '/dashboard/assets/vendor/luxon.min.js'

class Transient {
    #store
    #key
    #dataBase
    return
    #content

    constructor(transientName, dataBase = dsb.db) {
        this.#key = transientName
        this.#dataBase = dataBase
        this.#store = this.#dataBase.transientStore
    }

    /**
     *
     * @return {*}
     */
    get name() {
        return this.#key
    }

    /**
     *  Return if transient expired
     */
    get expired() {
        dsb.db.get(this.#key, this.#store, true).then(data => {
            if (data) {
                return this.#expired(data)
            }
            return false
        })
    }

    #expired = data => {
        return (data?.ttl?.end < DateTime.now().toMillis())
    }

    /**
     * Create the transient
     *
     * @param value
     * @param duration in seconds (10 minutes)
     *
     *
     */
    create = async (value, duration = 10 * MINUTE) => {
        if (value !== undefined) {
            await dsb.db.put(this.#key, value, this.#store, duration)
        }
    }

    /**
     * Read the transient
     * @param full      if true we'll return the full object, including time
     *                  else only the transient value property.
     *
     *                  If ttl expired, return null
     +
     *
     * @return {Promise<*>}
     */
    read = async (full = false) => {

        let data = await dsb.db.get(this.#key, this.#store, true)
        if (data) {
            if (this.#expired(data)) {
                return null
            }
            return full ? data : {value: data?.value}
        }
        return null
    }

    /**
     * Update the transient
     *
     * @param value
     * @param duration (seconds)
     * @return {Promise<*>}
     */
    update = async (value, duration = 0) => {
        if (value !== undefined) {
            return await dsb.db.update(this.#key, value, this.#store, duration)
        }
    }

    /**
     * Delete the transient
     */
    delete = async () => {
        return await dsb.db.delete(this.#key, this.#store)
    }

}

export {Transient}