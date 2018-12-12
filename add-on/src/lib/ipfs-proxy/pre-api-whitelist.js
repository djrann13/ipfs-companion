// Some APIs are too sensitive to be exposed to dapps on every website
// We follow a safe security practice of denying everything and allowing access
// to a pre-approved list of known APIs. This way if a new API is added
// it will be blocked by default, until it is explicitly enabled below.
const API_WHITELIST = Object.freeze(require('./api-whitelist.json'))

// Creates a "pre" function that is called prior to calling a real function
// on the IPFS instance. It will throw if access is denied due to API not being whitelisted
function createPreApiWhitelist (permission) {
  return async (...args) => {
    if (!inApiWhitelist(permission)) {
      throw createProxyWhitelistError(permission)
    }
    return args
  }
}

function inApiWhitelist (permission) {
  // Fail fast if API or namespace is not explicitly whitelisted
  const permRoot = permission.split('.')[0]
  return API_WHITELIST.includes(permRoot) || API_WHITELIST.includes(permission)
}

// Standardized error thrown when a command is not on the API_WHITELIST
// TODO: return errors following conventions from https://github.com/ipfs/js-ipfs/pull/1746
function createProxyWhitelistError (permission) {
  const permissions = Array.isArray(permission) ? permission : [permission]
  console.warn(`[ipfs-companion] Access to '${permission}' commands over window.ipfs is blocked. If you feel it should be allowed, open an issue at https://github.com/ipfs-shipyard/ipfs-companion/issues/new`)
  const err = new Error(`Access to '${permission}' commands over IPFS Proxy is globally blocked`)
  err.output = {
    payload: {
      isIpfsProxyError: true,
      isIpfsProxyWhitelistError: true,
      permissions
    }
  }
  return err
}

module.exports = {
  createPreApiWhitelist,
  createProxyWhitelistError,
  inApiWhitelist,
  API_WHITELIST
}
