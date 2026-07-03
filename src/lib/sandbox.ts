/**
 * Builds a sandboxed iframe document that renders an AI-generated
 * React component using esm.sh + Babel standalone. Runs fully
 * isolated from the studio app.
 */
export function buildSandboxDoc(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body, #root { margin: 0; height: 100%; background: #0b0b10; overflow: hidden; }
  #err { position: fixed; inset: auto 0 0 0; padding: 12px 16px; font: 12px monospace; color: #ff8080; background: #1a0d0d; white-space: pre-wrap; display: none; z-index: 99; }
</style>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19",
    "react-dom/client": "https://esm.sh/react-dom@19/client",
    "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime",
    "three": "https://esm.sh/three@0.170.0",
    "@react-three/fiber": "https://esm.sh/@react-three/fiber@9?deps=react@19,three@0.170.0",
    "@react-three/drei": "https://esm.sh/@react-three/drei@10?deps=react@19,three@0.170.0"
  }
}
</script>
<script src="https://esm.sh/@babel/standalone@7/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<div id="err"></div>
<script>
  const SOURCE = ${JSON.stringify(code)};
  const errEl = document.getElementById("err");
  function showError(message) {
    errEl.style.display = "block";
    errEl.textContent = String(message);
  }
  window.addEventListener("error", (e) => showError(e.message));
  window.addEventListener("unhandledrejection", (e) => showError(e.reason));
  try {
    const transformed = Babel.transform(SOURCE, {
      filename: "scene.tsx",
      presets: [["react", { runtime: "automatic" }], "typescript"],
    }).code;
    // Replace the default export with a window hook so we can mount it.
    let componentName = null;
    let mountable = transformed.replace(
      /export\\s+default\\s+function\\s+(\\w+)/,
      (_m, name) => { componentName = name; return "function " + name; }
    );
    mountable = mountable.replace(
      /export\\s+default\\s+(\\w+);?/,
      (_m, name) => { componentName = name; return ""; }
    );
    if (componentName) {
      mountable += "\\nwindow.__NocturneComponent = " + componentName + ";";
    }
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = mountable +
      "\\nimport { createRoot } from 'react-dom/client';" +
      "\\nimport { createElement } from 'react';" +
      "\\nconst C = window.__NocturneComponent;" +
      "\\nif (!C) { document.getElementById('err').style.display='block'; document.getElementById('err').textContent='No default export component found.'; }" +
      "\\nelse { createRoot(document.getElementById('root')).render(createElement(C)); }";
    document.body.appendChild(script);
  } catch (err) {
    showError(err && err.message ? err.message : err);
  }
</script>
</body>
</html>`;
}
