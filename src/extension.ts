import { combineLatest, from, Observable } from 'rxjs'
import { startWith } from 'rxjs/operators'
import * as sourcegraph from 'sourcegraph'
import { getCodeOwners } from './codeownersFile'
import { formatCodeOwners } from './codeOwners'

export function activate(ctx: sourcegraph.ExtensionContext): void {
    ctx.subscriptions.add(
        combineLatest(
            from(sourcegraph.workspace.onDidOpenTextDocument).pipe(
                startWith(
                    sourcegraph.app.activeWindow && sourcegraph.app.activeWindow.activeViewComponent
                        ? sourcegraph.app.activeWindow.activeViewComponent.document
                        : null
                )
            ),
            new Observable(subscriber => sourcegraph.configuration.subscribe(() => subscriber.next()))
        ).subscribe(async ([doc]) => {
            if (!doc) {
                return
            }

            let owners: string[] | null = null
            if (!sourcegraph.configuration.get().value['codeOwnership.hide']) {
                try {
                    owners = await getCodeOwners(doc.uri)
                } catch (err) {
                    console.error(`Error getting code owners for ${doc.uri}:`, err)
                }
            }
            const { label, description } = formatCodeOwners(owners)
            sourcegraph.internal.updateContext({
                [`codeOwnership.file.${doc.uri}.label`]: label,
                [`codeOwnership.file.${doc.uri}.description`]: description,
            })
        })
    )
}
