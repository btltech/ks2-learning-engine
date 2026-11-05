# Ordering reset review

The reported failure was reproduced on Node **22.23.4** with the original PR code: **1 failure in 24 runs**, using three concurrent copies of `QuizView.test.tsx` and `MatchingQuestion.test.tsx`. It was the same ordering test, submitting `["Two","One"]` / false instead of `["One","Two"]` / true.

## Cause and fix

This is a real state-reset hazard in OrderingQuestion, not just an assertion that needs a longer wait. Its passive effect did two things whenever `[items, onChange]` changed: restore the starting list and notify the parent with that list. That includes initial mount. If a reorder occurs before that effect flushes, the delayed reset can overwrite both the child's display and QuizView's answer. New array/callback identities can also trigger the reset despite unchanged item contents. React documents both [identity-based effect dependencies and deferred passive effects](https://react.dev/reference/react/useEffect).

Two deterministic regressions fail against the original implementation:

1. Trigger the normal Move handler during the commit-to-passive-effect window, then flush effects: the old implementation restores `["Two","One"]`.
2. Reorder, then re-render with an equivalent items array and a new callback: the old implementation restores `["Two","One"]`.

In the current QuizView caller, `currentQuestion.options` is retained in question state and `handleOrderingChange` has a stable callback identity. Ordinary parent re-renders, timer ticks and Check therefore do **not** independently change those dependencies. The unsafe mount/reset effect still exists and must not be allowed to overwrite input; a heading being present also does not prove the initial notification has completed.

The small fix leaves scoring and QuizView's flow unchanged:

- Initialise ordering state once in a content-keyed child. Equivalent item arrays preserve state; genuinely changed contents remount it. QuizView's existing question-index key still resets a new question with identical items.
- The effect only notifies the parent, using a ref updated synchronously by Move. A delayed initial notification or a new callback receives the child's latest order; neither resets state.
- Keep the original shared-flow assertion unchanged. Add direct regressions for the two reset paths and an integration regression that re-renders QuizView, advances the speed timer, checks the answer and advances time after Check, asserting the displayed and submitted order throughout.

## Stress verification

Each fixed-code run includes **all** of `QuizView.test.tsx`, `MatchingQuestion.test.tsx` and `OrderingQuestion.test.tsx` (19 tests). That includes every quiz-flow async wait and timer test, without filtering to ordering alone. Each run uses a fresh Vitest process; concurrent workers use the same checkout and dependency cache.


All stress batches used Node **22.23.4**, Vitest **4.1.12**, React **19.3.1**, and the same checkout/cache. The build command completed successfully and immediately launched the sequential batch; it was not separated by another test or source edit.

| Fixed-code batch | Worker | Consecutive runs | Failures |
| --- | --- | ---: | ---: |
| Immediately after build | 1 | 60 | 0 |
| Three parallel copies | 1 | 60 | 0 |
| Three parallel copies | 2 | 60 | 0 |
| Three parallel copies | 3 | 60 | 0 |

**Total: 240 fixed-code runs, 0 failures, 4,560 test executions.** All async/timer cases in the quiz-flow file were included in every run. No other flakiness, act warnings or runtime errors were found in these logs. The baseline's one failure is reported separately above; it was not omitted or retried into a passing result.

Commands used per run (with the Node 22 binary selected):

```sh
node node_modules/vitest/vitest.mjs run components/QuizView.test.tsx components/MatchingQuestion.test.tsx components/OrderingQuestion.test.tsx
```

Each sequential run waited for the previous process to exit. The parallel batch used three workers, each running the same command 60 times sequentially, with separate output logs and a recorded exit code for every run.

Additional validation: `npm run lint` passed; `npm run build` passed (including PWA generation); the full Node 22 suite passed **344 tests in 69 files**; the three targeted files also passed on Node **20.19.5**. The original shared-flow test and its expected submitted answer/score were not loosened or given an additional wait. Services, scoring, infrastructure and safeguards are unchanged. Nothing merged or deployed.
