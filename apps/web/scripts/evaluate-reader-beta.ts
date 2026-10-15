import { readFile } from 'node:fs/promises';
import { evaluateViewerBeta, parseBetaEvaluationInput } from '@/application/reader/beta-evaluation';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: tsx scripts/evaluate-reader-beta.ts <evidence.json>');
const evaluation = evaluateViewerBeta(parseBetaEvaluationInput(JSON.parse(await readFile(inputPath, 'utf8'))));
process.stdout.write(`${JSON.stringify(evaluation, null, 2)}\n`);
if (evaluation.decision !== 'expand') process.exitCode = 1;
