#!/usr/bin/env bash
set -euo pipefail

mkdir -p relatorios/mobile

HUB_PID=""
APPIUM_PID=""

encerrar() {
  if [ -n "$APPIUM_PID" ]; then
    kill "$APPIUM_PID" 2>/dev/null || true
  fi

  if [ -n "$HUB_PID" ]; then
    kill "$HUB_PID" 2>/dev/null || true
  fi
}

trap encerrar EXIT

aguardar_servico() {
  local endereco="$1"
  local nome="$2"
  local arquivo_log="$3"
  local processo="$4"

  for tentativa in {1..60}; do
    if ! kill -0 "$processo" 2>/dev/null; then
      echo "$nome encerrou antes de ficar disponível."
      cat "$arquivo_log"
      return 1
    fi

    if curl --fail --silent "$endereco" > /dev/null; then
      echo "$nome está pronto."
      return 0
    fi

    sleep 2
  done

  echo "$nome não ficou disponível dentro do prazo."
  cat "$arquivo_log"
  return 1
}

node src/server.js > relatorios/mobile/hub.log 2>&1 &
HUB_PID=$!

./node_modules/.bin/appium \
  --address 127.0.0.1 \
  --port 4723 \
  --allow-insecure=uiautomator2:chromedriver_autodownload \
  > relatorios/mobile/appium.log 2>&1 &
APPIUM_PID=$!

aguardar_servico \
  "http://localhost:3000/api/books" \
  "Hub de Leitura" \
  "relatorios/mobile/hub.log" \
  "$HUB_PID"

aguardar_servico \
  "http://127.0.0.1:4723/status" \
  "Appium" \
  "relatorios/mobile/appium.log" \
  "$APPIUM_PID"

adb devices

npm run test:mobile:report