import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Update Backend .env
    print("Updating Backend .env...")
    # Using sed to replace http with https for FRONTEND_URL
    ssh.exec_command("sed -i 's|http://lowcostfreedom.com|https://lowcostfreedom.com|g' /var/www/annecreations/Backend/.env")
    
    # Update Frontend .env (Need to find where it is)
    print("Checking Frontend .env...")
    stdin, stdout, stderr = ssh.exec_command("ls -a /var/www/annecreations/Frontend")
    if ".env" in stdout.read().decode('utf-8'):
         print("Found Frontend .env, updating...")
         ssh.exec_command("sed -i 's|http://api.lowcostfreedom.com|https://api.lowcostfreedom.com|g' /var/www/annecreations/Frontend/.env")
    else:
         print("Frontend .env not found in root, checking .env.production...")
         # Maybe check for other variants or if it's hardcoded in next.config.js
    
    # Update Admin .env
    print("Checking Admin .env...")
    stdin, stdout, stderr = ssh.exec_command("ls -a /var/www/annecreations/Admin")
    if ".env" in stdout.read().decode('utf-8'):
         print("Found Admin .env, updating...")
         ssh.exec_command("sed -i 's|http://api.lowcostfreedom.com|https://api.lowcostfreedom.com|g' /var/www/annecreations/Admin/.env")

    # Restart all processes
    print("Restarting all processes via PM2...")
    ssh.exec_command("pm2 restart all")

    ssh.close()

if __name__ == "__main__":
    main()
