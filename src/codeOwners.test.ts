import expect from 'expect'
import { formatCodeOwners } from './codeOwners'

describe('formatCodeOwners', () => {
    it('formats null', () => expect(formatCodeOwners(null)).toEqual({ label: null, description: null }))
    it('formats empty', () =>
        expect(formatCodeOwners([])).toEqual({ label: 'No owner', description: 'File has no code owner' }))
    it('formats 1', () =>
        expect(formatCodeOwners(['alice'])).toEqual({ label: 'Owner: alice', description: 'Code owner: alice' }))
    it('formats 1 with long name', () =>
        expect(formatCodeOwners(['alice-long-name'])).toEqual({
            label: 'Owner',
            description: 'Code owner: alice-long-name',
        }))
    it('formats 2', () =>
        expect(formatCodeOwners(['alice', 'bob'])).toEqual({
            label: '2 owners',
            description: 'Code owners: alice, bob',
        }))
})
