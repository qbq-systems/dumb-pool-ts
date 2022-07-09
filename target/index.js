"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const node_child_process_1 = require("node:child_process");
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = require("node:os");
const cores = (0, node_os_1.cpus)().length;
class Pool {
    /**
     * Pool constructor
     *
     * @param {boolean} pinPrimary Pin primary process to core #0
     */
    constructor(pinPrimary = true) {
        /**
         * You can collect statistics on the use of processor cores
         */
        this.collectStatistics = false;
        /**
         * Common context for all tasks
         *
         * @private
         */
        this.ctx = {};
        /**
         * Current task ID
         *
         * @private
         */
        this.currentTaskID = 0;
        /**
         * Pin primary process to core #0
         */
        this.pinPrimary = true;
        /**
         * Pool size (number of workers)
         *
         * @private
         */
        this.poolSize = 1;
        /**
         * Statistics in list format, where the key is the processor core number and the value is a list of completed tasks
         */
        this.statistics = [];
        /**
         * Task results cache
         *
         * @private
         */
        this.taskResponse = [];
        /**
         * List of workers, where each worker is pinned to a specific processor core
         *
         * @private
         */
        this.workers = [];
        this.pinPrimary = pinPrimary;
        this.poolSize = pinPrimary && cores > 2 ? cores - 1 : cores;
    }
    /**
     * Checks that all current tasks are completed
     */
    allDone() {
        return this.freeCPUs() === this.poolSize;
    }
    /**
     * Terminates the workers and the main process
     */
    exit() {
        this.stopWorkers();
        process.exit(0);
    }
    /**
     * Throw new error and stop all processes without properly stopping workers
     *
     * @param {string} msg Error description
     * @private
     */
    fatalError(msg) {
        throw new Error(msg);
        process.exit(1);
    }
    /**
     * Returns the number of free processor cores
     *
     * @private
     */
    freeCPUs() {
        let c = 0;
        this.workers.forEach((worker) => {
            // @ts-ignore
            if (worker.busy === false) {
                c += 1;
            }
        });
        return c;
    }
    /**
     * Determines if there are free CPU cores to run tasks
     */
    hasFreeCPU() {
        return this.freeCPUs() > 0;
    }
    /**
     * Initializes the pool and workers
     *
     * @private
     */
    init() {
        if (node_cluster_1.default.isPrimary) {
            if (this.pinPrimary) {
                this.pinProcess(0, process.pid);
                if (this.collectStatistics) {
                    this.statistics.push([-1]);
                }
            }
            const env = {};
            Object.entries(process.env).forEach((item) => {
                const [k, v] = item;
                if (k.indexOf('DUMB_') === 0) {
                    // @ts-ignore
                    env[k] = v;
                }
            });
            while (true) {
                const coreID = this.pinPrimary ? this.workers.length + 1 : this.workers.length;
                // @ts-ignore
                env.CPU_ID = coreID;
                const worker = node_cluster_1.default.fork(env);
                // @ts-ignore
                worker.busy = false;
                worker.on('message', (data) => {
                    // @ts-ignore
                    this.taskResponse[data.i] = data.r;
                    // @ts-ignore
                    worker.busy = false;
                });
                this.workers.push(worker);
                // @ts-ignore
                this.pinProcess(coreID, worker.process.pid);
                if (this.workers.length === this.poolSize) {
                    break;
                }
            }
        }
        else if (node_cluster_1.default.isWorker) {
            process.on('message', async (data) => {
                // @ts-ignore
                const f = Function(`return ${data.f}`);
                let r;
                // @ts-ignore
                if (data.f.indexOf('async') !== -1) {
                    // @ts-ignore
                    r = await f()({ ctx: this.ctx, args: data.a, i: data.i });
                }
                else {
                    // @ts-ignore
                    r = f()({ ctx: this.ctx, args: data.a, i: data.i });
                }
                // @ts-ignore
                process.send({
                    // @ts-ignore
                    i: data.i,
                    r,
                });
            });
        }
        else {
            this.fatalError('Unknown cluster state');
        }
        return true;
    }
    /**
     * Pin process to CPU core via taskset
     *
     * @param {number} coreID
     * @param {number} processID
     * @private
     */
    pinProcess(coreID, processID) {
        (0, node_child_process_1.exec)(`taskset -pc ${coreID} ${processID}`);
        return true;
    }
    /**
     * Starts a task
     *
     * @param {Function} f Task code
     * @param {any[]} args Task arguments
     */
    async runTask(f, ...args) {
        if (node_cluster_1.default.isWorker) {
            this.fatalError('Task cannot be started in worker');
        }
        args = args.map((a) => {
            if (typeof a === 'function' || a?.constructor?.toString().substring(0, 5) === 'class') {
                a = a.toString();
            }
            return a;
        });
        let cpuID = -1;
        for (const [idx, worker] of this.workers.entries()) {
            // @ts-ignore
            if (worker.busy === false) {
                cpuID = idx;
                break;
            }
        }
        if (cpuID === -1) {
            this.fatalError('Free CPU not found');
        }
        const i = this.currentTaskID;
        if (this.collectStatistics) {
            const scpuID = this.pinPrimary && this.poolSize !== cores ? cpuID + 1 : cpuID;
            if (!this.statistics[scpuID]) {
                this.statistics[scpuID] = [];
            }
            this.statistics[scpuID].push(i);
        }
        // @ts-ignore
        this.workers[cpuID].busy = true;
        this.workers[cpuID].send({
            a: args,
            f: f.toString(),
            i,
        });
        this.currentTaskID += 1;
        return new Promise((res, rej) => {
            const interval = setInterval(() => {
                if (this.taskResponse[i]) {
                    clearInterval(interval);
                    res(this.taskResponse[i]);
                    delete this.taskResponse[i];
                }
            }, 1);
        });
    }
    /**
     * Sets the value of the task execution context
     *
     * @param {string} k Key
     * @param {any} v Value
     */
    setCtx(k, v) {
        // @ts-ignore
        this.ctx[k] = v;
        return this;
    }
    /**
     * Change pool size
     *
     * @param {number} size Number of processor cores to use in the pool
     */
    setPoolSize(size) {
        if (node_cluster_1.default.isWorker) {
            this.fatalError('Pool size cannot be changed in worker');
        }
        else if (size <= 0) {
            this.fatalError('Pool size cannot be lower than 1');
        }
        else if (size > cores) {
            this.fatalError(`Pool size cannot be greater than ${cores}`);
        }
        else if (this.currentTaskID > 0) {
            this.fatalError('Pool size cannot be changed after first executed task');
        }
        this.poolSize = size;
        return this;
    }
    /**
     * Stops workers
     */
    stopWorkers() {
        this.workers.forEach((worker) => {
            worker.destroy();
        });
        return true;
    }
}
exports.Pool = Pool;
//# sourceMappingURL=index.js.map