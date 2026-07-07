declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
    };
  }
}

let loadPromise: Promise<void> | null = null;

export function ensureMathJax() {
  if (window.MathJax?.typesetPromise) {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.defer = true;
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MathJax"));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}

export async function typesetMath(element: Element | null) {
  if (!element) {
    return;
  }
  await ensureMathJax();
  await window.MathJax?.typesetPromise?.([element]);
}
