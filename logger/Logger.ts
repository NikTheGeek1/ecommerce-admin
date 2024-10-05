class Logger {

    public static info(SHOW_LOGS: boolean, tag: string, message: string) {
        SHOW_LOGS && console.log('\x1b[34m%s\x1b[0m',  `INFO: ${tag} =>`, message); // Blue color for info logs
    }

    public static error(SHOW_LOGS: boolean, tag: string, message: string) {
        SHOW_LOGS && console.error('\x1b[31m%s\x1b[0m', `ERROR: ${tag} =>`, message); // Red color for error logs
    }

    public static debug(SHOW_LOGS: boolean, tag: string, message: string) {
        SHOW_LOGS && console.debug('\x1b[35m%s\x1b[0m', `DEBUG: ${tag} =>`, message); // Magenta color for debug logs
    }

    public static warn(SHOW_LOGS: boolean, tag: string, message: string) {
        SHOW_LOGS && console.warn('\x1b[33m%s\x1b[0m', `WARN: ${tag} =>`, message); // Yellow color for warning logs
    }
}

export default Logger; 
