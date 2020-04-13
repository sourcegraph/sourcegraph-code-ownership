const SHOW_SINGLE_OWNER_MAX_LENGTH = 14

export function formatCodeOwners(
    owners: string[] | null | undefined
): { label: string | null; description: string | null } {
    if (!owners) {
        return { label: null, description: null }
    }
    if (owners.length === 0) {
        return { label: 'No owner', description: 'File has no code owner' }
    }
    if (owners.length === 1) {
        const owner = owners[0]
        return {
            label: owner.length <= SHOW_SINGLE_OWNER_MAX_LENGTH ? `Owner: ${owners[0]}` : 'Owner',
            description: `Code owner: ${owner}`,
        }
    }
    return {
        label: `${owners.length} owners`,
        description: `Code owners: ${owners.join(', ')}`,
    }
}
