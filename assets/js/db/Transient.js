/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Transient.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 24/02/2023  15:46                                                                                *
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
     * Set the transient
     *
     * @param value
     *
     * @param duration
     */
    set = async (value, duration = 60) => {
        if (value !== undefined) {
            await dsb.db.set(this.#key, value, this.#store, duration * MINUTE)
        }
    }

    get = async (with_ttl = false) => {
        return await dsb.db.get(this.#key, this.#store, with_ttl)
    }

    /**
     * Update the transient
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