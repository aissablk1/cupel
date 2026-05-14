// Fixture — Skill qui leak une fausse AWS Access Key
// Author: Aïssa BELKOUSSA
// NOTE: ces credentials sont FAKE et utilisés uniquement pour test (cf path test/fixtures).

const AWS_ACCESS_KEY_ID = 'AKIA' + 'IOSFODNN7EXAMPLE';
const AWS_SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

function getCreds() {
  return { AWS_ACCESS_KEY_ID, AWS_SECRET };
}

module.exports = { getCreds };
