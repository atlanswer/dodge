-- Override formatters
require("conform").setup {
    formatters_by_ft = {
        html = { "biome" },
        javascript = { "biome" },
        typescript = { "biome" },
        typescriptreact = { "biome" },
        json = { "biome" },
        jsonc = { "biome" },
        css = { "biome" },
    },
}

-- Override LSP
vim.lsp.enable("eslint", false)
vim.lsp.config("biome", {
    cmd = { "bunx", "--bun", "biome", "lsp-proxy" },
})
vim.lsp.enable "biome"

