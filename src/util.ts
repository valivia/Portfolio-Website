/*!
 * Copyright (C) 2018-2019  Valivia
 */

const ratelimit: Map<string, number> = new Map();

export function throttle(indentifier: string, delay: number) {

    const time: Number | undefined = ratelimit.get(indentifier);

    if (time !== undefined && time > Date.now()) {
        return false;
    }

    ratelimit.set(indentifier, Date.now() + delay);

    return true;
}