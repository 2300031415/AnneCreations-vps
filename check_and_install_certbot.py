import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Check if certbot is installed
    stdin, stdout, stderr = ssh.exec_command("certbot --version")
    ver = stdout.read().decode('utf-8')
    if "certbot" in ver.lower():
        print(f"Certbot already installed: {ver.strip()}")
    else:
        print("Certbot not found, installing...")
        ssh.exec_command("apt update && apt install -y certbot python3-certbot-nginx")
        print("Certbot installation command sent.")

    ssh.close()

if __name__ == "__main__":
    main()
