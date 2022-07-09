## Description

Dumb process pool with CPU cores binding for 'heavy' tasks. A CPU core can only perform one task at a time. Linux only.

## Example

[test.ts](./test.ts)

By default primary process pined to cpu #0

```shell
$ DUMB_SOME_VAR=1 pnpm test

tasks:

run task with x = 28
run task with x = 27
run task with x = 26
run task with x = 25
run task with x = 24
run task with x = 23
run task with x = 22
run task with x = 21
run task with x = 20
run task with x = 19
run task with x = 18
cpu #1 finished processing task #0 with env.SOME_VAR = 1 and args.x = 28 and result = 128 during 1000075262 nanoseconds
task with x = 28 result: 128
run task with x = 17
cpu #5 finished processing task #4 with env.SOME_VAR = 1 and args.x = 24 and result = 124 during 1000083132 nanoseconds
task with x = 24 result: 124
run task with x = 16
cpu #3 finished processing task #2 with env.SOME_VAR = 1 and args.x = 26 and result = 126 during 1000068218 nanoseconds
task with x = 26 result: 126
run task with x = 15
cpu #8 finished processing task #7 with env.SOME_VAR = 1 and args.x = 21 and result = 121 during 1000075226 nanoseconds
task with x = 21 result: 121
run task with x = 14
cpu #7 finished processing task #6 with env.SOME_VAR = 1 and args.x = 22 and result = 122 during 1000067298 nanoseconds
task with x = 22 result: 122
run task with x = 13
cpu #6 finished processing task #5 with env.SOME_VAR = 1 and args.x = 23 and result = 123 during 1000286521 nanoseconds
task with x = 23 result: 123
run task with x = 12
cpu #10 finished processing task #9 with env.SOME_VAR = 1 and args.x = 19 and result = 119 during 1000073110 nanoseconds
task with x = 19 result: 119
run task with x = 11
cpu #11 finished processing task #10 with env.SOME_VAR = 1 and args.x = 18 and result = 118 during 1000074795 nanoseconds
task with x = 18 result: 118
run task with x = 10
cpu #4 finished processing task #3 with env.SOME_VAR = 1 and args.x = 25 and result = 125 during 1000065919 nanoseconds
task with x = 25 result: 125
run task with x = 9
cpu #2 finished processing task #1 with env.SOME_VAR = 1 and args.x = 27 and result = 127 during 1000076435 nanoseconds
task with x = 27 result: 127
run task with x = 8
cpu #1 finished processing task #11 with env.SOME_VAR = 1 and args.x = 17 and result = 117 during 1000086601 nanoseconds
task with x = 17 result: 117
run task with x = 7
cpu #5 finished processing task #12 with env.SOME_VAR = 1 and args.x = 16 and result = 116 during 1000122229 nanoseconds
task with x = 16 result: 116
run task with x = 6
cpu #3 finished processing task #13 with env.SOME_VAR = 1 and args.x = 15 and result = 115 during 1000064128 nanoseconds
task with x = 15 result: 115
run task with x = 5
cpu #8 finished processing task #14 with env.SOME_VAR = 1 and args.x = 14 and result = 114 during 1000092175 nanoseconds
task with x = 14 result: 114
run task with x = 4
cpu #7 finished processing task #15 with env.SOME_VAR = 1 and args.x = 13 and result = 113 during 1000081008 nanoseconds
task with x = 13 result: 113
run task with x = 3
cpu #6 finished processing task #16 with env.SOME_VAR = 1 and args.x = 12 and result = 112 during 1000096653 nanoseconds
task with x = 12 result: 112
run task with x = 2
cpu #10 finished processing task #17 with env.SOME_VAR = 1 and args.x = 11 and result = 111 during 1000087137 nanoseconds
task with x = 11 result: 111
run task with x = 1
cpu #4 finished processing task #19 with env.SOME_VAR = 1 and args.x = 9 and result = 109 during 1000073870 nanoseconds
task with x = 9 result: 109
cpu #2 finished processing task #20 with env.SOME_VAR = 1 and args.x = 8 and result = 108 during 1000085971 nanoseconds
task with x = 8 result: 108
cpu #1 finished processing task #21 with env.SOME_VAR = 1 and args.x = 7 and result = 107 during 1000024696 nanoseconds
task with x = 7 result: 107
cpu #5 finished processing task #22 with env.SOME_VAR = 1 and args.x = 6 and result = 106 during 1000028275 nanoseconds
task with x = 6 result: 106
cpu #3 finished processing task #23 with env.SOME_VAR = 1 and args.x = 5 and result = 105 during 1000037392 nanoseconds
task with x = 5 result: 105
cpu #8 finished processing task #24 with env.SOME_VAR = 1 and args.x = 4 and result = 104 during 1000018731 nanoseconds
task with x = 4 result: 104
cpu #7 finished processing task #25 with env.SOME_VAR = 1 and args.x = 3 and result = 103 during 1000015791 nanoseconds
task with x = 3 result: 103
cpu #6 finished processing task #26 with env.SOME_VAR = 1 and args.x = 2 and result = 102 during 1000016333 nanoseconds
task with x = 2 result: 102
cpu #10 finished processing task #27 with env.SOME_VAR = 1 and args.x = 1 and result = 101 during 1000014971 nanoseconds
task with x = 1 result: 101
cpu #9 finished processing task #8 with env.SOME_VAR = 1 and args.x = 20 and result = 120 during 3003313202 nanoseconds
task with x = 20 result: 120
cpu #11 finished processing task #18 with env.SOME_VAR = 1 and args.x = 10 and result = 110 during 2002230383 nanoseconds
task with x = 10 result: 110

stat:

cpu #0 processed tasks -1
cpu #1 processed tasks 0, 11, 21
cpu #2 processed tasks 1, 20
cpu #3 processed tasks 2, 13, 23
cpu #4 processed tasks 3, 19
cpu #5 processed tasks 4, 12, 22
cpu #6 processed tasks 5, 16, 26
cpu #7 processed tasks 6, 15, 25
cpu #8 processed tasks 7, 14, 24
cpu #9 processed tasks 8
cpu #10 processed tasks 9, 17, 27
cpu #11 processed tasks 10, 18
```

but you can disable primary process pinning

```ts
// ...
const t = new Test(false)
// ...
```

```
...

stat:

cpu #0 processed tasks 0, 13, 24
cpu #1 processed tasks 1, 12, 23
cpu #2 processed tasks 2, 19
cpu #3 processed tasks 3, 14, 25
cpu #4 processed tasks 4, 15, 26
cpu #5 processed tasks 5, 16, 27
cpu #6 processed tasks 6, 20
cpu #7 processed tasks 7, 17
cpu #8 processed tasks 8
cpu #9 processed tasks 9, 18
cpu #10 processed tasks 10, 21
cpu #11 processed tasks 11, 22
```

and/or change the number of processor cores used

```ts
// ...
class Test extends Pool {

    async run() {
        this.setCtx('sleep', sleep)

        if (cluster.isPrimary) {
            this.setPoolSize(3)
            // ...
        }
    }
}
// ...
```

```
...

stat:

cpu #0 processed tasks -1
cpu #1 processed tasks 0, 3, 6, 9, 11, 13, 16, 19, 21, 24, 27
cpu #2 processed tasks 1, 4, 7, 10, 12, 14, 17, 20, 22, 25
cpu #3 processed tasks 2, 5, 8, 15, 18, 23, 26
```

## Meta

[Changelog](./CHANGELOG.md)

## License

[MIT](./LICENSE)