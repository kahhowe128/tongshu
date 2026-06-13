import { TOKENS, TOKEN_VAR, ILL } from './tokens.js';

function themeCSS() {
  const block = (sel, name) => {
    const t = TOKENS[name], il = ILL[name] || {};
    const vars = Object.entries(t).map(([k, v]) => (TOKEN_VAR[k] || ('--' + k)) + ':' + v + ';').join('');
    const ill = Object.entries(il).map(([k, v]) => '--ill-' + k + ':' + v + ';').join('');
    return sel + '{' + vars + ill + '--grey:var(--neutral);--grey-soft:var(--neutral-soft);}';
  };
  return block('.a-root', 'light') + block('.a-root[data-theme="dark"]', 'dark') + block('.a-root[data-theme="contrast"]', 'contrast') + block('.a-root[data-theme="red"]', 'red');
}


export { themeCSS };
