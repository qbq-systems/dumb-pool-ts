export declare class Pool {
    /**
     * You can collect statistics on the use of processor cores
     */
    collectStatistics: boolean;
    /**
     * Common context for all tasks
     *
     * @private
     */
    private ctx;
    /**
     * Current task ID
     *
     * @private
     */
    private currentTaskID;
    /**
     * Pin primary process to core #0
     */
    private readonly pinPrimary;
    /**
     * Pool size (number of workers)
     *
     * @private
     */
    private poolSize;
    /**
     * Statistics in list format, where the key is the processor core number and the value is a list of completed tasks
     */
    statistics: any;
    /**
     * Task results cache
     *
     * @private
     */
    private taskResponse;
    /**
     * List of workers, where each worker is pinned to a specific processor core
     *
     * @private
     */
    private workers;
    /**
     * Pool constructor
     *
     * @param {boolean} pinPrimary Pin primary process to core #0
     */
    constructor(pinPrimary?: boolean);
    /**
     * Checks that all current tasks are completed
     */
    allDone(): boolean;
    /**
     * Terminates the workers and the main process
     */
    exit(): void;
    /**
     * Throw new error and stop all processes without properly stopping workers
     *
     * @param {string} msg Error description
     * @private
     */
    private fatalError;
    /**
     * Returns the number of free processor cores
     *
     * @private
     */
    private freeCPUs;
    /**
     * Determines if there are free CPU cores to run tasks
     */
    hasFreeCPU(): boolean;
    /**
     * Initializes the pool and workers
     *
     * @private
     */
    init(): boolean;
    /**
     * Pin process to CPU core via taskset
     *
     * @param {number} coreID
     * @param {number} processID
     * @private
     */
    private pinProcess;
    /**
     * Starts a task
     *
     * @param {Function} f Task code
     * @param {any[]} args Task arguments
     */
    runTask(f: Function, ...args: any[]): Promise<any>;
    /**
     * Sets the value of the task execution context
     *
     * @param {string} k Key
     * @param {any} v Value
     */
    setCtx(k: string, v: any): Pool;
    /**
     * Change pool size
     *
     * @param {number} size Number of processor cores to use in the pool
     */
    setPoolSize(size: number): Pool;
    /**
     * Stops workers
     */
    stopWorkers(): boolean;
}
//# sourceMappingURL=index.d.ts.map