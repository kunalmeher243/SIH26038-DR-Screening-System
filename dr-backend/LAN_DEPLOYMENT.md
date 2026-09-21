# SERIX LAN Deployment

This guide exposes the FastAPI model service to other devices on the same
local network. The machine running SERIX must stay powered on while the team
uses the web app.

## 1. Find the server LAN IP

On the machine containing this project, run:

```bash
hostname -I
```

Use the private address shown by the command, usually beginning with `192.168.`
or `10.`. In the examples below, replace `SERVER_IP` with that address.

## 2. Start the API for LAN access

From the project directory and with the virtual environment activated:

```bash
source venv/bin/activate
SERIX_CORS_ORIGINS="http://SERVER_IP:5173,http://SERVER_IP:3000" \
uvicorn main:app --host 0.0.0.0 --port 8000
```

For a frontend served from a different port, include its exact origin in the
comma-separated `SERIX_CORS_ORIGINS` value. The origin includes the scheme and
port, but no trailing slash.

Example:

```bash
SERIX_CORS_ORIGINS="http://192.168.1.25:5173" \
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API is then available to other LAN devices at:

```text
http://SERVER_IP:8000
```

Useful checks:

```bash
curl http://SERVER_IP:8000/health
```

Open the interactive API page at `http://SERVER_IP:8000/docs`.

## 3. Configure the web app

The web frontend must call the LAN address, not `localhost`. Set its API base
URL to:

```text
http://SERVER_IP:8000
```

Common frontend environment variable names are `VITE_API_URL`,
`REACT_APP_API_URL`, or `NEXT_PUBLIC_API_URL`; use the name already defined by
the frontend project. Restart the frontend after changing the variable.

If the frontend is running on the same server machine, `localhost` may work in
that browser, but it will fail for teammates' devices because `localhost`
refers to each teammate's own device.

## 4. Verify from another device

1. Connect the phone or laptop to the same Wi-Fi/LAN as the server.
2. Open `http://SERVER_IP:8000/health` in a browser.
3. Confirm the response contains `"status":"ok"`.
4. Open the frontend using the server's frontend URL.
5. Test one retinal image through quality, grade, and report flows.

For a dashboard image element, use the report's `gradcam_image` value directly
as its `src`; it is now returned as a complete `data:image/png;base64,...` URL.
The raw payload remains available as `gradcam_image_base64`.

## Troubleshooting

### Connection refused or timeout

- Confirm Uvicorn was started with `--host 0.0.0.0`, not the default
  `127.0.0.1`.
- Confirm both devices are on the same network.
- Check the server firewall and allow inbound TCP port `8000`.
- Make sure the port is not blocked by guest-Wi-Fi isolation or a VPN.

### CORS error in the browser

Set `SERIX_CORS_ORIGINS` to the frontend's exact origin, for example:

```bash
SERIX_CORS_ORIGINS="http://192.168.1.25:5173"
```

Then restart Uvicorn. Do not add a path such as `/app` or a trailing slash.

### Model errors

The API requires `models/calibrated_model.pt` for `/api/grade` and the grading
portion of `/api/report`. The startup log should say `[startup] Model loaded
successfully.`

## Security boundary

This is intended for a trusted LAN demo. It has no authentication or HTTPS.
Do not expose port `8000` directly to the public internet. Stop the server
after the demonstration or place it behind an authenticated reverse proxy for
any longer-lived deployment.