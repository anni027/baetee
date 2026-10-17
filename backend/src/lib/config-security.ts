export function originList(value: string, production: boolean, name: string) {
  const origins = value.split(",").map(origin => origin.trim())
  for (const origin of origins) {
    let url: URL
    try { url = new URL(origin) } catch { throw new Error(`${name} needs exact origins without wildcards`) }
    if (origin.includes("*") || url.origin !== origin || !["https:", "http:"].includes(url.protocol) || (production && url.protocol !== "https:")) {
      throw new Error(`${name} needs exact ${production ? "HTTPS " : ""}origins without paths or wildcards`)
    }
  }
  return origins.join(",")
}

export function applicationSecret(value: string, name: string) {
  if (value.length < 32 || /replace[-_ ]|supersecret|your[-_ ]secret/i.test(value)) throw new Error(`${name} needs a newly generated secret with at least 32 characters`)
  return value
}
