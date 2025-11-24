import { spawn } from 'child_process';

describe('CLI Integration', () => {
  it('should generate text via CLI', (done) => {
    const cli = spawn('npm', ['run', 'dev', 'generate', 'test'], { stdio: 'pipe' });
    let output = '';
    cli.stdout.on('data', (data) => {
      output += data.toString();
    });
    cli.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('Generated: test');
      done();
    });
  });
});
