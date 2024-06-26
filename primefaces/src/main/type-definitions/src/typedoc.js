//@ts-check

const { join, relative } = require("path");
const typedoc = require("typedoc");

const { Paths } = require("./constants");
const { withTemporaryFileOnDisk } = require("./lang-fs");

/**
 * Generates HTML documentation files for the given `*.d.ts` file.
 * @param {TypeDeclarationBundleFiles} sourceFiles 
 * @param {CliArgs} cliArgs
 */
async function generateTypedocs(sourceFiles, cliArgs) {
    const targetDir = cliArgs.typedocOutputDir || join(cliArgs.declarationOutputDir, "jsdocs");
    const app = new typedoc.Application();
    app.options.addReader(new typedoc.TSConfigReader());

    await withTemporaryFileOnDisk(sourceFiles, Paths.NpmVirtualDeclarationFile, async tempFiles => {
        const ambientFile = relative(Paths.NpmRootDir, Paths.NpmVirtualDeclarationFile.ambient)
        const moduleFile = relative(Paths.NpmRootDir, Paths.NpmVirtualDeclarationFile.module)
        const tsConfigFile = relative(Paths.NpmRootDir, Paths.TsConfigTypedocPath);

        /** @type {Partial<import("typedoc").TypeDocOptions>} */
        const typedocOpts = {
            entryPoints: [ambientFile, moduleFile, ...cliArgs.additionalEntries],
            name: "PrimeFaces JavaScript API Docs",
            exclude: [],
            tsconfig: tsConfigFile,
            readme: Paths.JsdocReadmePath,
            disableSources: true,
            externalPattern: [],
            excludeExternals: false,
            excludeInternal: false,
            excludePrivate: false,
            excludeNotDocumented: false,
            excludeProtected: false,
            validation: {
                // https://github.com/TypeStrong/typedoc/issues/1629
                invalidLink: false, // TODO: enable once typedoc supports {@link Class#method} syntax
                notExported: true,
            },
        };
        console.log("Typedoc options:", JSON.stringify(typedocOpts));
        app.bootstrap(typedocOpts);
        const project = app.convert();
        if (!project) {
            throw new Error("Could not create JS api docs, typedoc produced no output.");
        }
        await app.generateDocs(project, targetDir);
        await app.validate(project);
    });
}

module.exports = {
    generateTypedocs,
}