# Coub Replay

Desktop application for saving and replaying [Coub](https://coub.com/) videos offline. Keep your favorites forever!

## Build

### Prerequisites

- Microsoft Visual Studio with `Desktop development with C++` workload (this includes `cmake` and a C++23 compiler)
- `Node.js` for building the frontend app

### Steps

Build the frontend files first because the next `cmake` configuration step requires them:

```shell
cd frontend
npm ci
npm run build
```

Configure and build [Saucer](https://saucer.app/) application (use `Developer PowerShell for VS`) from the root folder of the project:

```shell
cmake --preset x64-release
cmake --build out/build/x64-release/
```

The resulting binary can be found in `out/build/x64-release/`.

## Usage

`Coub Replay` is a Windows application so you can just launch the executable. Alternatively, path to the input file can be specified as a CLI argument (useful for context menu integration):

```shell
CoubReplay.exe [input_file]
```
