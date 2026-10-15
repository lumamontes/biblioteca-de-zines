import { readFile } from 'node:fs/promises';
import { evaluateViewerBeta, parseBetaEvaluationInput } from '../src/application/reader/beta-evaluation';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: tsx scripts/evaluate-reader-beta.ts <evidence.json>');

const input = parseBetaEvaluationInput(JSON.parse(await readFile(inputPath, 'utf8')));
const evaluation = evaluateViewerBeta(input);
process.stdout.write(`${JSON.stringify(evaluation, null, 2)}\n`);
if (evaluation.decision !== 'expand') process.exitCode = 1;
