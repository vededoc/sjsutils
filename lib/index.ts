import * as readline from "readline";
import {spawn} from "child_process";

const crypto = require('node:crypto')

export namespace jsetc {

    export const SEC_MS = 1000
    export const MIN_MS = SEC_MS * 60
    export const HOUR_MS = MIN_MS * 60
    export const DAY_MS = HOUR_MS * 24

    export async function WaitMs(ms: number) {
        return new Promise((res,) => {
            setTimeout(res, ms)
        })
    }

    export async function WaitSec(sec: number) {
        return WaitMs(SEC_MS * sec)
    }

    export async function WaitMin(minute: number) {
        return WaitMs(MIN_MS * minute)
    }

    export async function WaitHour(hour: number) {
        return WaitMs(HOUR_MS * hour)
    }

    export type TimeType = 'hour' | 'min' | 'sec' | 'msec'

    export function DateDiff(d1: Date, d2: Date, out: TimeType = 'sec') {
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
        return (new Date(ct.getFullYear(), ct.getMonth()+1, 0)).getDate()
    }

    export function durStr2Ms(dur: string): number {
        const re =/[0-9]+[Mdhms]/g
        const vs = dur.match(re)
        // console.info(vs)
        let res = 0;
        let unit = 0;
        for(let v of vs) {
            const ts= v[v.length-1]
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
            if(!unit) {
                return -1;
            }
            res += unit * tn;
        }
        return res
    }

    // 2023-01-01 12:00:00 format
    export function toSqlDate(ct: Date, utc: boolean = false) {
        if(!utc) {
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
    export function toDateNums(ct: Date) {
        return ct.getFullYear().toString()+
            (ct.getMonth()+1).toString().padStart(2, '0')+
            ct.getDate().toString().padStart(2, '0')+
            ct.getHours().toString().padStart(2, '0')+
            ct.getMinutes().toString().padStart(2, '0')+
            ct.getSeconds().toString().padStart(2, '0')
    }


    export function randomInt(min, max): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    export function randomFloat(min, max): number {
        return (Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    export function randomStr(size: number) {
        if (size > 32) {
            throw Error('### size is too big')
        }
        return crypto.randomUUID().replace('-', '').slice(0, size)
    }


    const gSpReg = /[^\ ]+/g
    export function splitSpace(s: string): string[] {
        return s.match(gSpReg)
    }

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

    export async function runCmd(cmd: string, args: string[], maxLines?: number): Promise<string[]> {
        return new Promise((res, rej) => {
            const lines: string[] = []
            const proc = spawn(cmd, args)
            const rl = readline.createInterface({input: proc.stdout})
            rl.on('line', line => {
                if(maxLines !== undefined) {
                    if(lines.length < maxLines) {
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
     *
     * @param val
     * number+specifier('G', 'M', 'K')
     * ex) 0.5M == 0.5 mega byte
     */
    export function resolveSize(val: string): number {
        const unit = val.slice(-1)
        if(unit == 'M' || unit == 'm') {
            const n = val.slice(0, -1)
            return Number.parseFloat(n) * 1024*1024
        } else if(unit == 'k' || unit =='K') {
            const n = val.slice(0, -1)
            return Number.parseFloat(n) * 1024
        } else if(unit == 'G' || unit =='g') {
            const n = val.slice(0, -1)
            return Number.parseFloat(n) * 1024*1024*1024
        } else {
            return Number.parseFloat(val)
        }
    }
}