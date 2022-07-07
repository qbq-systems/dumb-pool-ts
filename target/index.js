"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const child_process_1 = require("child_process");
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = require("node:os");
const cores = (0, node_os_1.cpus)().length;
class Pool {
    /**
     * Pool constructor
     *
     * @param {number} numCPU Number of processor cores to use in the pool
     */
    constructor(numCPU = cores) {
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
         *
         * @private
         */
        this.numCPUs = 1;
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
        this.numCPUs = numCPU;
        this.init();
    }
    /**
     * Checks that all current tasks are completed
     */
    allDone() {
        return this.freeCPUs() === this.numCPUs;
    }
    /**
     * Terminates the workers and the main process
     */
    exit() {
        this.stopWorkers();
        process.exit(0);
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
            const env = {};
            Object.entries(process.env).forEach((item) => {
                const [k, v] = item;
                if (k.indexOf('DUMMY_') === 0) {
                    // @ts-ignore
                    env[k] = v;
                }
            });
            while (true) {
                const cpuID = this.workers.length;
                // @ts-ignore
                env.CPU_ID = cpuID;
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
                (0, child_process_1.exec)(`taskset -pc ${cpuID} ${worker.process.pid}`);
                if (this.workers.length === this.numCPUs) {
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
            throw new Error('Unknown cluster state');
        }
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
            throw new Error('Task cannot be started in worker');
            process.exit(1);
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
            throw new Error('Free CPU not found');
            process.exit(1);
        }
        const i = this.currentTaskID;
        if (this.collectStatistics) {
            if (!this.statistics[cpuID]) {
                this.statistics[cpuID] = [];
            }
            this.statistics[cpuID].push(i);
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