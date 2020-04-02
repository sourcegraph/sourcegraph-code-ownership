import { combineLatest, from, Observable } from 'rxjs'
import { startWith, switchMap, filter, map } from 'rxjs/operators'
import * as sourcegraph from 'sourcegraph'
import { getCodeOwners } from './codeownersFile'
import { formatCodeOwners } from './codeOwners'

export function activate(ctx: sourcegraph.ExtensionContext): void {
    ctx.subscriptions.add(
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
                            return { textDocument, owners: await getCodeOwners(textDocument.uri) }
                        } catch (err) {
                            console.error(`Error getting code owners for ${textDocument.uri}:`, err)
                        }
                    }
                    return { textDocument, owners: null }
                })
            )
            .subscribe(({ textDocument, owners }) => {
                const { label, description } = formatCodeOwners(owners)
                sourcegraph.internal.updateContext({
                    [`codeOwnership.file.${textDocument.uri}.label`]: label,
                    [`codeOwnership.file.${textDocument.uri}.description`]: description,
                })
            })
    )
}
