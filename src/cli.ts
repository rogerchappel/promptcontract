#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Command } from 'commander';
import { checkPrompts } from './check.js';
import { renderReport, type ReportFormat } from './report.js';

const program = new Command();

program
  .name('promptcontract')
  .description('Validate prompt markdown files against explicit input, output, risk, and example contracts.')
  .version('0.1.0');

program
  .command('check')
  .argument('<patterns...>', 'Glob patterns for prompt markdown files')
  .option('--report <format>', 'Report format: markdown or json', 'markdown')
  .option('--output <path>', 'Write the report to a file instead of stdout')
  .description('Validate one or more prompt contract files')
  .action(async (patterns: string[], options: { report: string; output?: string }) => {
    const format = parseReportFormat(options.report);
    const report = await checkPrompts(patterns);
    const rendered = renderReport(report, format);

    if (options.output) {
      await mkdir(path.dirname(options.output), { recursive: true });
      await writeFile(options.output, rendered);
    } else {
      process.stdout.write(rendered);
    }

    process.exitCode = report.ok ? 0 : 1;
  });

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`promptcontract: ${message}`);
  process.exitCode = 1;
});

function parseReportFormat(value: string): ReportFormat {
  if (value === 'markdown' || value === 'json') {
    return value;
  }

  throw new Error(`Unsupported report format "${value}". Use "markdown" or "json".`);
}
