import { hasFrontmatter } from './frontmatter.js';
import { extractPlaceholders } from './placeholders.js';
import type { ContractExample, ContractInput, ContractOutput, FileResult, Finding, PromptFile } from './types.js';

export function validatePromptFile(prompt: PromptFile, source: string): FileResult {
  const findings: Finding[] = [];
  const placeholders = extractPlaceholders(prompt.body);
  const contract = prompt.contract;

  if (!hasFrontmatter(source)) {
    findings.push(error(prompt.path, 'missing-frontmatter', 'Prompt file must start with YAML frontmatter delimited by --- markers.'));
  }

  if (!isNonEmptyString(contract.name)) {
    findings.push(error(prompt.path, 'missing-name', 'Contract must declare a non-empty name.', 'name'));
  }

  if (!isNonEmptyString(contract.version)) {
    findings.push(error(prompt.path, 'missing-version', 'Contract must declare a non-empty version.', 'version'));
  }

  const inputs = readInputs(contract.inputs, prompt.path, findings);
  const outputs = readOutputs(contract.outputs, prompt.path, findings);
  const risks = readRisks(contract.risks, prompt.path, findings);
  const examples = readExamples(contract.examples, prompt.path, findings);

  if (outputs.length === 0) {
    findings.push(error(prompt.path, 'missing-outputs', 'Contract must declare at least one output format.', 'outputs'));
  }

  if (risks.length === 0) {
    findings.push(error(prompt.path, 'missing-risks', 'Contract must declare at least one risk or safety boundary.', 'risks'));
  }

  if (examples.length === 0) {
    findings.push(error(prompt.path, 'missing-examples', 'Contract must declare at least one example.', 'examples'));
  }

  validatePlaceholderContract(prompt.path, placeholders, inputs, examples, findings);

  return {
    path: prompt.path,
    ok: findings.every((finding) => finding.severity !== 'error'),
    placeholders,
    findings
  };
}

function readInputs(value: unknown, path: string, findings: Finding[]): ContractInput[] {
  if (!Array.isArray(value)) {
    findings.push(error(path, 'missing-inputs', 'Contract must declare inputs as an array.', 'inputs'));
    return [];
  }

  const inputs: ContractInput[] = [];
  const seen = new Set<string>();

  value.forEach((item, index) => {
    if (!isRecord(item) || !isNonEmptyString(item.name)) {
      findings.push(error(path, 'invalid-input', `inputs[${index}] must include a non-empty name.`, `inputs[${index}].name`));
      return;
    }

    if (seen.has(item.name)) {
      findings.push(error(path, 'duplicate-input', `Input "${item.name}" is declared more than once.`, `inputs[${index}].name`));
    }

    seen.add(item.name);
    inputs.push({
      name: item.name,
      required: typeof item.required === 'boolean' ? item.required : true,
      description: typeof item.description === 'string' ? item.description : undefined
    });
  });

  return inputs;
}

function readOutputs(value: unknown, path: string, findings: Finding[]): ContractOutput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!isRecord(item) || !isNonEmptyString(item.format)) {
      findings.push(error(path, 'invalid-output', `outputs[${index}] must include a non-empty format.`, `outputs[${index}].format`));
      return [];
    }

    return [{
      format: item.format,
      description: typeof item.description === 'string' ? item.description : undefined
    }];
  });
}

function readRisks(value: unknown, path: string, findings: Finding[]): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!isNonEmptyString(item)) {
      findings.push(error(path, 'invalid-risk', `risks[${index}] must be a non-empty string.`, `risks[${index}]`));
      return [];
    }

    return [item];
  });
}

function readExamples(value: unknown, path: string, findings: Finding[]): ContractExample[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!isRecord(item) || !isNonEmptyString(item.name) || !isRecord(item.inputs)) {
      findings.push(error(path, 'invalid-example', `examples[${index}] must include name and inputs.`, `examples[${index}]`));
      return [];
    }

    return [{
      name: item.name,
      inputs: item.inputs,
      output: item.output
    }];
  });
}

function validatePlaceholderContract(
  path: string,
  placeholders: string[],
  inputs: ContractInput[],
  examples: ContractExample[],
  findings: Finding[]
): void {
  const declaredInputs = new Set(inputs.map((input) => input.name));
  const usedPlaceholders = new Set(placeholders);

  for (const placeholder of placeholders) {
    if (!declaredInputs.has(placeholder)) {
      findings.push(error(path, 'undeclared-placeholder', `Placeholder "{{${placeholder}}}" is not declared in inputs.`, 'inputs'));
    }
  }

  for (const input of inputs) {
    if (input.required !== false && !usedPlaceholders.has(input.name)) {
      findings.push(warning(path, 'unused-input', `Required input "${input.name}" is not referenced by a {{${input.name}}} placeholder.`, 'inputs'));
    }
  }

  examples.forEach((example, index) => {
    for (const placeholder of placeholders) {
      if (!(placeholder in example.inputs)) {
        findings.push(error(path, 'example-missing-input', `examples[${index}] is missing input "${placeholder}".`, `examples[${index}].inputs`));
      }
    }
  });
}

function error(path: string, code: string, message: string, field?: string): Finding {
  return { severity: 'error', code, message, path, field };
}

function warning(path: string, code: string, message: string, field?: string): Finding {
  return { severity: 'warning', code, message, path, field };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
