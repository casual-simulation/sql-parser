#!/bin/bash

# Build script for SQL Parser WASM

echo "Building SQL Parser for WASM..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

# Build for web target
echo "Building for web target..."
wasm-pack build --target web --features wasm --out-dir pkg

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "To test the WASM module:"
    echo "1. Serve the examples directory with a local HTTP server"
    echo "2. Open examples/wasm_example.html in your browser"
    echo ""
    echo "Example using Python's built-in server:"
    echo "  python -m http.server 8000"
    echo "  # Then open http://localhost:8000/examples/wasm_example.html"
    echo ""
    echo "Or using Node.js serve:"
    echo "  npx serve ."
    echo "  # Then open the provided URL and navigate to examples/wasm_example.html"
else
    echo "❌ Build failed!"
    exit 1
fi