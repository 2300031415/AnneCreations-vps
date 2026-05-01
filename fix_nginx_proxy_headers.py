import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    new_config = """client_max_body_size 100M;

server {
    server_name lowcostfreedom.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/lowcostfreedom.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/lowcostfreedom.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    server_name api.lowcostfreedom.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/lowcostfreedom.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/lowcostfreedom.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    server_name admin.lowcostfreedom.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/lowcostfreedom.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/lowcostfreedom.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    server_name brochure.lowcostfreedom.com;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/lowcostfreedom.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/lowcostfreedom.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = lowcostfreedom.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name lowcostfreedom.com;
    return 404;
}

server {
    if ($host = api.lowcostfreedom.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name api.lowcostfreedom.com;
    return 404;
}

server {
    if ($host = admin.lowcostfreedom.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name admin.lowcostfreedom.com;
    return 404;
}

server {
    if ($host = brochure.lowcostfreedom.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name brochure.lowcostfreedom.com;
    return 404;
}
"""
    
    sftp = ssh.open_sftp()
    with sftp.file('/etc/nginx/conf.d/anne_creations.conf', 'w') as f:
        f.write(new_config)
    sftp.close()

    print("Updating Nginx config with standard proxy headers...")
    ssh.exec_command("nginx -t && systemctl reload nginx")
    print("Nginx reloaded.")

    ssh.close()

if __name__ == "__main__":
    main()
