function evaluate(environment = process.env, args = process.argv.slice(2)) {
  const strict = args.includes('--strict') || environment.RELEASE_PREFLIGHT_STRICT === 'true';
  const nodeEnvironment = String(environment.NODE_ENV || '').trim().toLowerCase();
  const dictionaryEnvironment = String(environment.DICTIONARY_ENV || '').trim().toLowerCase();
  const production = nodeEnvironment === 'production' || dictionaryEnvironment === 'production';
  const supabaseUrl = String(environment.EXPO_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseKey = String(environment.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  const offlineFallback = String(environment.EXPO_PUBLIC_OFFLINE_FALLBACK || '').trim().toLowerCase();
  const providerApproved = String(environment.DICTIONARY_PROVIDER_APPROVED || '').trim().toLowerCase();
  const allowedOrigin = String(environment.DICTIONARY_ALLOWED_ORIGIN || '').trim();
  const failures = [];
  const warnings = [];
  if (args.includes('--native')) {
    try {
      const api = new URL(environment.EXPO_PUBLIC_DICTIONARY_API_URL || '');
      if (api.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname)) throw new Error();
    } catch {
      failures.push('Native releases require an absolute hosted HTTPS EXPO_PUBLIC_DICTIONARY_API_URL.');
    }
  }

  function hasValue(value) {
    return value.length > 0;
  }

  function isHttpsOrLocal(urlValue) {
    try {
      const url = new URL(urlValue);
      return url.protocol === 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    } catch {
      return false;
    }
  }

  function looksLikeSecretKey(value) {
    return /service[_-]?role|sb_secret|private[_-]?key|secret/i.test(value);
  }

  if (hasValue(supabaseUrl) !== hasValue(supabaseKey)) {
    failures.push('Supabase public URL and client key must be supplied together.');
  }

  if (supabaseUrl && !isHttpsOrLocal(supabaseUrl)) {
    failures.push('EXPO_PUBLIC_SUPABASE_URL must use HTTPS outside localhost.');
  }

  if (supabaseKey && looksLikeSecretKey(supabaseKey)) {
    failures.push('The Supabase client variable looks like a private/service-role key; use only the public anonymous/publishable key.');
  }

  if (offlineFallback === 'true') {
    failures.push('EXPO_PUBLIC_OFFLINE_FALLBACK=true is not permitted for a release build.');
  }

  if ((strict || production) && allowedOrigin === '*') {
    failures.push('DICTIONARY_ALLOWED_ORIGIN=* is not permitted in production.');
  }

  if (strict && !supabaseUrl) {
    failures.push('Strict release preflight requires the Supabase public client variables for Google login and cloud sync.');
  }

  if ((strict || production) && providerApproved !== 'true') {
    failures.push('Strict/production preflight requires DICTIONARY_PROVIDER_APPROVED=true.');
  }

  if (strict && !allowedOrigin) {
    failures.push('Strict release preflight requires DICTIONARY_ALLOWED_ORIGIN to protect the deployed web origin.');
  }

  if ((strict || production) && allowedOrigin && allowedOrigin !== '*' && !/^https:\/\//i.test(allowedOrigin)) {
    failures.push('Production DICTIONARY_ALLOWED_ORIGIN must be an HTTPS origin.');
  }

  if (!supabaseUrl && !supabaseKey) {
    warnings.push('Supabase is not configured; this is acceptable for local-first development but not for a strict release build.');
  }

  if (!providerApproved && !production && !strict) {
    warnings.push('Provider approval is not set; production startup will require it before serving real lookups.');
  }

  return { failures, warnings, strict };
}

if (require.main === module) {
  const result = evaluate();
  for (const warning of result.warnings) console.warn(`[release-preflight] warning: ${warning}`);
  if (result.failures.length) {
    for (const failure of result.failures) console.error(`[release-preflight] error: ${failure}`);
    process.exit(1);
  }
  console.log(`[release-preflight] passed (${result.strict ? 'strict' : 'local'} mode).`);
}

module.exports = { evaluate };
