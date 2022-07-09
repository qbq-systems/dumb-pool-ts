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
     * Pin primary process to core #0
     */
    private readonly pinPrimary: boolean = true

    /**
     * Pool size (number of workers)
     *
     * @private
     */
    private poolSize: number = 1

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
     * @param {boolean} pinPrimary Pin primary process to core #0
     */
    constructor(pinPrimary: boolean = true) {
        this.pinPrimary = pinPrimary
        this.poolSize = pinPrimary && cores > 2 ? cores - 1 : cores
    }

    /**
     * Checks that all current tasks are completed
     */
    allDone(): boolean {
        return this.freeCPUs() === this.poolSize
    }

    /**
     * Terminates the workers and the main process
     */
    exit() {
        this.stopWorkers()
        process.exit(0)
    }

    /**
     * Throw new error and stop all processes without properly stopping workers
     *
     * @param {string} msg Error description
     * @private
     */
    private fatalError(msg: string) {
        throw new Error(msg)
        process.exit(1)
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
    init(): boolean {
        if (cluster.isPrimary) {
            if (this.pinPrimary) {
                this.pinProcess(0, process.pid)
                if (this.collectStatistics) {
                    this.statistics.push([-1])
                }
            }
            const env = {}
            Object.entries(process.env).forEach((item: [string, string|undefined] ) => {
                const [k, v] = item
                if (k.indexOf('DUMB_') === 0) {
                    // @ts-ignore
                    env[k] = v
                }
            })
            while (true) {
                const coreID = this.pinPrimary ? this.workers.length + 1 : this.workers.length
                // @ts-ignore
                env.CPU_ID = coreID
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
                // @ts-ignore
                this.pinProcess(coreID, worker.process.pid)
                if (this.workers.length === this.poolSize) {
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
            this.fatalError('Unknown cluster state')
        }

        return true
    }

    /**
     * Pin process to CPU core via taskset
     *
     * @param {number} coreID
     * @param {number} processID
     * @private
     */
    private pinProcess(coreID: number, processID: number): boolean {
        exec(`taskset -pc ${coreID} ${processID}`)

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
            this.fatalError('Task cannot be started in worker')
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
            this.fatalError('Free CPU not found')
        }
        const i = this.currentTaskID
        if (this.collectStatistics) {
            const scpuID = this.pinPrimary && this.poolSize !== cores ? cpuID + 1 : cpuID
            if (!this.statistics[scpuID]) {
                this.statistics[scpuID] = []
            }
            this.statistics[scpuID].push(i)
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
     * Change pool size
     *
     * @param {number} size Number of processor cores to use in the pool
     */
    setPoolSize(size: number): Pool {
        if (cluster.isWorker) {
            this.fatalError('Pool size cannot be changed in worker')
        } else if (size <= 0 ) {
            this.fatalError('Pool size cannot be lower than 1')
        } else if (size > cores) {
            this.fatalError(`Pool size cannot be greater than ${cores}`)
        } else if (this.currentTaskID > 0) {
            this.fatalError('Pool size cannot be changed after first executed task')
        }
        this.poolSize = size

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