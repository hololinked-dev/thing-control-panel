// Internal & 3rd party functional libraries
import  { useState, useCallback, useEffect, MutableRefObject } from "react";
// Custom functional libraries
import axios, { AxiosResponse } from "axios";
// Internal & 3rd party component libraries
// Custom component libraries 



export const fetchFieldFromLocalStorage = (field : string | null, defaultValue : any = null) => {
    let obj = localStorage.getItem('thing-control-panel')
    if(!obj)
        return defaultValue 
    if(typeof(obj) === 'string') 
        obj = JSON.parse(obj as string)
    if(field) {
        // @ts-ignore
        obj = obj[field]
        if(!obj)    
            return defaultValue
        return obj 
    }
    else{
        if(!obj)
            return defaultValue
        return obj   
    }
}


export const useLocalStorage = (field : string, defaultValue : any) => { 
    let obj = fetchFieldFromLocalStorage(field, defaultValue)

    const updateLocalStorage = useCallback((value: any) => {
        const lobj = fetchFieldFromLocalStorage(null, {});
        // console.log("total values in local storage before", lobj)   
        lobj[field] = value;
        // localStorage.setItem('thing-control-panel', JSON.stringify(lobj));
        console.log("total values in local storage after", lobj)   
    }, [field]);

    return [obj, updateLocalStorage];


}


export const useAutoCompleteOptionsFromLocalStorage = (field : string) => {
    const [existingData, setExistingData] = useState<{[key : string] : any}>({})
    if(!existingData[field])
        existingData[field] = [] // no need to re-render - it will correct at first iteration

    useEffect(() => {
        let data = fetchFieldFromLocalStorage(null, {})
        setExistingData(data)
    }, [])

    const modifyOptions = useCallback((entry : string | string[], operation : 'ADD' | 'DELETE') => {
        if(operation === 'ADD') {
            if(Array.isArray(entry)) {
                for(let value of entry) {
                    if(value) {
                        if(!existingData[field].includes(value)) 
                            existingData[field].push(value)
                    }
                }
            }
            else if(entry) {
                if(!existingData[field].includes(entry)) 
                    existingData[field].push(entry)
            }
        }
        else {
            if(Array.isArray(entry)) {
                for(let value of entry) {
                    if(value) {
                        if(existingData[field].includes(entry)) {
                            existingData[field].splice(existingData[field].indexOf(entry), 1)
                        }
                    }
                }
            }
            else if(entry) {
                if(existingData[field].includes(entry)) {
                    existingData[field].splice(existingData[field].indexOf(entry), 1)
                }
            }
        }
        setExistingData(existingData)
        localStorage.setItem('thing-control-panel', JSON.stringify(existingData))
    }, [existingData])
    return [existingData[field], modifyOptions]
}   



// https://github.com/CharlesStover/use-force-update
const createNewObject = (): Record<string, never> => ({});

export function useForceUpdate(): [Record<string, never>, VoidFunction] {
    const [useEffectDummyDependent, setValue] = useState<Record<string, never>>(createNewObject());

    return [useEffectDummyDependent, useCallback((): void => {
        setValue(createNewObject());
    }, [])]
}