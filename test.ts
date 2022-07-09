import cluster from 'cluster'
import { Pool } from "./src";

const sleep = (ms: number) => new Promise((r: any) => setTimeout(r, ms))

class Test extends Pool {

    async run() {
        this.setCtx('sleep', sleep)

        if (cluster.isPrimary) {
            this.setPoolSize(3)
            this.init()
            console.log('')
            console.log('tasks:')
            console.log('')
            let x = 28
            const i = setInterval(() => {
                if (x > 0) {
                        if (this.hasFreeCPU()) {
                            console.log(`run task with x = ${x}`)
                            this.runTask(async ({ctx, args, i}) => {
                                const x = Number(args[0])
                                const from = process.hrtime.bigint()
                                let sleep = 0
                                if (x % 30 === 0) {
                                    sleep = 3000
                                } else if (x % 20 === 0) {
                                    sleep = 2000
                                } else if (x % 10 === 0) {
                                    sleep = 1000
                                }
                                while (process.hrtime.bigint() - from < 1_000_000_000) {
                                    const r = Math.random()
                                }
                                if (sleep > 0) {
                                    await ctx.sleep(sleep)
                                }
                                const res = 100 + x
                                console.log(`cpu #${process.env.CPU_ID} finished processing task #${i} with env.SOME_VAR = ${process.env.DUMB_SOME_VAR} and args.x = ${x} and result = ${res} during ${process.hrtime.bigint() - from} nanoseconds`)

                                return {
                                    res,
                                    x,
                                }
                            }, x).then((r: any) => {
                                console.log(`task with x = ${r.x} result: ${r.res}`)
                            })
                            x -= 1
                        }
                } else if (this.allDone() === true) {
                    clearInterval(i)
                    console.log('')
                    console.log('stat:')
                    console.log('')
                    this.statistics.forEach((tasks: any[], cpu: number) => {
                        console.log(`cpu #${cpu} processed tasks ${tasks.join(', ')}`)
                    })
                    this.exit()
                }
            }, 10)
        } else {
            this.init()
        }
    }

}

const t = new Test()
t.collectStatistics = true
t.run()
