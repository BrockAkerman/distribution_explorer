import katex from 'katex';
import 'katex/dist/katex.min.css';

export function renderMath(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      errorColor: '#f87171',
      trust: false,
    });
  } catch {
    return `<span style="color:#f87171">${latex}</span>`;
  }
}

export function MathInline({ tex }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: renderMath(tex, false) }}
      style={{ fontSize: '0.95em' }}
    />
  );
}

export function MathBlock({ tex }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderMath(tex, true) }}
      style={{ overflowX: 'auto', padding: '4px 0' }}
    />
  );
}
