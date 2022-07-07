## Description

Dumb process pool with CPU cores binding for 'heavy' tasks. A CPU core can only perform one task at a time. Linux only.

## Example

[test.ts](./test.ts)

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
run task with x = 17
cpu #1 finished processing task #1 with env.SOME_VAR = 1 args.x = 27 and result = 127 during 1000176975 nanoseconds
cpu #0 finished processing task #0 with env.SOME_VAR = 1 args.x = 28 and result = 128 during 1000058933 nanoseconds
task with x = 27 result: 127
run task with x = 16
task with x = 28 result: 128
run task with x = 15
cpu #2 finished processing task #2 with env.SOME_VAR = 1 args.x = 26 and result = 126 during 1000092278 nanoseconds
task with x = 26 result: 126
run task with x = 14
cpu #4 finished processing task #4 with env.SOME_VAR = 1 args.x = 24 and result = 124 during 1000084104 nanoseconds
task with x = 24 result: 124
run task with x = 13
cpu #3 finished processing task #3 with env.SOME_VAR = 1 args.x = 25 and result = 125 during 1000083544 nanoseconds
task with x = 25 result: 125
cpu #6 finished processing task #6 with env.SOME_VAR = 1 args.x = 22 and result = 122 during 1000084462 nanoseconds
run task with x = 12
task with x = 22 result: 122
cpu #5 finished processing task #5 with env.SOME_VAR = 1 args.x = 23 and result = 123 during 1000064807 nanoseconds
task with x = 23 result: 123
run task with x = 11
cpu #7 finished processing task #7 with env.SOME_VAR = 1 args.x = 21 and result = 121 during 1000077036 nanoseconds
task with x = 21 result: 121
run task with x = 10
run task with x = 9
cpu #10 finished processing task #10 with env.SOME_VAR = 1 args.x = 18 and result = 118 during 1000184858 nanoseconds
task with x = 18 result: 118
cpu #9 finished processing task #9 with env.SOME_VAR = 1 args.x = 19 and result = 119 during 1000059523 nanoseconds
run task with x = 8
task with x = 19 result: 119
run task with x = 7
cpu #11 finished processing task #11 with env.SOME_VAR = 1 args.x = 17 and result = 117 during 1000085895 nanoseconds
task with x = 17 result: 117
run task with x = 6
cpu #0 finished processing task #12 with env.SOME_VAR = 1 args.x = 16 and result = 116 during 1000080925 nanoseconds
task with x = 16 result: 116
run task with x = 5
cpu #1 finished processing task #13 with env.SOME_VAR = 1 args.x = 15 and result = 115 during 1000067807 nanoseconds
task with x = 15 result: 115
run task with x = 4
cpu #2 finished processing task #14 with env.SOME_VAR = 1 args.x = 14 and result = 114 during 1000083116 nanoseconds
task with x = 14 result: 114
run task with x = 3
cpu #4 finished processing task #15 with env.SOME_VAR = 1 args.x = 13 and result = 113 during 1000074635 nanoseconds
task with x = 13 result: 113
run task with x = 2
cpu #3 finished processing task #16 with env.SOME_VAR = 1 args.x = 12 and result = 112 during 1000177842 nanoseconds
task with x = 12 result: 112
run task with x = 1
cpu #5 finished processing task #17 with env.SOME_VAR = 1 args.x = 11 and result = 111 during 1000079215 nanoseconds
task with x = 11 result: 111
cpu #7 finished processing task #19 with env.SOME_VAR = 1 args.x = 9 and result = 109 during 1000176115 nanoseconds
task with x = 9 result: 109
cpu #9 finished processing task #20 with env.SOME_VAR = 1 args.x = 8 and result = 108 during 1000081620 nanoseconds
task with x = 8 result: 108
cpu #10 finished processing task #21 with env.SOME_VAR = 1 args.x = 7 and result = 107 during 1000071456 nanoseconds
task with x = 7 result: 107
cpu #11 finished processing task #22 with env.SOME_VAR = 1 args.x = 6 and result = 106 during 1000283933 nanoseconds
task with x = 6 result: 106
cpu #0 finished processing task #23 with env.SOME_VAR = 1 args.x = 5 and result = 105 during 1000021366 nanoseconds
task with x = 5 result: 105
cpu #1 finished processing task #24 with env.SOME_VAR = 1 args.x = 4 and result = 104 during 1000018536 nanoseconds
task with x = 4 result: 104
cpu #2 finished processing task #25 with env.SOME_VAR = 1 args.x = 3 and result = 103 during 1000011628 nanoseconds
task with x = 3 result: 103
cpu #4 finished processing task #26 with env.SOME_VAR = 1 args.x = 2 and result = 102 during 1000013741 nanoseconds
task with x = 2 result: 102
cpu #3 finished processing task #27 with env.SOME_VAR = 1 args.x = 1 and result = 101 during 1000018287 nanoseconds
task with x = 1 result: 101
cpu #6 finished processing task #18 with env.SOME_VAR = 1 args.x = 10 and result = 110 during 2000815854 nanoseconds
task with x = 10 result: 110
cpu #8 finished processing task #8 with env.SOME_VAR = 1 args.x = 20 and result = 120 during 3002264849 nanoseconds
task with x = 20 result: 120

stat:

cpu #0 processed tasks 0, 12, 23
cpu #1 processed tasks 1, 13, 24
cpu #2 processed tasks 2, 14, 25
cpu #3 processed tasks 3, 16, 27
cpu #4 processed tasks 4, 15, 26
cpu #5 processed tasks 5, 17
cpu #6 processed tasks 6, 18
cpu #7 processed tasks 7, 19
cpu #8 processed tasks 8
cpu #9 processed tasks 9, 20
cpu #10 processed tasks 10, 21
cpu #11 processed tasks 11, 22
```

## License

[MIT](./LICENSE)