/** The process-local relay is available only through a local server hostname. */
export function supportsLocalOutputRelay(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}
