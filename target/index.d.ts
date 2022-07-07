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
     *
     * @private
     */
    private readonly numCPUs;
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
     * @param {number} numCPU Number of processor cores to use in the pool
     */
    constructor(numCPU?: number);
    /**
     * Checks that all current tasks are completed
     */
    allDone(): boolean;
    /**
     * Terminates the workers and the main process
     */
    exit(): void;
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
    private init;
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
     * Stops workers
     */
    stopWorkers(): boolean;
}
//# sourceMappingURL=index.d.ts.map