import assert from 'assert'
import { formatCodeOwners } from './codeOwners'

describe('formatCodeOwners', () => {
    it('formats null', () => assert.deepStrictEqual(formatCodeOwners(null), { label: null, description: null }))
    it('formats empty', () =>
        assert.deepStrictEqual(formatCodeOwners([]), { label: 'No owner', description: 'File has no code owner' }))
    it('formats 1', () =>
        assert.deepStrictEqual(formatCodeOwners(['alice']), {
            label: 'Owner: alice',
            description: 'Code owner: alice',
        }))
    it('formats 1 with long name', () =>
        assert.deepStrictEqual(formatCodeOwners(['alice-long-name']), {
            label: 'Owner',
            description: 'Code owner: alice-long-name',
        }))
    it('formats 2', () =>
        assert.deepStrictEqual(formatCodeOwners(['alice', 'bob']), {
            label: '2 owners',
            description: 'Code owners: alice, bob',
        }))
})
