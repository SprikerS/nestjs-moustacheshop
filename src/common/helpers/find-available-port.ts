import net from 'node:net'

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1))
      } else {
        reject(err)
      }
    })

    server.once('listening', () => {
      server.close(() => resolve(startPort))
    })

    server.listen(startPort)
  })
}

export { findAvailablePort }
