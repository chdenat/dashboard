/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : LocalDB.js                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 22/02/2023  13:32                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {openDB} from 'idb';


export class LocalDB {

    #db = null
    #version = 1
    #stores = 'mystore'
    #name = 'mydb'

    #transients = 'transients'

     constructor({name = this.#name, store = this.#stores, version = this.#version}) {

        if (!(store instanceof  Array)) {
            store = [store]
        }
        this.#stores = store
        this.#name = name

         let tables = this.#stores // passe dto upgrad contest
        this.#db = openDB(this.#name,  this.#version, {
            upgrade(db,old_version, new_version) {
                tables.forEach(table => {
                    db.createObjectStore(table);
                })
            },
        })
    }

    static = db => {

    }

    /**
     * Get a value in current store
     *
     *
     * @param key           The key used
     * @param store
     * @param with_ttl      If false (default), get returns only the value
     *                      else it returns value+ttl, ie the full DB data content
     * @return {Promise<null|any>}
     */
    get = async (key,store,with_ttl=false) => {

        // Get the normal value
        const data = await (await this.#db).get(store, key);
        if (!data) {
            return null
        }

        // If we need ttl, we return the full object
        if (with_ttl) {
            return data
        }

        // If ttl exists and is expired, let's return null
        if (data._ttl_ && (new Date()).getTime() > data._ttl_) {
            await (await this.#db).delete(store, key);
            return null
        }
        // else returns the object stored
        return data.value

    }

    /**
     * Alias for transients
     *
     * @param key
     * @param with_ttl
     * @return {Promise<*|null>}
     */
    getTransient = async (key, with_ttl = false) => {
        return await dsb.db.get(key, this.#transients, with_ttl)
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

        if (ttl > 0) {
            data._ttl_ = (new Date()).getTime() + ttl
        }

        return (await this.#db).put(store, data, key);

    }
    /**
     * Alias for transients
     *
     * @param key
     * @param value
     * @param ttl
     * @return {Promise<*|null>}
     */

    setTransient = async (key, value, ttl = 0) => {
        return await this.set(key, value, this.#transients, ttl)
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
        const old = this.get(key)
        if (old) {
            await this.del(key)
        }
        return await this.set(key,value,store,ttl);
    }

    /**
     * Alias for transients
     *
     * @param key
     * @param value
     * @param ttl
     * @return {Promise<*>}
     */
    updateTransient = async (key, value, ttl = 0) => {
        return await this.set(key, value, this.#transients, ttl);
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
     * Alias for transients
     *
     * @param key
     * @param store
     * @return {Promise<*>}
     */
    deleteTransient = async (key) => {
        return (await this.#db).delete(this.#transients, key);
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