import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    print("Running Certbot for all domains...")
    # --nginx handles the nginx config
    # --non-interactive disables prompts
    # --agree-tos agrees to terms
    # --email is required for certbot
    # --redirect forces http to https
    cmd = "certbot --nginx -d lowcostfreedom.com -d api.lowcostfreedom.com -d admin.lowcostfreedom.com -d brochure.lowcostfreedom.com --non-interactive --agree-tos --email seelamswapna29@gmail.com --redirect"
    
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    
    print("Certbot Output:")
    print(out)
    if err:
        print("Certbot Error/Warning Logs:")
        print(err)

    ssh.close()

if __name__ == "__main__":
    main()
