import type { CheckReport } from './types.js';

export type ReportFormat = 'markdown' | 'json';

export function renderReport(report: CheckReport, format: ReportFormat): string {
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  return renderMarkdownReport(report);
}

function renderMarkdownReport(report: CheckReport): string {
  const lines = [
    '# promptcontract report',
    '',
    `Status: ${report.ok ? 'PASS' : 'FAIL'}`,
    `Checked: ${report.checked}`,
    `Errors: ${report.errors}`,
    `Warnings: ${report.warnings}`,
    ''
  ];

  const codes = Object.entries(report.codes).sort(([left], [right]) => left.localeCompare(right));
  if (codes.length > 0) {
    lines.push('## Finding Codes', '');
    for (const [code, count] of codes) {
      lines.push(`- ${code}: ${count}`);
    }
    lines.push('');
  }

  if (report.checked === 0) {
    lines.push('No prompt files matched the provided patterns.', '');
    return lines.join('\n');
  }

  for (const file of report.files) {
    lines.push(`## ${file.path}`, '');
    lines.push(`Result: ${file.ok ? 'PASS' : 'FAIL'}`);
    lines.push(`Placeholders: ${file.placeholders.length > 0 ? file.placeholders.map((name) => `\`{{${name}}}\``).join(', ') : 'none'}`);
    lines.push('');

    if (file.findings.length === 0) {
      lines.push('- No findings.');
    } else {
      for (const finding of file.findings) {
        const field = finding.field ? ` (${finding.field})` : '';
        lines.push(`- ${finding.severity.toUpperCase()} ${finding.code}${field}: ${finding.message}`);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}
