/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Transient.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/02/2023  15:35                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {dsb, MINUTE} from 'dsb'

class Transient {
    #store
    #key
    #dataBase

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
     * @param duration in minute (default to 60, ie one hour)
     *
     *
     */
    create = async (value, duration = 60) => {
        if (value !== undefined) {
            await dsb.db.set(this.#key, value, this.#store, duration * MINUTE)
        }
    }

    /**
     * Read the transient
     * @param full      if true we'll return the full object, including time
     *                      else only the transient value
     * @return {Promise<*>}
     */
    read = async (full = false) => {
        return await dsb.db.get(this.#key, this.#store, full)
    }

    /**
     * Update the transient
     *
     * @param value
     * @param duration
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