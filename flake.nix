{
    description = "Nix development flake for a project with dependencies.";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils, ... }:
        flake-utils.lib.eachDefaultSystem (system:
        let
            pkgs = import nixpkgs {
              inherit system;
            };
        in {
        devShells.default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
            nodejs_20
            nodePackages.yarn
            nodePackages.node-gyp
            vips
            python3
            prisma-engines
            openssl
            docker-compose
            ];

            buildInputs = with pkgs; [
                at-spi2-atk
                atkmm
                cairo
                gdk-pixbuf
                glib
                gtk3
                harfbuzz
                librsvg
                libsoup_3
                pango
                webkitgtk_4_1
                openssl
            ];

            shellHook = ''
                export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
                export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
                export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
                export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
                export PATH="$PWD/node_modules/.bin/:$PATH"
            '';
        };
    });
}