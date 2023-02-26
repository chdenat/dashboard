/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Transient.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/02/2023  19:12                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {dsb, SECOND} from 'dsb'
import {DateTime} from 'luxon'

class Transient {
    #store
    #key
    #dataBase
    return
    null

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
     * Create the transient
     *
     * @param value
     * @param duration in seconds (default to 600, ie 10 minutes)
     *
     *
     */
    create = async (value, duration = 600) => {
        if (value !== undefined) {
            await dsb.db.set(this.#key, value, this.#store, duration * SECOND)
        }
    }

    /**
     * Read the transient
     * @param full      if true we'll return the full object, including time
     *                  else only the transient value.
     *
     *                  If ttl expired, return null
     *
     * @return {Promise<*>}
     */
    read = async (full = false) => {

        let data = await dsb.db.get(this.#key, this.#store, true)
        if (data)
            if ((data._ct_ + data._ttl_) < DateTime.now().toMillis) {
                return null
            }
        return full ? data : data.value
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
            return await dsb.db.update(this.#key, value, this.#store, duration * SECOND)
        }
    }
    /**
     * Delete the transient
     */
    delete = async () => {
        await dsb.db.delete(this.#key, this.#store)
    }

}

export {Transient}