#!/bin/zsh
cd "${0:A:h}"
if [[ -f "$HOME/.codex/bin/frontend-env.sh" ]]; then
 source "$HOME/.codex/bin/frontend-env.sh"
fi
if [[ ! -f node_modules/vite/bin/vite.js ]]; then
 print 'Сначала выполните npm install в этой папке.'
 exit 1
fi
exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5192 --strictPort
