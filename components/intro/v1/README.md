# Version 1 preload animation

Recovered from the `feature/kinetic-portfolio` branch at commit
`35dcdffbe95fcb51ffc2eea8d5e0819e5572dae8`.

The original loader was introduced in commit
`611c08832295968eb6cbdaa9d7cfc43ad8bff059`.

## Included files

- `components/loader/SignatureLoader.tsx` — canvas renderer and lifecycle
- `components/loader/loader.css` — original blue radial presentation
- `lib/signature-path.ts` — hand-authored “by Jiewen” and checkmark paths
- `lib/loader-state.ts` — readiness, timing, and timeout state
- `hooks/use-reduced-motion.ts` — motion accessibility dependency
- `tests/loader-state.test.ts` — original state tests

## Integration

Import `components/loader/loader.css` once in the target app’s global
layout or stylesheet. Render `SignatureLoader` with the `fontsReady`,
`imageReady`, and `rendererReady` boolean props. The animation dismisses
after all three are ready, with a hard timeout for safety.
