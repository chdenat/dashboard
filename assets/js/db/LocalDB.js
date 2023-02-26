/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : LocalDB.js                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/02/2023  19:11                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

/**
 * Dependencies
 */
import {openDB} from 'idb';
import {DateTime} from 'luxon'
import {SECOND} from 'dsb'

let millis = 1000

export class LocalDB {

    #db = null
    #version = 1
    #stores = 'mystore'
    #name = 'mydb'

    #transients = 'transients'

    constructor({
                    name = this.#name,
                    store = this.#stores,
                    manageTransients = false,
                    version = this.#version
                }) {

        if (!(store instanceof Array)) {
            store = [store]
        }
        if (manageTransients) {
            store.push(this.#transients)
        }

        this.#stores = store
        this.#name = name

        let tables = this.#stores // passe dto upgrad contest
        this.#db = openDB(this.#name, this.#version, {
            upgrade(db, old_version, new_version) {
                tables.forEach(table => {
                    db.createObjectStore(table);
                })
            },
        })
    }

    /**
     * Return the transient store name
     *
     * @return {*|null}
     */
    get transientStore() {
        if (this.#stores.includes(this.#transients)) {
            return this.#transients
        }
        return null
    }

    /**
     * Get a value in current store
     *
     *
     * @param key           The key used
     * @param store
     * @param full      If false (default), get returns only the value
     *                      else it returns value+ttl, ie the full DB data content
     * @return {Promise<null|any>}
     */
    get = async (key, store, full = false) => {

        // Get the normal value
        const data = await (await this.#db).get(store, key);
        if (!data) {
            return null
        }

        // If we need ttl, we return the full object
        if (full) {
            return data
        }
        return data.value

    }

    /**
     * Add a key/value with optional ttl
     *
     *
     * @param key
     * @param value         any kind of value
     * @param store
     * @param ttl           in milliseconds
     *
     * @return {Promise<*>}
     */
    set = async (key, value, store,ttl = 0) => {

        let data = {
            value: value
        }

        data._ct_ = DateTime.now().toMillis()

        if (ttl > 0) {
            data._ttl_ = ttl * millis
            data._dt_ = data._ct_ + data._ttl_
            data._iso_ = DateTime.now().toISO()
        }

        return (await this.#db).put(store, data, key);

    }

    /**
     *  Update a key with a new value
     *
     * @param key
     * @param value
     * @param store
     * @param ttl       in milliseconds
     * @return {Promise<*>}
     */
    update = async (key,value,store,ttl = 0) => {
        const old = await this.get(key, store, true)
        if (old) {
            await this.delete(key, store)
            if (ttl === 0) {
                ttl = old._ttl_ / SECOND
            }
        }
        return await this.set(key,value,store,ttl);
    }

    /**
     * delete a key
     *
     * @param key
     * @param store
     * @return {Promise<*>}
     */
    delete=async (key,store) => {
        return (await this.#db).delete(store, key);
    }

    /**
     * Clear a store
     *
     * @return {Promise<*>}
     */
   clear =  async (store)=>  {
        return (await this.#db).clear(store);
    }

    /**
     * Get all keys
     *
     * @return {Promise<IDBRequest<IDBValidKey[]>>}
     */
    keys = async (store) => {
        return (await this.#db).getAllKeys(store);
    }


}