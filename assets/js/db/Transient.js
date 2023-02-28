/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Transient.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 27/02/2023  20:12                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {dsb, MINUTE} from 'dsb'
import {DateTime} from 'luxon'

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
     *                  else only the transient value.
     *
     *                  If ttl expired, return null
     *
     * @return {Promise<*>}
     */
    read = async (full = false) => {

        let data = await dsb.db.get(this.#key, this.#store, true)

        if (data) {
            if (data?.ttl?.end < DateTime.now().toMillis) {
                return null
            }

            return full ? data : data?.value
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
        await dsb.db.delete(this.#key, this.#store)
    }

}

export {Transient}