export const getLogger = (tag) => {
    return {
        debug: (...msg) => debug(tag, ...msg),
        info: (...msg) => info(tag, ...msg),
        error: (...msg) => error(tag, ...msg),
    };
};



export const debug = (tag, ...msg) => {
    //  console.debug(...[tag, ...msg]);
};

export const info = (tag, ...msg) => {
    // console.info(...[tag, ...msg]);
};

export const error = (tag, ...msg) => {
    console.error(...[tag, ...msg]);
};