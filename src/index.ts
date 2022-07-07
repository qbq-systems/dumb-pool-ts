import { exec } from 'node:child_process'
import { default as cluster, Worker } from 'node:cluster'
import { cpus } from 'node:os'

const cores = cpus().length

export class Pool {

    /**
     * You can collect statistics on the use of processor cores
     */
    collectStatistics: boolean = false

    /**
     * Common context for all tasks
     *
     * @private
     */
    private ctx: object = {}

    /**
     * Current task ID
     *
     * @private
     */
    private currentTaskID: number = 0

    /**
     *
     * @private
     */
    private readonly numCPUs: number = 1

    /**
     * Statistics in list format, where the key is the processor core number and the value is a list of completed tasks
     */
    statistics: any = []

    /**
     * Task results cache
     *
     * @private
     */
    private taskResponse: any[] = []

    /**
     * List of workers, where each worker is pinned to a specific processor core
     *
     * @private
     */
    private workers: Worker[] = []

    /**
     * Pool constructor
     *
     * @param {number} numCPU Number of processor cores to use in the pool
     */
    constructor(numCPU = cores) {
        this.numCPUs = numCPU
        this.init()
    }

    /**
     * Checks that all current tasks are completed
     */
    allDone(): boolean {
        return this.freeCPUs() === this.numCPUs
    }

    /**
     * Terminates the workers and the main process
     */
    exit() {
        this.stopWorkers()
        process.exit(0)
    }

    /**
     * Returns the number of free processor cores
     *
     * @private
     */
    private freeCPUs(): number {
        let c = 0
        this.workers.forEach((worker: Worker) => {
            // @ts-ignore
            if (worker.busy === false) {
                c += 1
            }
        })

        return c
    }

    /**
     * Determines if there are free CPU cores to run tasks
     */
    hasFreeCPU(): boolean {
        return this.freeCPUs() > 0
    }

    /**
     * Initializes the pool and workers
     *
     * @private
     */
    private init(): boolean {
        if (cluster.isPrimary) {
            const env = {}
            Object.entries(process.env).forEach((item: [string, string|undefined] ) => {
                const [k, v] = item
                if (k.indexOf('DUMB_') === 0) {
                    // @ts-ignore
                    env[k] = v
                }
            })
            while (true) {
                const cpuID = this.workers.length
                // @ts-ignore
                env.CPU_ID = cpuID
                const worker = cluster.fork(env)
                // @ts-ignore
                worker.busy = false
                worker.on('message', (data: object) => {
                    // @ts-ignore
                    this.taskResponse[data.i] = data.r
                    // @ts-ignore
                    worker.busy = false
                })
                this.workers.push(worker)
                exec(`taskset -pc ${cpuID} ${worker.process.pid}`)
                if (this.workers.length === this.numCPUs) {
                    break
                }
            }
        } else if (cluster.isWorker) {
            process.on('message', async (data: object) => {
                // @ts-ignore
                const f = Function(`return ${data.f}`)
                let r
                // @ts-ignore
                if (data.f.indexOf('async') !== -1) {
                    // @ts-ignore
                    r = await f()({ctx: this.ctx, args: data.a, i: data.i})
                } else {
                    // @ts-ignore
                    r = f()({ctx: this.ctx, args: data.a, i: data.i})
                }
                // @ts-ignore
                process.send({
                    // @ts-ignore
                    i: data.i,
                    r,
                })
            })
        } else {
            throw new Error('Unknown cluster state')
        }

        return true
    }

    /**
     * Starts a task
     *
     * @param {Function} f Task code
     * @param {any[]} args Task arguments
     */
    async runTask(f: Function, ...args: any[]): Promise<any> {
        if (cluster.isWorker) {
            throw new Error('Task cannot be started in worker')
            process.exit(1)
        }
        args = args.map((a: any) => {
            if (typeof a === 'function' || a?.constructor?.toString().substring(0, 5) === 'class') {
                a = a.toString()
            }

            return a
        })
        let cpuID = -1
        for (const [idx, worker] of this.workers.entries()) {
            // @ts-ignore
            if (worker.busy === false) {
                cpuID = idx
                break
            }
        }
        if (cpuID === -1) {
            throw new Error('Free CPU not found')
            process.exit(1)
        }
        const i = this.currentTaskID
        if (this.collectStatistics) {
            if (!this.statistics[cpuID]) {
                this.statistics[cpuID] = []
            }
            this.statistics[cpuID].push(i)
        }
        // @ts-ignore
        this.workers[cpuID].busy = true
        this.workers[cpuID].send({
            a: args,
            f: f.toString(),
            i,
        })
        this.currentTaskID += 1

        return new Promise((res, rej) => {
            const interval = setInterval(() => {
                if (this.taskResponse[i]) {
                    clearInterval(interval)
                    res(this.taskResponse[i])
                    delete this.taskResponse[i]
                }
            }, 1)
        })
    }

    /**
     * Sets the value of the task execution context
     *
     * @param {string} k Key
     * @param {any} v Value
     */
    setCtx(k: string, v: any): Pool {
        // @ts-ignore
        this.ctx[k] = v

        return this
    }

    /**
     * Stops workers
     */
    stopWorkers(): boolean {
        this.workers.forEach((worker: Worker) => {
            worker.destroy()
        })

        return true
    }

}