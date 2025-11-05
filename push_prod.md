## Quick test (fast, temporary)
Good for testing your site from a remote server or locally. Not recommended for production because no HTTPS management, no automatic restart, and limited security.

- Copy the repository to your server (SCP, rsync, git clone).
- Install Node (on the server) and run:
```bash
# on the server (Linux)
npx http-server -c-1 -p 5173
# or with npm package installed globally
npx http-server ./ -c-1 -p 5173
```
- If your server has a firewall, open port 5173 (example for Ubuntu with ufw):
```bash
sudo ufw allow 5173/tcp
```
- Visit http://<SERVER_IP>:5173 in your browser.

Notes:
- This uses HTTP only (no TLS). Browsers will warn if you expect HTTPS.
- Use a process manager (pm2) or run inside screen/tmux for persistence, or create a systemd service (see "Process management" below) if you want it to survive reboots.

## Production — recommended approaches

Self-host with Nginx + Let's Encrypt (full control; recommended if you own a server)
This is the usual production path when you control a server and domain.

Prerequisites:
- A domain name. Add an A record (and AAAA if IPv6) pointing to your server's public IP.
- Server (Ubuntu example) with SSH access.

Steps (Ubuntu example):
1) Install Nginx and Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```
2) Copy your built/static files to a web directory, e.g. `/var/www/bibliotheque_prompt`:
```bash
sudo mkdir -p /var/www/bibliotheque_prompt
sudo rsync -av --delete ./ /var/www/bibliotheque_prompt/
sudo chown -R www-data:www-data /var/www/bibliotheque_prompt
```
3) Create an Nginx server block at `/etc/nginx/sites-available/bibliotheque_prompt`:
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/bibliotheque_prompt;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Optional: increase file upload / buffer sizes if needed
}
```
Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/bibliotheque_prompt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
4) Obtain TLS with Certbot:
```bash
sudo certbot --nginx -d example.com -d www.example.com
# follow interactive prompts; Certbot will update nginx config and enable automatic renewal
```
5) Verify https://example.com loads and redirects are correct (Certbot can enable redirect http->https).

Notes:
- You must point DNS to server IP before running Certbot.
- Ensure ports 80 and 443 are allowed in firewall:
```bash
sudo ufw allow 'Nginx Full'   # opens 80 and 443
```

## DNS and SSL key points
- TLS certificate issuance requires that your domain resolves to your server IP (DNS A/AAAA records).
- Let's Encrypt certificates are free and auto-renewable (Certbot sets up a cron job/systemd timer).
