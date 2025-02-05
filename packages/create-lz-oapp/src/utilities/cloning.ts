import { Config, Example } from '@/types'
import { rm } from 'fs/promises'
import { resolve } from 'path'
import tiged from 'tiged'

/**
 * Helper function to satisfy the `tiged` repository URL specification
 *
 * @param example `Example`
 * @returns `string` Repository URL compatible with `tiged`
 */
export const createExampleGitURL = (example: Example): string => {
    return [
        example.repository,
        example.directory ? '/' + example.directory.replace(/^\//, '') : undefined,
        example.ref ? '#' + example.ref.replace(/^#/, '') : undefined,
    ]
        .filter(Boolean)
        .join('')
}

export const cloneExample = async ({ example, destination }: Config) => {
    const url = createExampleGitURL(example)
    const emitter = tiged(url, {
        disableCache: true,
        mode: 'git',
        verbose: true,
    })

    try {
        // First we clone the whole proejct
        await emitter.clone(destination)

        // Then we cleanup what we don't want to be included
        await cleanupExample(destination)
    } catch (error: unknown) {
        try {
            // Let's make sure to clean up after us
            await rm(destination, { recursive: true, force: true })
        } catch {
            // If the cleanup fails let's just do nothing for now
        }

        if (error instanceof Error && 'code' in error) {
            switch (error.code) {
                case 'BAD_SRC':
                    throw new BadGitRefError()

                case 'DEST_NOT_EMPTY':
                    throw new DestinationNotEmptyError()

                case 'ENOENT':
                case 'MISSING_REF':
                    throw new MissingGitRefError()

                case 'COULD_NOT_DOWNLOAD':
                    throw new DownloadError()
            }
        }

        if (error instanceof Error) {
            if (/fatal: couldn't find remote ref/.test(error.message ?? '')) {
                throw new MissingGitRefError()
            }
        }

        throw new CloningError(`Unknown error: ${error}`)
    }
}

// List of files to be removed after the cloning is done
const IGNORED_FILES = ['CHANGELOG.md', 'turbo.json']

/**
 * Helper utility that removes the files we don't want to include in the final project
 * after the cloning is done
 *
 * @param {string} destination The directory containing the cloned project
 */
const cleanupExample = async (destination: string) => {
    for (const fileName of IGNORED_FILES) {
        const filePath = resolve(destination, fileName)

        try {
            await rm(filePath, { force: true })
        } catch {
            // If the cleanup fails let's just do nothing for now
        }
    }
}

export class CloningError extends Error {
    constructor(message: string = 'Unknown error during example cloning') {
        super(message)
    }
}

export class DestinationNotEmptyError extends CloningError {
    constructor(message: string = 'Project destination directory is not empty') {
        super(message)
    }
}

export class MissingGitRefError extends CloningError {
    constructor(message: string = 'Could not find the example repository or branch') {
        super(message)
    }
}

export class BadGitRefError extends CloningError {
    constructor(message: string = 'Malformed repository URL') {
        super(message)
    }
}

export class DownloadError extends CloningError {
    constructor(message: string = 'Could not download the example from repository') {
        super(message)
    }
}
