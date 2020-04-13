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
    }): Promise<{ path: string; content: string } | null> => {
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
            return { path: 'CODEOWNERS', content: data.repository.commit.codeownersBlob.content }
        }
        if (data.repository.commit.githubCodeownersBlob && data.repository.commit.githubCodeownersBlob.content) {
            return { path: '.github/CODEOWNERS', content: data.repository.commit.githubCodeownersBlob.content }
        }
        return null
    },
    ({ uri }) => {
        const { repo, rev } = resolveURI(uri)
        return `${repo}@${rev}`
    }
)

export interface ResolvedOwnersLine {
    path: string
    lineNumber: number
    owners: string[]
}

export async function getCodeOwners(uri: string): Promise<ResolvedOwnersLine | null> {
    const codeownersFile = await getCodeownersFile({ uri, sourcegraph })
    if (!codeownersFile) {
        return null
    }
    const codeownersEntries = parseCodeownersFile(codeownersFile.content)
    const matching = codeownersEntries.find(entry => matchPattern(resolveURI(uri).path, entry.pattern))
    if (matching) {
        return { path: codeownersFile.path, lineNumber: matching.lineNumber, owners: matching.owners }
    }
    return null
}

/**
 * An individual entry from a CODEOWNERS file
 */
export interface CodeOwnersEntry {
    lineNumber: number
    pattern: string
    owners: string[]
}

/**
 * Parse a CODEOWNERS file into an array of entries (will be in reverse order
 * of the file).
 */
export function parseCodeownersFile(str: string): CodeOwnersEntry[] {
    const entries: CodeOwnersEntry[] = []
    const lines = str.split('\n')

    for (const [index, lineText] of lines.entries()) {
        const [content] = lineText.split('#')
        const trimmed = content.trim()
        if (trimmed === '') {
            continue
        }
        const [pattern, ...owners] = trimmed.split(/\s+/)
        entries.push({ pattern, owners, lineNumber: index + 1 })
    }

    return entries.reverse()
}

/**
 * Match a filename against a glob pattern (while respecting .gitignore rules)
 */
export function matchPattern(filename: string, pattern: string): boolean {
    return ignore().add(pattern).ignores(filename)
}
