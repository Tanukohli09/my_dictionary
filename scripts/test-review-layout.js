const assert = require('assert/strict');
const fs = require('fs');

const source = fs.readFileSync('src/screens/ReviewScreen.tsx', 'utf8');

assert.match(source, /import \{[^}]*ScrollView[^}]*\} from 'react-native'/s, 'ReviewScreen should import ScrollView');
assert.match(source, /<ScrollView[\s\S]*contentContainerStyle=\{\[styles\.content, isTabletUp && styles\.contentWide\]\}/, 'ReviewScreen should render review content inside a ScrollView');
assert.match(source, /content: \{[^}]*flexGrow: 1/s, 'ReviewScreen scroll content should still fill short screens');

console.log('review layout tests passed');
