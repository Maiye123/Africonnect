import { execSync } from 'child_process'

const port = process.argv[2] || '3001'

function killPortWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8' })
    const pids = new Set()

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && pid !== '0') pids.add(pid)
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
        console.log(`Freed port ${targetPort} (stopped process ${pid})`)
      } catch {
        // process may have already exited
      }
    }

    if (pids.size === 0) {
      console.log(`Port ${targetPort} is not in use.`)
    }
  } catch {
    console.log(`Port ${targetPort} is not in use.`)
  }
}

killPortWindows(port)
