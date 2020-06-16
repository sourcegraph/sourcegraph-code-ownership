import { combineLatest, from, Observable } from 'rxjs'
import { startWith, switchMap, filter, map } from 'rxjs/operators'
import * as sourcegraph from 'sourcegraph'
import { getCodeOwners } from './codeownersFile'
import { formatCodeOwners } from './codeOwners'
import { resolveURI } from './uri'

export function activate(context: sourcegraph.ExtensionContext): void {
    context.subscriptions.add(
        combineLatest([
            from(sourcegraph.workspace.onDidOpenTextDocument).pipe(
                startWith(
                    sourcegraph.app.activeWindow && sourcegraph.app.activeWindow.activeViewComponent
                        ? sourcegraph.app.activeWindow.activeViewComponent.document
                        : null
                )
            ),
            new Observable(subscriber => sourcegraph.configuration.subscribe(() => subscriber.next())),
        ])
            .pipe(
                map(([textDocument]) => textDocument),
                filter((textDocument): textDocument is NonNullable<typeof textDocument> => !!textDocument),
                switchMap(async textDocument => {
                    if (!sourcegraph.configuration.get().value['codeOwnership.hide']) {
                        try {
                            return { textDocument, resolvedOwnersLine: await getCodeOwners(textDocument.uri) }
                        } catch (error) {
                            console.error(`Error getting code owners for ${textDocument.uri}:`, error)
                        }
                    }
                    return { textDocument, resolvedOwnersLine: null }
                })
            )
            .subscribe(({ textDocument, resolvedOwnersLine }) => {
                const { label, description } = formatCodeOwners(resolvedOwnersLine?.owners)
                const { repo, rev } = resolveURI(textDocument.uri)
                const url =
                    resolvedOwnersLine &&
                    new URL(
                        `${repo}@${rev}/-/blob/${resolvedOwnersLine.path}#L${resolvedOwnersLine.lineNumber}`,
                        sourcegraph.internal.sourcegraphURL
                    ).href
                sourcegraph.internal.updateContext({
                    [`codeOwnership.file.${textDocument.uri}.url`]: url,
                    [`codeOwnership.file.${textDocument.uri}.label`]: label,
                    [`codeOwnership.file.${textDocument.uri}.description`]: description,
                })
            })
    )
}
