export function setItem(key: string, value: unknown) {
    try {
        if (typeof window === "undefined") {
            return
        }
        window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.log(error)
    }
}

export function getItem(key: string) {
    try {
        if (typeof window === "undefined") {
            return undefined
        }
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : undefined;
    } catch (error) {
        console.log(error)
    }
}