interface CodeSection {
  title: string;
  code: string;
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPythonScript(filename: string, sections: CodeSection[]) {
  const body = sections
    .map((s) => `# %% ${s.title}\n${s.code}`)
    .join("\n\n\n");
  downloadBlob(filename, body + "\n", "text/x-python");
}

export function downloadNotebook(filename: string, sections: CodeSection[]) {
  const cells = sections.flatMap((s) => [
    {
      cell_type: "markdown",
      metadata: {},
      source: [`## ${s.title}`],
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: s.code.split("\n").map((line, i, arr) => (i < arr.length - 1 ? line + "\n" : line)),
    },
  ]);

  const notebook = {
    cells,
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python", version: "3.x" },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };

  downloadBlob(filename, JSON.stringify(notebook, null, 2), "application/x-ipynb+json");
}
