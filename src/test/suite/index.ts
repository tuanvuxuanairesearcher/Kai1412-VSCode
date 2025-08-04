import * as path from 'path';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Use dynamic import for Mocha to avoid CommonJS/ESM issues
  return new Promise(async (c, e) => {
    try {
      const Mocha = (await import('mocha')).default;
      
      // Create the mocha test
      const mocha = new Mocha({
        ui: 'tdd',
        color: true
      });

      const testsRoot = path.resolve(__dirname, '..');

      // Use glob to find test files
      const files = await glob('**/**.test.js', { cwd: testsRoot });
      
      // Add files to the test suite
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      // Run the mocha test
      mocha.run((failures: number) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}