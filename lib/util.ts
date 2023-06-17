import * as readline from "readline";
import {spawn} from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {Readable} from 'stream'

const crypto = require('node:crypto')

export interface OsReleaseInfo {
    /**
     * OS name
     */
    NAME: string

    /**
     * os version in detail, ex) "20.04.5 LTS (Focal Fossa)
     */
    VERSION: string

    /**
     * os id, ex) "ubuntu"
     */
    ID:string

    /**
     * derivative of, ex) "debian"
     */
    ID_LIKE:string

    PRETTY_NAME:string

    /**
     * version id, ex) "20.04"
     */
    VERSION_ID:string

    HOME_URL:string
    SUPPORT_URL:string
    BUG_REPORT_URL:string
    PRIVACY_POLICY_URL:string

    /**
     * version code name, ex) "focal"
     */
    VERSION_CODENAME:string
}


export const SEC_MS = 1000
export const MIN_MS = SEC_MS * 60
export const HOUR_MS = MIN_MS * 60
export const DAY_MS = HOUR_MS * 24

export const SIZE_KILO = 1024
export const SIZE_MEGA = 1024*1024
export const SIZE_GIGA = 1024*1024*1024

/**
 * wait for milliseconds
 * @example
 * await waitMs(500); // wait for 500 milliseconds
 *
 * @param milliseconds
 */
export async function waitMs(milliseconds: number) {
    return new Promise((res,) => {
        setTimeout(res, milliseconds)
    })
}

/**
 * wait for seconds
 * @param seconds
 */
export async function waitSec(seconds: number) {
    return waitMs(SEC_MS * seconds)
}

/**
 * wait for minutes
 * @param minutes
 */
export async function waitMin(minutes: number) {
    return waitMs(MIN_MS * minutes)
}

/**
 * wait for hours
 * @param hours
 */
export async function waitHour(hours: number) {
    return waitMs(HOUR_MS * hours)
}

export type TimeType = 'hour' | 'min' | 'sec' | 'msec'

/**
 * return duration from d2 to d1 ( d1-d2 )
 *
 * @param {Date} d1 - end date
 * @param {Date} d2 - from date
 * @param {TimeType} out - difference unit type,
 */
export function dateDiff(d1: Date, d2: Date, out: TimeType = 'sec'): number {
    const dt = d1.getTime() - d2.getTime()
    if (out == 'hour') {
        return dt / (1000 * 60 * 60)
    } else if (out == 'min') {
        return dt / (1000 * 60)
    } else if (out == 'sec') {
        return dt / (1000)
    } else if (out == 'msec') {
        return dt
    } else {
        throw Error('INVALID_ARG')
    }
}

export function lastDayOfMonth(ct: Date) {
    return (new Date(ct.getFullYear(), ct.getMonth() + 1, 0)).getDate()
}

/**
 * convert duration string to milliseconds
 * @example
 * durStr2Ms('2h'); // it will return 2*60*1000
 *
 * @param dur number+specifier, ex) 1h, 2d, 30s, 5m, ...
 * @return milliseconds
 */
export function durStr2Ms(dur: string): number {
    const re = /[0-9]+[Mdhms]/g
    const vs = dur.match(re)
    // console.info(vs)
    let res = 0;
    let unit = 0;
    for (let v of vs) {
        const ts = v[v.length - 1]
        const [n,] = v.split(ts)
        const tn = Number.parseInt(n)
        switch (ts) {
            case 'd':
                unit = DAY_MS
                break;
            case 'h':
                unit = HOUR_MS
                break;
            case 'm':
                unit = MIN_MS
                break
            case 's':
                unit = SEC_MS
                break
            default:
                unit = 0
                break;
        }
        if (!unit) {
            return -1;
        }
        res += unit * tn;
    }
    return res
}

/**
 * convert Date to string of sql style
 * @param ct target Date object
 * @param utc if true, convert as UTC
 */
export function toSqlDate(ct: Date, utc: boolean = false) {
    if (!utc) {
        return ct.getFullYear().toString()
            + '-'
            + (ct.getMonth() + 1).toString().padStart(2, '0')
            + '-'
            + ct.getDate().toString().padStart(2, '0')
            + ' '
            + ct.getHours().toString().padStart(2, '0')
            + ':'
            + ct.getMinutes().toString().padStart(2, '0')
            + ':'
            + ct.getSeconds().toString().padStart(2, '0')
    } else {
        return ct.getUTCFullYear().toString()
            + '-'
            + (ct.getUTCMonth() + 1).toString().padStart(2, '0')
            + '-'
            + ct.getUTCDate().toString().padStart(2, '0')
            + ':'
            + ct.getUTCHours().toString().padStart(2, '0')
            + ':'
            + ct.getUTCMinutes().toString().padStart(2, '0')
            + ':'
            + ct.getUTCSeconds().toString().padStart(2, '0')
    }
}

/**
 * get just numbers of Date,
 * @example
 * toDateNums(new Date()); // 20221010091030
 * @param ct
 */
export function toDateNums(ct: Date) {
    return ct.getFullYear().toString() +
        (ct.getMonth() + 1).toString().padStart(2, '0') +
        ct.getDate().toString().padStart(2, '0') +
        ct.getHours().toString().padStart(2, '0') +
        ct.getMinutes().toString().padStart(2, '0') +
        ct.getSeconds().toString().padStart(2, '0')
}


/**
 * get random integer number in n >= min and n < max
 * @param min min in range
 * @param max max in range (not include)
 */
export function randomInt(min, max): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

/**
 * get random float number in n >= min and n < max
 * @param min min in range
 * @param max max in range (not include)
 */
export function randomFloat(min, max): number {
    return (Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

/**
 * get random string of specified length, max length is 32
 * @param size
 */
export function randomStr(size: number) {
    if (size > 32) {
        throw Error('### size is too big')
    }
    return crypto.randomUUID().replaceAll('-', '').slice(0, size)
}


const gSpReg = /[^\ ]+/g

/**
 * split string with space removing contiguous spaces
 * @param s target string
 */
export function splitSpace(s: string): string[] {
    return s.match(gSpReg)
}

/**
 * split string with delimiter
 * @param s target string
 * @param delc delimiter character
 */
export function split(s: string, delc: string = ' ') {
    const myRe = new RegExp(`[^${delc}]+`, 'g');
    return s.match(myRe)
}

export function randomStrAlpha(n: number) {
    if (n > 32) {
        throw Error('INVALID_SIZE')
    }
    const u = crypto.randomUUID()
    const t = u.replace('-', '')
    const fcode = t.charCodeAt(0)

    if (fcode >= 48 && fcode <= 57) { // '0' ~ '9'
        const rc = String.fromCharCode(randomInt(97, 123)) + t.slice(1, n)
        return rc;
    } else {
        return t.slice(0, n)
    }
}

/**
 * run an application
 * @param cmd application to run
 * @param args arguments lists
 * @param maxLines max lines for capturing outputs, default is no limit
 * @return stdout lines
 */
export async function runCmd(cmd: string, args: string[], maxLines?: number): Promise<string[]> {
    return new Promise((res, rej) => {
        const lines: string[] = []
        const proc = spawn(cmd, args)
        const rl = readline.createInterface({input: proc.stdout})
        rl.on('line', line => {
            if (maxLines !== undefined) {
                if (lines.length < maxLines) {
                    lines.push(line)
                }
            } else {
                lines.push(line)
            }
        })
        proc.on('error', err => {

        })
        proc.on('close', code => {
            if (!code) {
                res(lines)
            } else {
                rej(new Error(`EXIT_CODE:${code}`))
            }
        })
    })
}

/**
 * convert size string to number
 * @param val - number+specifier('G', 'M', 'K'), ex) 0.5M == 0.5 mega byte
 * @return {number} size as bytes
 */
export function resolveSize(val: string): number {
    const unit = val.slice(-1)
    if (unit == 'M' || unit == 'm') {
        const n = val.slice(0, -1)
        return Number.parseFloat(n) * 1024 * 1024
    } else if (unit == 'k' || unit == 'K') {
        const n = val.slice(0, -1)
        return Number.parseFloat(n) * 1024
    } else if (unit == 'G' || unit == 'g') {
        const n = val.slice(0, -1)
        return Number.parseFloat(n) * 1024 * 1024 * 1024
    } else {
        return Number.parseFloat(val)
    }
}

/**
 * get milliseconds from day-time string
 * @example
 * resolveDayTime('1d'); // it will return for milliseconds 1 day
 * resolveDayTime('1d30m'); // it will return for milliseconds 1 day + 30 minutes
 *
 * @param val number+specifier, specifier is 'd' or 'h' or 'm' or 's'
 */
export function resolveDayTime(val: string): number {
    return durStr2Ms(val)
}

/**
 * resolve a file if it is a js or executable file
 * @param file target file path
 * @return 'js' or 'exe' or 'undefined'
*/
export function resolveFile(file: string): string {
    const pfn = path.parse(file);
    if(pfn.ext == '.js' || pfn.ext == '.cjs' || pfn.ext == 'mjs') {
        return 'js'
    }
    let hf;
    let res: string;
    try {
        hf = fs.openSync(file, 'r')
        const buf = new Uint8Array(64)
        const rc = fs.readSync(hf, buf)
        if(rc > 4 && buf[0]==0x7f && buf[1]==0x45 && buf[2]==0x4c && buf[3]==0x46) { // ELF check
            res = 'exe'
        }

        const shebang = new TextDecoder().decode(buf);
        if(shebang.slice(0,1)=='#') {
            const vs = splitSpace(shebang.split('\n')[0])
            if(vs[1]=='node' || vs[1]=='nodejs') {
                res = 'js'
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if(hf) {
            fs.closeSync(hf)
        }
    }

    return res
}

/**
 * return /etc/os-release information
 *
 * @return OsReleaseInfo
 */
export async function osRelease(): Promise<OsReleaseInfo> {
    return new Promise((res, rej) => {
        if(["linux", 'darwin'].indexOf(os.platform() ) != -1) {
            const info = {} as OsReleaseInfo
            fs.readFile('/etc/os-release', (err, data) => {
                const stream = new Readable()
                stream.push(data); stream.push(null)
                const rl = readline.createInterface({input: stream, crlfDelay:Infinity})
                rl.on('line', line => {
                    const [key, value] = line.split('=')
                    info[key] = value.replace(/"/g,'');
                    // info[key] = value.replaceAll('"', '')
                })
                rl.on('close', ()=> {
                    res(info)
                })
            })
        } else {
            rej(Error('NOT_SUPPORTED'))
        }
    })
}