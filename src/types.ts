export type ContractInput = {
  name: string;
  required?: boolean;
  description?: string;
};

export type ContractOutput = {
  format: string;
  description?: string;
};

export type ContractExample = {
  name: string;
  inputs: Record<string, unknown>;
  output?: unknown;
};

export type PromptContract = {
  name: string;
  version: string;
  description?: string;
  inputs: ContractInput[];
  outputs: ContractOutput[];
  risks: string[];
  examples: ContractExample[];
};

export type PromptFile = {
  path: string;
  contract: Partial<PromptContract>;
  body: string;
  rawFrontmatter: string;
};

export type Severity = 'error' | 'warning';

export type Finding = {
  severity: Severity;
  code: string;
  message: string;
  path: string;
  field?: string;
};

export type FileResult = {
  path: string;
  ok: boolean;
  placeholders: string[];
  findings: Finding[];
};

export type CheckReport = {
  ok: boolean;
  checked: number;
  errors: number;
  warnings: number;
  codes: Record<string, number>;
  files: FileResult[];
};
