import ignore from 'ignore'
import * as sourcegraph from 'sourcegraph'
import gql from 'tagged-template-noop'
import { resolveURI } from './uri'
import { memoizeAsync } from './util/memoizeAsync'

const getCodeownersFile = memoizeAsync(
    async ({
        uri,
        sourcegraph,
    }: {
        uri: string
        sourcegraph: typeof import('sourcegraph')
    }): Promise<string | null> => {
        const { repo, rev } = resolveURI(uri)
        const { data } = await sourcegraph.commands.executeCommand(
            'queryGraphQL',
            gql`
                query GetCodeownersFile($repo: String!, $rev: String!) {
                    repository(name: $repo) {
                        commit(rev: $rev) {
                            codeownersBlob: blob(path: "CODEOWNERS") {
                                content
                            }
                            githubCodeownersBlob: blob(path: ".github/CODEOWNERS") {
                                content
                            }
                        }
                    }
                }
            `,
            { repo, rev }
        )
        if (!data || !data.repository || !data.repository.commit) {
            throw new Error('repository or commit not found when getting CODEOWNERS file')
        }
        if (data.repository.commit.codeownersBlob && data.repository.commit.codeownersBlob.content) {
            return data.repository.commit.codeownersBlob.content
        }
        if (data.repository.commit.githubCodeownersBlob && data.repository.commit.githubCodeownersBlob.content) {
            return data.repository.commit.githubCodeownersBlob.content
        }
        return null
    },
    ({ uri }) => {
        const { repo, rev } = resolveURI(uri)
        return `${repo}@${rev}`
    }
)

export async function getCodeOwners(uri: string): Promise<string[] | null> {
    const codeownersFile = await getCodeownersFile({ uri, sourcegraph })
    if (!codeownersFile) {
        return null
    }
    const codeownersEntries = parseCodeownersFile(codeownersFile)
    const entry = matchCodeownersFile(resolveURI(uri).path, codeownersEntries)
    if (entry) {
        return entry.owners
    }
    return null
}

/**
 * An individual entry from a CODEOWNERS file
 */
export interface CodeOwnersEntry {
    pattern: string
    owners: string[]
}

/**
 * Parse a CODEOWNERS file into an array of entries (will be in reverse order
 * of the file).
 */
export function parseCodeownersFile(str: string): CodeOwnersEntry[] {
    const entries = []
    const lines = str.split('\n')

    for (const line of lines) {
        const [content] = line.split('#')
        const trimmed = content.trim()
        if (trimmed === '') {
            continue
        }
        const [pattern, ...owners] = trimmed.split(/\s+/)
        entries.push({ pattern, owners })
    }

    return entries.reverse()
}

/**
 * Match a filename against a glob pattern (while respecting .gitignore rules)
 */
export function matchPattern(filename: string, pattern: string): boolean {
    return ignore()
        .add(pattern)
        .ignores(filename)
}

/**
 * Match a filename against CODEOWNERS entries to determine which (if any) it
 * matches.
 */
export function matchCodeownersFile(filename: string, entries: CodeOwnersEntry[]): CodeOwnersEntry | null {
    for (const entry of entries) {
        if (matchPattern(filename, entry.pattern)) {
            return entry
        }
    }
    return null
}
