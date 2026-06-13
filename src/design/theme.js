import { TOKENS, TOKEN_VAR } from './tokens.js';

function themeCSS() {
  const block = (sel, t) => sel + '{' + Object.entries(t).map(([k, v]) => (TOKEN_VAR[k] || ('--' + k)) + ':' + v + ';').join('') + '--grey:var(--neutral);--grey-soft:var(--neutral-soft);}';
  return block('.a-root', TOKENS.light) + block('.a-root[data-theme="dark"]', TOKENS.dark) + block('.a-root[data-theme="contrast"]', TOKENS.contrast);
}


export { themeCSS };
