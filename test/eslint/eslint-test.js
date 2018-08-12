const glob = require('glob');
const { CLIEngine } = require('eslint');
const { assert } = require('chai');

const paths = glob.sync('./+(app|test|routes|public)/**/*.js', {
  ignore: './public/js/codemirror-5.39.2/**/*.js',
});
paths.push('./server.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true,
});

const { results } = engine.executeOnFiles(paths);

function formatMessages(messages) {
  const errors = messages.map(message => `${message.line}:${message.column} ${message.message.slice(0, -1)} - ${message.ruleId}\n`);

  return `\n${errors.join('')}`;
}

function generateTest(result) {
  const { filePath, messages } = result;

  it(`validates ${filePath}`, () => {
    if (messages.length > 0) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

describe('ESLint', () => {
  results.forEach(result => generateTest(result));
});
