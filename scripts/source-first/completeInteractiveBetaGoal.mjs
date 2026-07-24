import { execFileSync } from 'node:child_process'

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function main() {
  const commands = [
    ['workflows:compile-interactive'],
    ['workflows:research-inactive'],
    ['ui:generate-visual-assets'],
    ['validate:interactive-workflows'],
    ['test:interactive-soap-all'],
    ['test:interactive-random-sample'],
    ['beta:validate-complete'],
    ['build'],
  ]
  for (const [script] of commands) run(npm, ['run', script])
  console.log(JSON.stringify({ status: 'LOCAL_COMPLETION_GATES_PASS', deployment: 'manual_beta_only_after_review', note: 'No push or deployment is performed by this local gate run.' }, null, 2))
}

main()
