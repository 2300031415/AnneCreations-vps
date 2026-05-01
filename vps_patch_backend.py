import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def write_remote_file(ssh, path, content):
    print(f"Writing to {path}...")
    sftp = ssh.open_sftp()
    with sftp.open(path, 'w') as f:
        f.write(content)
    sftp.close()

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Patch Backend (orders.service.ts)
    service_path = "/var/www/annecreations/Backend/src/modules/orders/orders.service.ts"
    sftp = ssh.open_sftp()
    with sftp.open(service_path, 'r') as f:
        content = f.read().decode('utf-8')
    sftp.close()
    
    # Inject 'total' alongside 'totalAmount'
    if "total," not in content and "totalAmount," in content:
        content = content.replace(
            "totalAmount,",
            "totalAmount,\n        total: totalAmount,"
        )
        write_remote_file(ssh, service_path, content)
        print("Backend mapping patched successfully.")
    else:
        print("Could not find the target string or already patched.")
        
    ssh.exec_command("cd /var/www/annecreations/Backend && npm run build && pm2 restart backend")
    print("Backend rebuilt and PM2 restarted.")

    ssh.close()

if __name__ == "__main__":
    main()
