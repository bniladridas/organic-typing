{
  description = "Organic Typing development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            python314
            uv
            yamllint
            go
            git
            # BLAS for numpy
            openblas
            lapack
          ];

          shellHook = ''
            echo "Organic Typing development environment"
            echo "Python: $(python --version)"
            echo "Node: $(node --version)"
            echo "Go: $(go version)"
          '';
        };
      });
}
